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

export default function Home() {
  const { user, refreshUser } = useAuth();
  const docCount = user?.trialDocCount ?? 0;
  const isTrial = user?.subscriptionStatus === 'trial';
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
  if (isTrial) {
    if (docCount === 1) {
      trialMessage =
        'You have generated your first document. You can generate up to 5 documents or use the app for 7 days before upgrading.';
    } else if (docCount >= 3 && docCount < 5) {
      trialMessage =
        'You are close to the end of your free trial. After 5 documents or 7 days, DOCX downloads will be blocked.';
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 4, bgcolor: 'background.default' }}>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 2.5, md: 3 },
          pt: 3,
        }}
      >
        {/* Hero: date, greeting + inline select event type */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Top row: date + subscription badge */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: 999,
                bgcolor: 'rgba(248, 113, 113, 0.12)', // light red pill
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'error.main',
                }}
              >
                {dayjs().format('dddd, D MMMM YYYY')}
              </Typography>
            </Box>
            <SubscriptionBadge />
          </Box>

          {/* Greeting + inline event type */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'flex-end', lg: 'center', xl:"center" },
              justifyContent: 'space-between',
              
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: '2.5rem' }}
              >
                {greeting}
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontWeight: 700, letterSpacing: '0.02em', color: 'primary.main',  fontSize: '2.5rem' }}
              >
                {firstName}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1.5, maxWidth: 520, lineHeight: 1.7 }}
              >
                Ready to draft another masterpiece? Select a module to begin.
              </Typography>
              {trialMessage && (
                <Alert
                  severity={docCount >= 3 ? 'warning' : 'info'}
                  sx={{ maxWidth: 520, mt: 2 }}
                >
                  {trialMessage}
                </Alert>
              )}
            </Box>

            {/* Inline Select Event Type block */}
            <Box
              sx={{
                minWidth: { md: 420 },
                mt: { xs: 3, md: 0 },
              }}
            >
              <EventTypeToggle />
            </Box>
          </Box>
        </Box>

        {/* 3. PRIMARY WIDGETS SECTION */}
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
    </Box>
  );
}
