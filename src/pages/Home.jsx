import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import Header from '../components/Header.jsx';
import EventTypeToggle from '../components/EventTypeToggle.jsx';
import ClaimantWidget from '../components/ClaimantWidget.jsx';
import AgentWidget from '../components/AgentWidget.jsx';
import UtilitySection from '../components/UtilitySection.jsx';
import MiniCalendarWidget from '../components/MiniCalendarWidget.jsx';
import NotesWidget from '../components/NotesWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SubscriptionBadge from '../components/SubscriptionBadge.jsx';

export default function Home() {
  const { user, refreshUser } = useAuth();
  const docCount = user?.trialDocCount ?? 0;
  const isTrial = user?.subscriptionStatus === 'trial';

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
        {/* Welcome bar: date + subscription badge */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="body2" sx={{ fontFamily:"'Inter', sans-serif", fontSize: '1.25rem',borderBlockEnd: '2px solid rgb(192, 53, 53)' }} color="text.secondary">
            {dayjs().format('dddd, D MMMM YYYY')}
          </Typography>
          <SubscriptionBadge />
          {trialMessage && (
          <Alert
            severity={docCount >= 3 ? 'warning' : 'info'}
            sx={{ 
              mb: 0, 
              maxWidth: 520,
              alignSelf: 'flex-start',
            }}
          >
            {trialMessage}
          </Alert>
        )}
          
        </Box>

        {/* Trial message alert - positioned at top above SELECT EVENT TYPE */}
        

        {/* 2. SELECT EVENT TYPE SECTION */}
        <Box sx={{ mb: 4 }}>
          <EventTypeToggle />
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

        {/* 4. UTILITY SECTION */}
        <Box sx={{ mb: 4 }}>
          <UtilitySection />
        </Box>

        {/* 5. MINI CALENDAR WIDGET + 6. NOTES WIDGET */}
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
