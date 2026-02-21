import dayjs from 'dayjs';
import { Card, CardContent, Typography, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MiniCalendarWidget() {
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const daysInMonth = today.daysInMonth();
  const firstDayOffset = startOfMonth.day();

  const days = [];
  for (let i = 0; i < firstDayOffset; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const isToday = (d) => d === today.date();
  const isFuture = (d) => {
    const date = dayjs().date(d);
    return date.isAfter(today);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CalendarMonthIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            {today.format('MMMM YYYY')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            textAlign: 'center',
          }}
        >
          {DAYS.map((d) => (
            <Typography key={d} variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {d}
            </Typography>
          ))}
          {days.map((d, i) =>
            d === null ? (
              <Box key={`empty-${i}`} />
            ) : (
              <Box
                key={d}
                sx={{
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: isToday(d) ? 'primary.main' : 'transparent',
                  color: isToday(d) ? 'primary.contrastText' : 'text.primary',
                  fontWeight: isToday(d) ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isToday(d) ? 'primary.dark' : 'action.hover',
                    color: isToday(d) ? 'primary.contrastText' : 'primary.main',
                  },
                }}
              >
                {d}
              </Box>
            )
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          Click a date to view event details
        </Typography>
      </CardContent>
    </Card>
  );
}
