import { useMemo, useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, IconButton, Typography, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export default function DateWheelPickerDialog({ open, onClose, value, onConfirm, label = 'Select date' }) {
  const valueDate = useMemo(() => {
    if (!value) return null;
    const d = dayjs(value);
    return d.isValid() ? d.startOf('day') : null;
  }, [value]);

  const initialMonth = useMemo(() => {
    return (valueDate ?? dayjs()).startOf('month');
  }, [valueDate]);

  const today = useMemo(() => dayjs().startOf('day'), []);

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(valueDate); // null until user picks (unless backend value exists)

  const monthLabel = currentMonth.format('MMMM YYYY');

  useEffect(() => {
    if (!open) return;
    setCurrentMonth(initialMonth);
    setSelected(valueDate);
  }, [open, initialMonth, valueDate]);

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

  const handleClose = () => {
    // Design: only a single "CLOSE" button; apply selection if user chose one.
    if (selected) onConfirm?.(selected.format('YYYY-MM-DD'));
    onClose?.();
  };

  const isSameDay = (a, b) => a && b && a.isSame(b, 'day');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '22px',
          bgcolor: '#ffffff',
          width: 360,
          maxWidth: '90vw',
          boxShadow: '0 30px 80px rgba(15,23,42,0.45)',
        },
      }}
    >
      <DialogContent
        sx={{
          pt: 2.2,
          px: 3,
          pb: 4,
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: '#ffffff',
            px: 0,
            py: 1.5,
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.8,
            }}
          >
            <IconButton size="small" onClick={handlePrevMonth}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: '18px',
                color: '#0f172a',
                lineHeight: 1.1,
              }}
            >
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
              rowGap: 1.1,
              columnGap: 0,
              textAlign: 'center',
            }}
          >
            {WEEKDAYS.map((d) => (
              <Typography
                key={d}
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'rgba(100,116,139,0.7)',
                  letterSpacing: '0.06em',
                  fontSize: '14px',
                }}
              >
                {d}
              </Typography>
            ))}
            {days.map((d, idx) => {
              if (!d) {
                return <Box key={`empty-${idx}`} />;
              }
              const isSelected = isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              return (
                <Box
                  key={d.date()}
                  onClick={() => setSelected(d)}
                  //className= "hover:bg-[#eeeeee80] hover:text-[rgba(15,23,42,0.9)] transition-all duration-300"
                  sx={{
                    width: 40,
                    height: 40,
                    mx: 'auto',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: isSelected ? '#ffffff' : isToday ? '#ff385c' : 'rgba(15,23,42,0.9)',
                    bgcolor: isSelected ? '#ff385c' : isToday ? '#ff385c1a' : 'transparent',
                    boxShadow: isSelected
                      ? '0 10px 20px rgba(220,38,38,0.25)'
                      : isToday
                        ? '0 6px 14px rgba(244,63,94,0.16)'
                        : 'none',
                    transition: 'background-color 120ms ease',
                    ":hover": {
                      bgcolor: isSelected ? '#ff385c': isToday ? '#ff385c1a' : '#eeeeee80',
                      color: isSelected ? '#ffffff' : isToday ? '#ff385c' : 'rgba(3, 3, 3, 0.9)',
                    },
                  }}
                >
                  {d.date()}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid rgba(226,232,240,1)', mt: 2, pt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'rgba(100,116,139,1)',
              fontWeight: 700,
              px: 2.2,
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

