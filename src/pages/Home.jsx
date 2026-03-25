import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Header from '../components/Header.jsx';
import EventTypeToggle from '../components/EventTypeToggle.jsx';
import ClaimantWidget from '../components/ClaimantWidget.jsx';
import AgentWidget from '../components/AgentWidget.jsx';
import MiniCalendarWidget from '../components/MiniCalendarWidget.jsx';
import NotesWidget from '../components/NotesWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SubscriptionBadge from '../components/SubscriptionBadge.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';

export default function Home() {
  const { user, refreshUser } = useAuth();
  const { country, countryTimezoneId, setCountry, setCountryLabel, setCountryTimezone } = useApp();
  const [timeData, setTimeData] = useState(null);
  const [timeError, setTimeError] = useState('');
  const docCount = user?.trialDocCount ?? 0;
  const isTrial = user?.subscriptionStatus === 'trial';
  const isAdminUser = user?.role === 'admin';
  const displayName =
    (user?.name && String(user.name).trim()) ||
    (user?.email && String(user.email).trim()) ||
    'there';

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    setTimeError('');

    const loadTime = async () => {
      try {
        const params = new URLSearchParams();
        params.set('country', country);
        if (countryTimezoneId) params.set('timezoneId', countryTimezoneId);

        const res = await api(`/countries/current-time?${params.toString()}`, { method: 'GET' });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || 'Failed to load time');
        }
        const data = await res.json();
        if (!cancelled) {
          setTimeData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setTimeError(err.message || 'Failed to load time');
          setTimeData(null);
        }
      }
    };

    loadTime();

    return () => {
      cancelled = true;
    };
  }, [country, countryTimezoneId]);

  const { greeting, formattedDate } = useMemo(() => {
    if (timeData?.ok) {
      return {
        greeting: timeData.greeting,
        formattedDate: timeData.formattedDate,
      };
    }
    const fallbackNow = new Date();
    return {
      greeting: fallbackNow.getHours() < 12
        ? 'Good Morning,'
        : fallbackNow.getHours() < 18
        ? 'Good Afternoon,'
        : 'Good Evening,',
      formattedDate: dayjs(fallbackNow).format('dddd, D MMMM YYYY'),
    };
  }, [timeData]);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  // Default country from detected signup country (only when app is still on default India).
  useEffect(() => {
    const detected = String(user?.signupCountry || '').trim();
    if (!detected) return;
    const current = String(country || '').trim();
    if (!current || current.toLowerCase() === 'india') {
      setCountry(detected);
      setCountryLabel(detected);
      setCountryTimezone(null);
    }
  }, [user?.signupCountry, country, setCountry, setCountryLabel, setCountryTimezone]);

  let trialMessage = '';
  if (isTrial && !isAdminUser) {
    if (docCount === 1) {
      trialMessage =
        'You have generated your first document. You can generate up to 5 documents or use the app for 7 days before upgrading.';
    } else if (docCount >= 3 && docCount < 5) {
      trialMessage =
        'You are close to the end of your free trial. After 5 documents or 7 days, DOCX downloads will be blocked.';
    }
  }

  return (
  <Box
    sx={(theme) => ({
      minHeight: '100vh',
      pb: 4,
      // Use theme background so dark mode applies correctly on the dashboard
      bgcolor: theme.palette.background.default,
    })}
  >
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 1.5, sm: 2.5, md: 3 },
          pt: 3,
        }}
      >
        {/* HERO SECTION: Two Column Layout */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-start' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 4, md: 5 },
          }}
        >
          {/* LEFT COLUMN: Greeting + Description */}
          <Box sx={{ flex: 1 }}>
            {/* Date Badge */}
            <Box
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5.25px',
                px: '8px',
                py: '3px',
                borderRadius: '8px',
                // Slightly stronger pill in dark mode, lighter in light mode
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(248,113,113,0.22)'
                    : 'rgba(248,113,113,0.12)',
                color: theme.palette.error.main,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                lineHeight: '15px',
                marginBottom: '5px',
              })}
            >
              <CalendarMonthIcon sx={{ fontSize: 10 }} />
              {formattedDate}
            </Box>

            {/* Greeting */}
            <Typography
              sx={{
                fontSize: { xs: '2.4rem', sm: '3rem', md: '3.4rem' },
                fontWeight: 700,
                lineHeight: { xs: '1.1', md: '1.15' },
                // Adapt to theme text color (light/dark)
                color: 'text.primary',
                marginBottom: { xs: 1.5, md: 2 },
              }}
            >
              {greeting}
              <br />
              <span
                style={{
                  backgroundClip: 'text',
                  backgroundImage: 'linear-gradient(90deg, rgb(249, 115, 22), rgb(255, 56, 92))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                {displayName}
              </span>
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: { xs: 13.5, sm: 14.5, md: 15 },
                fontWeight: 500,
                color: 'text.secondary',
                marginBottom: { xs: 1.5, md: 2 },
                lineHeight: '24px',
              }}
            >
              Ready to draft another masterpiece?
              <br />
              Select a module to begin.
            </Typography>

            {/* Trial Message */}
            {trialMessage && (
              <Alert severity={docCount >= 3 ? 'warning' : 'info'} sx={{ maxWidth: 520 }}>
                {trialMessage}
              </Alert>
            )}
          </Box>

          {/* RIGHT COLUMN: Event Type Toggle */}
          <Box
            sx={{
              minWidth: { md: 420 },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <EventTypeToggle />
          </Box>
        </Box>

        {/* PRIMARY WIDGETS SECTION */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 4,
          }}
        >
          <ClaimantWidget />
          <AgentWidget />
        </Box>

        {/* MINI CALENDAR WIDGET + NOTES WIDGET */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          <MiniCalendarWidget />
          <NotesWidget />
        </Box>
      </Container>
      <SiteFooter />
    </Box>
  );
}
