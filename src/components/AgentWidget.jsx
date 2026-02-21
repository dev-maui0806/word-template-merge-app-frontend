import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const AGENT_ITEMS = [
  { label: 'FA Traveled to Attend', path: '/form/fa-traveled-to-attend' },
  { label: 'FA Booked Flight Ticket', path: '/form/fa-booked-flight-ticket' },
  { label: 'FA Cancelled Flight Ticket', path: '/form/fa-cancelled-flight-ticket' },
  { label: 'FA Traveled Back', path: '/form/fa-traveled-back' },
  { label: 'FA Attend', path: '/form/fa-attend' },
];

export default function AgentWidget() {
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
          Agent
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {AGENT_ITEMS.map((item) => (
            <Box
              key={item.label}
              component={Link}
              to={item.path}
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
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
