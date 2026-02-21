import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useApp } from '../context/AppContext.jsx';

const CLAIMANT_ITEMS = [
  { label: 'Arrange Venue', path: '/form/arrange-venue', requiresEventType: true },
  { label: 'Cancel Venue', path: '/form/cancel-venue' },
  { label: 'Arrange Transportation', path: '/form/arrange-transportation' },
  { label: 'Cancel Transportation', path: '/form/cancel-transportation' },
  { label: 'Arrange Accommodation', path: '/form/arrange-accommodation' },
  { label: 'Cancel Accommodation', path: '/form/cancel-accommodation' },
  { label: 'Arrange Notary', path: '/form/arrange-notary' },
  { label: 'Cancel Notary', path: '/form/cancel-notary' },
  { label: 'Arrange ENT Test', path: '/form/arrange-ent-test' },
  { label: 'Cancel ENT Test', path: '/form/cancel-ent-test' },
  { label: 'No Transportation Needed', path: '/form/no-transportation-needed' },
  { label: 'Contact Claimant', path: '/form/contact-claimant' },
];

export default function ClaimantWidget() {
  const { eventType } = useApp();
  const navigate = useNavigate();

  const handleClick = (e, item) => {
    if (item.requiresEventType && !eventType) {
      e.preventDefault();
      window.alert('Please select an Event Type before continuing.');
      return;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography
          variant="h2"
          color="primary"
          sx={{ mb: 2, fontSize: '1.25rem', fontWeight: 700, fontFamily:"'Inter', sans-serif" }}
        >
          Claimant
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5,
          }}
        >
          {CLAIMANT_ITEMS.map((item) => {
            const isFullRow =
              item.label === 'No Transportation Needed' || item.label === 'Contact Claimant';
            return (
              <Box
                key={item.label}
                sx={{
                  gridColumn: isFullRow ? '1 / -1' : undefined,
                }}
              >
                <Box
                  component={Link}
                  to={item.path}
                  onClick={(e) => handleClick(e, item)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.75,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {item.label}
                  </Typography>
                  <ChevronRightIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
