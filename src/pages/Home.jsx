import dayjs from 'dayjs';
import { useEffect } from 'react';
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

export default function Home() {
  const { user, refreshUser } = useAuth();
  const docCount = user?.trialDocCount ?? 0;
  const isTrial = user?.subscriptionStatus === 'trial';
  const isAdminUser = user?.role === 'admin';
  const firstName =
    user?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  const hour = dayjs().hour();
  const greeting =
    hour < 12 ? 'Good Morning,' :
    hour < 18 ? 'Good Afternoon,' :
    'Good Evening,';

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

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
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 4,
            mb: 5,
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
              {dayjs().format('dddd, D MMMM YYYY')}
            </Box>

            {/* Greeting */}
            <Typography
              sx={{
                fontSize: '52px',
                fontWeight: 700,
                lineHeight: '59.8px',
                // Adapt to theme text color (light/dark)
                color: 'text.primary',
                marginBottom: '16px',
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
                {firstName}
              </span>
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'text.secondary',
                marginBottom: '16px',
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
          <Box sx={{ minWidth: { md: 420 } }}>
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
