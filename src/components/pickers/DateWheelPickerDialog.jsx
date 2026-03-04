import { useMemo, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export default function DateWheelPickerDialog({ open, onClose, value, onConfirm, label = 'Select date' }) {
  const initial = useMemo(() => {
    if (value && dayjs(value).isValid()) {
      return dayjs(value);
    }
    return dayjs();
  }, [value]);

  const [currentMonth, setCurrentMonth] = useState(initial.startOf('month'));
  const [selected, setSelected] = useState(initial.startOf('day'));

  const monthLabel = currentMonth.format('MMMM YYYY');

  const daysInMonth = currentMonth.daysInMonth();
  const firstWeekday = currentMonth.day(); // 0-6

  const days = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    days.push(currentMonth.date(d));
  }

  const handlePrevMonth = () => {
    setCurrentMonth((m) => m.subtract(1, 'month').startOf('month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((m) => m.add(1, 'month').startOf('month'));
  };

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm?.(selected.format('YYYY-MM-DD'));
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const isSameDay = (a, b) => a && b && a.isSame(b, 'day');

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: '#ffffff',
          width: 320,
          maxWidth: '90vw',
          boxShadow: '0 30px 80px rgba(15,23,42,0.45)',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 1.5,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(148,163,184,1)' }}
        >
          {label}
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: 1,
          px: 3,
          pb: 2.5,
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: '#f9fafb',
            px: 2,
            py: 2,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <IconButton size="small" onClick={handlePrevMonth}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {monthLabel}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              rowGap: 1,
              columnGap: 0.5,
              textAlign: 'center',
            }}
          >
            {WEEKDAYS.map((d) => (
              <Typography
                key={d}
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'rgba(148,163,184,1)',
                  letterSpacing: '0.08em',
                }}
              >
                {d}
              </Typography>
            ))}
            {days.map((d, idx) => {
              if (!d) {
                return <Box key={`empty-${idx}`} />;
              }
              const active = isSameDay(d, selected);
              return (
                <Box
                  key={d.date()}
                  onClick={() => setSelected(d)}
                  sx={{
                    width: 32,
                    height: 32,
                    mx: 'auto',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: active ? '#ffffff' : 'rgba(15,23,42,0.9)',
                    bgcolor: active ? '#f97373' : 'transparent',
                    boxShadow: active ? '0 4px 10px rgba(248,113,113,0.6)' : 'none',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: active ? '#f97373' : 'rgba(148,163,184,0.15)',
                    },
                  }}
                >
                  {d.date()}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            onClick={handleCancel}
            sx={{
              textTransform: 'none',
              color: 'rgba(148,163,184,1)',
              fontWeight: 600,
            }}
          >
            Close calendar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{
              ml: 1.5,
              textTransform: 'none',
              px: 3,
              borderRadius: 999,
              bgcolor: '#020617',
              '&:hover': { bgcolor: '#020617' },
            }}
          >
            Confirm
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

