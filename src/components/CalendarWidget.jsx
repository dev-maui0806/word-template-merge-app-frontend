import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import { api } from '../api/client.js';

const STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'NOT_COMPLETED', label: 'NOT COMPLETED' },
];

const COMPLETED_BG = 'rgba(46, 125, 50, 0.15)';
const NOT_COMPLETED_BG = 'rgba(255, 152, 0, 0.15)';

function CustomDay(props) {
  const { day, eventDates, ...other } = props;
  const dateStr = day ? dayjs(day).format('YYYY-MM-DD') : '';
  const isToday = day && dayjs(day).isSame(dayjs(), 'day');
  const isAllotted = eventDates?.has(dateStr) ?? false;

  return (
    <PickersDay
      {...other}
      day={day}
      disableHighlightToday
      sx={{
        ...(isToday && {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 600,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          '&.Mui-selected': {
            bgcolor: 'primary.dark',
            color: 'primary.contrastText',
          },
        }),
        ...(isAllotted && {
          position: 'relative',
          pb: 1.5,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: isToday ? 'primary.contrastText' : 'primary.main',
          },
        }),
      }}
    />
  );
}

export default function CalendarWidget({ open, onClose }) {
  const [events, setEvents] = useState([]);
  const [eventDates, setEventDates] = useState(new Set());
  const [viewMonth, setViewMonth] = useState(dayjs().startOf('month'));
  const [loading, setLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const from = dayjs().startOf('day').format('YYYY-MM-DD');
      const to = dayjs().add(1, 'year').format('YYYY-MM-DD');
      const res = await api(`/events?from=${from}&to=${to}`, { method: 'GET' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load events');
      }
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventDates = useCallback(async () => {
    setDatesLoading(true);
    try {
      const from = viewMonth.format('YYYY-MM-DD');
      const to = viewMonth.add(2, 'month').format('YYYY-MM-DD');
      const res = await api(`/events/dates?from=${from}&to=${to}`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load dates');
      const data = await res.json();
      setEventDates(new Set(Array.isArray(data) ? data : []));
    } catch {
      setEventDates(new Set());
    } finally {
      setDatesLoading(false);
    }
  }, [viewMonth]);

  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open, fetchEvents]);

  useEffect(() => {
    if (open) {
      fetchEventDates();
    }
  }, [open, viewMonth, fetchEventDates]);

  const handleDateSelect = async (date) => {
    if (!date || date.isBefore(dayjs().startOf('day'))) return;
    setCreating(true);
    setError('');
    try {
      const res = await api('/events', {
        method: 'POST',
        body: JSON.stringify({
          date: date.format('YYYY-MM-DD'),
          status: 'NOT_COMPLETED',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create event');
      }
      const created = await res.json();
      setEvents((prev) => [...prev, created].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setEventDates((prev) => new Set([...prev, date.format('YYYY-MM-DD')]));
      fetchEventDates();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleUpdateEvent = async (id, field, value) => {
    try {
      const res = await api(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update');
      }
      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      if (field === 'status' || (field === 'date' && value)) {
        fetchEventDates();
      }
    } catch (err) {
      setError(err.message || 'Failed to update event');
    }
  };

  const handleStatusChange = (id, value) => {
    handleUpdateEvent(id, 'status', value);
  };

  const handleDeleteEvent = async (id) => {
    try {
      const res = await api(`/events/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
      fetchEventDates();
    } catch (err) {
      setError(err.message || 'Failed to delete schedule');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Save future events and see allotted vs available dates at a glance
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="medium">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2, px: 3, pb: 3 }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Calendar */}
          <Box
            sx={{
              flex: { lg: '0 0 340px' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Allotted dates (filled) vs available dates — select a future date to add an event
              </Typography>
            </Box>
            <DateCalendar
              key={`calendar-${eventDates.size}-${events.length}`}
              value={null}
              referenceDate={viewMonth}
              onChange={(date) => date && handleDateSelect(date)}
              onMonthChange={(date) => setViewMonth(dayjs(date).startOf('month'))}
              minDate={dayjs().startOf('day')}
              maxDate={dayjs().add(2, 'year')}
              disabled={creating}
              slots={{
                day: (props) => <CustomDay {...props} eventDates={eventDates} />,
              }}
              sx={{
                '& .MuiPickersCalendarHeader-label': { fontWeight: 600 },
              }}
            />
          </Box>

          {/* Event table */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Future events
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No events yet. Select a date in the calendar to create one.
              </Typography>
            ) : (
              <TableContainer
                component={Box}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'auto',
                  maxHeight: 420,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['DATE', 'CASE DETAILS', 'VENUE', 'CASE MANAGER', 'STATUS', 'ISSUE', ''].map((h) => (
                        <TableCell
                          key={h || 'action'}
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            letterSpacing: '0.05em',
                            bgcolor: 'action.hover',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            py: 1.25,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          bgcolor: row.status === 'COMPLETED' ? COMPLETED_BG : NOT_COMPLETED_BG,
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor:
                              row.status === 'COMPLETED'
                                ? 'rgba(46, 125, 50, 0.22)'
                                : 'rgba(255, 152, 0, 0.22)',
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1, minWidth: 100 }}>
                          {dayjs(row.date).format('D MMM YYYY')}
                        </TableCell>
                        <TableCell sx={{ py: 0.5, minWidth: 140 }}>
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="—"
                            value={row.caseDetails || ''}
                            onChange={(e) => handleFieldChange(row.id, 'caseDetails', e.target.value)}
                            onBlur={(e) => handleUpdateEvent(row.id, 'caseDetails', e.target.value.trim())}
                            sx={{ '& .MuiInput-input': { fontSize: '0.85rem' } }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, minWidth: 100 }}>
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="—"
                            value={row.venue || ''}
                            onChange={(e) => handleFieldChange(row.id, 'venue', e.target.value)}
                            onBlur={(e) => handleUpdateEvent(row.id, 'venue', e.target.value.trim())}
                            sx={{ '& .MuiInput-input': { fontSize: '0.85rem' } }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, minWidth: 100 }}>
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="—"
                            value={row.caseManager || ''}
                            onChange={(e) => handleFieldChange(row.id, 'caseManager', e.target.value)}
                            onBlur={(e) => handleUpdateEvent(row.id, 'caseManager', e.target.value.trim())}
                            sx={{ '& .MuiInput-input': { fontSize: '0.85rem' } }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, minWidth: 140 }}>
                          <Select
                            size="small"
                            value={row.status || 'NOT_COMPLETED'}
                            onChange={(e) => handleStatusChange(row.id, e.target.value)}
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              minWidth: 130,
                              '& .MuiSelect-select': { py: 0.5 },
                            }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell sx={{ py: 0.5, minWidth: 120 }}>
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="—"
                            value={row.issue || ''}
                            onChange={(e) => handleFieldChange(row.id, 'issue', e.target.value)}
                            onBlur={(e) => handleUpdateEvent(row.id, 'issue', e.target.value.trim())}
                            sx={{ '& .MuiInput-input': { fontSize: '0.85rem' } }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, width: 56, textAlign: 'right' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEvent(row.id)}
                            aria-label="Cancel schedule"
                            sx={{ color: 'error.main' }}
                          >
                            <EventBusyIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
