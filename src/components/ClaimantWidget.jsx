import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useApp } from '../context/AppContext.jsx';

const CLAIMANT_ITEMS = [
  { label: 'Arrange Venue', path: '/form/arrange-venue', requiresEventType: true },
  { label: 'Cancel Venue', path: '/form/cancel-venue' },
  { label: 'Arrange Transportation', path: '/form/arrange-transportation' },
  { label: 'Cancel Transportation', path: '/form/cancel-transportation' },
  { label: 'Arrange Notary', path: '/form/arrange-notary' },
  { label: 'Cancel Notary', path: '/form/cancel-notary' },
  { label: 'Arrange Ent Test', path: '/form/arrange-ent-test' },
  { label: 'Cancel Ent Test', path: '/form/cancel-ent-test' },
  { label: 'Arrange Accommodation', path: '/form/arrange-accommodation' },
  { label: 'Cancel Accommodation', path: '/form/cancel-accommodation' },
  { label: 'Contact Claimant', path: null, isContactClaimant: true, fullWidth: true },
];

const CONTACT_CLAIMANT_OPTIONS = [
  { label: 'Required Transportation', path: '/form/contact-claimant-required-transportation' },
  { label: 'NOT Required Transportation', path: '/form/contact-claimant-not-required-transportation' },
  { label: 'Required both accommodation and Transportation', path: '/form/contact-claimant-required-both' },
];

export default function ClaimantWidget() {
  const { eventType } = useApp();
  const navigate = useNavigate();
  const [contactClaimantOpen, setContactClaimantOpen] = useState(false);

  const handleClick = (e, item) => {
    if (item.requiresEventType && !eventType) {
      e.preventDefault();
      window.alert('Please select an Event Type before continuing.');
      return;
    }
    if (item.isContactClaimant) {
      e.preventDefault();
      setContactClaimantOpen(true);
    }
  };

  const handleContactClaimantOption = (path) => {
    setContactClaimantOpen(false);
    navigate(path);
  };

  return (
    <>
    <Card
      sx={(theme) => {
        const isDark = theme.palette.mode === 'dark';
        return {
          height: '100%',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
          boxShadow: isDark
            ? '0 18px 45px rgba(0,0,0,0.9)'
            : '0 18px 45px rgba(15,23,42,0.12)',
          transform: 'translateY(0) scale(1)',
          transition: 'background-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 26px 60px rgba(0,0,0,1)'
              : '0 26px 60px rgba(15,23,42,0.18)',
            transform: 'translateY(-2px) scale(1.01)',
          },
        };
      }}
    >
      <CardContent sx={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography
          sx={{
            backgroundClip: 'text',
            backgroundImage: 'linear-gradient(90deg, rgb(255, 56, 92), rgb(243, 63, 96))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-1.3px',
            lineHeight: '31.2px',
            marginBottom: '24px',
            fontFamily: 'system-ui',
          }}
        >
          Claimant
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexFlow: 'row wrap',
            flexWrap: 'wrap',
            marginLeft: '-8px',
            marginRight: '-8px',
            marginTop: '-16px',
          }}
        >
          {CLAIMANT_ITEMS.map((item) => (
            <Box
              key={item.label}
              sx={{
                marginTop: '16px',
                maxWidth: '100%',
                paddingLeft: '8px',
                paddingRight: '8px',
                width: item.fullWidth ? '100%' : '50%',
              }}
            >
              <Box
                component={item.path ? Link : 'button'}
                to={item.path || undefined}
                type={item.path ? undefined : 'button'}
                onClick={(e) => handleClick(e, item)}
                sx={(theme) => {
                  const isDark = theme.palette.mode === 'dark';
                  return {
                    ...(item.isContactClaimant && { outline: 'none', font: 'inherit', textAlign: 'left' }),
                    alignItems: 'center',
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgb(243, 244, 246)',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.12)'
                      : '#ffffff',
                    color: theme.palette.text.primary,
                    cursor: 'pointer',
                    display: 'flex',
                    fontSize: '14px',
                    fontWeight: 500,
                    justifyContent: 'space-between',
                    lineHeight: '21px',
                    paddingBottom: '14px',
                    paddingLeft: '14px',
                    paddingRight: '14px',
                    paddingTop: '14px',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
                    width: '100%',
                    '&:hover': {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : '#ffffff',
                      borderColor: 'rgba(255, 56, 92, 0.3)',
                      color: isDark ? '#fecaca' : 'rgb(255, 56, 92)',
                      boxShadow: isDark
                        ? '0 16px 40px rgba(0,0,0,0.8)'
                        : '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      '& svg': {
                        color: isDark ? '#fecaca' : 'rgb(255, 56, 92)',
                      },
                    },
                  };
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'inherit',
                  }}
                >
                  {item.label}
                </Typography>
                <Box sx={{ color: 'inherit', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transitionDuration: '0.3s' }}>
                  <ChevronRightIcon sx={{ fontSize: '14px' }} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>

    <Dialog open={contactClaimantOpen} onClose={() => setContactClaimantOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Contact Claimant – Claimant Replied</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose the option that applies:
        </Typography>
        <List disablePadding>
          {CONTACT_CLAIMANT_OPTIONS.map((opt) => (
            <ListItemButton
              key={opt.path}
              onClick={() => handleContactClaimantOption(opt.path)}
              sx={(theme) => {
                const isDark = theme.palette.mode === 'dark';
                return {
                  borderRadius: '12px',
                  mb: 0.5,
                  justifyContent: 'space-between',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgb(243, 244, 246)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#ffffff',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                    borderColor: 'rgba(255, 56, 92, 0.3)',
                  },
                };
              }}
            >
              <ListItemText primary={opt.label} primaryTypographyProps={{ fontWeight: 500 }} />
              <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.7 }} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  </>
  );
}
