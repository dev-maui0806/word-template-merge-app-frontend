import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { api } from '../api/client.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COMPLETED_BG = 'rgba(46, 125, 50, 0.15)';
const NOT_COMPLETED_BG = 'rgba(255, 152, 0, 0.15)';

export default function MiniCalendarWidget() {
  const [viewMonth, setViewMonth] = useState(dayjs().startOf('month'));
  const [eventDates, setEventDates] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsForDate, setEventsForDate] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const today = dayjs();
  const monthStart = viewMonth.clone().startOf('month');
  const daysInMonth = viewMonth.daysInMonth();
  const firstDayOffset = monthStart.day();

  const days = [];
  for (let i = 0; i < firstDayOffset; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const fetchEventDates = useCallback(async () => {
    try {
      const from = viewMonth.format('YYYY-MM-DD');
      const to = viewMonth.add(2, 'month').format('YYYY-MM-DD');
      const res = await api(`/events/dates?from=${from}&to=${to}`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setEventDates(new Set(Array.isArray(data) ? data : []));
    } catch {
      setEventDates(new Set());
    }
  }, [viewMonth]);

  useEffect(() => {
    fetchEventDates();
  }, [fetchEventDates]);

  const getDateForDay = (d) => viewMonth.date(d);
  const isToday = (d) => getDateForDay(d).isSame(today, 'day');
  const isPast = (d) => getDateForDay(d).isBefore(today, 'day');
  const isAllotted = (d) => {
    const dateStr = getDateForDay(d).format('YYYY-MM-DD');
    return eventDates.has(dateStr);
  };

  const handleDayClick = async (d) => {
    const date = getDateForDay(d);
    if (date.isBefore(today, 'day')) return;
    setSelectedDate(date);
    setModalOpen(true);
    setModalLoading(true);
    setEventsForDate([]);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const res = await api(`/events?from=${dateStr}&to=${dateStr}`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setEventsForDate(Array.isArray(data) ? data : []);
      }
    } catch {
      setEventsForDate([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handlePrevMonth = () => {
    const next = viewMonth.subtract(1, 'month');
    if (next.isBefore(today, 'month')) return;
    setViewMonth(next);
  };

  const handleNextMonth = () => {
    setViewMonth(viewMonth.add(1, 'month'));
  };

  const canGoPrev = viewMonth.isAfter(today, 'month');

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              {viewMonth.format('MMMM YYYY')}
            </Typography>
          </Box>
          <Box>
            <IconButton size="small" onClick={handlePrevMonth} disabled={!canGoPrev} aria-label="Previous month">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth} aria-label="Next month">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
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
                onClick={() => handleDayClick(d)}
                sx={{
                  py: 0.75,
                  pb: isAllotted(d) ? 1.25 : 0.75,
                  borderRadius: 1,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: isToday(d) ? 'primary.main' : 'transparent',
                  color: isToday(d) ? 'primary.contrastText' : isPast(d) ? 'text.disabled' : 'text.primary',
                  fontWeight: isToday(d) ? 600 : 400,
                  cursor: isPast(d) ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isPast(d) ? 0.6 : 1,
                  '&:hover': isPast(d)
                    ? {}
                    : {
                        bgcolor: isToday(d) ? 'primary.dark' : 'action.hover',
                        color: isToday(d) ? 'primary.contrastText' : 'primary.main',
                      },
                }}
              >
                {d}
                {isAllotted(d) && (
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: isToday(d) ? 'primary.contrastText' : 'primary.main',
                    }}
                  />
                )}
              </Box>
            )
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          Click a date to view event details
        </Typography>
      </CardContent>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Events — {selectedDate ? selectedDate.format('D MMMM YYYY') : ''}
          </Typography>
          <IconButton aria-label="Close" onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {modalLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : eventsForDate.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No events scheduled for this date.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {eventsForDate.map((ev, idx) => (
                <Box
                  key={ev.id || idx}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: ev.status === 'COMPLETED' ? COMPLETED_BG : NOT_COMPLETED_BG,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      size="small"
                      label={ev.status || 'NOT_COMPLETED'}
                      color={ev.status === 'COMPLETED' ? 'success' : 'warning'}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </Box>
                  {ev.caseDetails && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Case details:</strong> {ev.caseDetails}
                    </Typography>
                  )}
                  {ev.venue && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Venue:</strong> {ev.venue}
                    </Typography>
                  )}
                  {ev.caseManager && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Case manager:</strong> {ev.caseManager}
                    </Typography>
                  )}
                  {ev.issue && (
                    <Typography variant="body2">
                      <strong>Issue:</strong> {ev.issue}
                    </Typography>
                  )}
                  {!ev.caseDetails && !ev.venue && !ev.caseManager && !ev.issue && (
                    <Typography variant="body2" color="text.secondary">
                      No details entered
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
