import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Dialog, DialogContent, Button, Typography } from '@mui/material';

function pad2(n) {
  return n.toString().padStart(2, '0');
}

export default function TimeWheelPickerDialog({ open, onClose, value, onConfirm, label = 'Select time' }) {
  const ITEM_HEIGHT = 48;
  const VISIBLE_ROWS = 5;
  const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
  const EDGE_SPACER = ITEM_HEIGHT * 2;

  const initial = useMemo(() => {
    if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(':').map((v) => parseInt(v, 10));
      if (!Number.isNaN(h) && !Number.isNaN(m)) return { hour: h, minute: m };
    }
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  }, [value]);

  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const currentDisplay = `${pad2(hour)}:${pad2(minute)}`;

  useEffect(() => {
    if (!open) return;
    setHour(initial.hour);
    setMinute(initial.minute);

    requestAnimationFrame(() => {
      if (hourListRef.current) hourListRef.current.scrollTop = initial.hour * ITEM_HEIGHT;
      if (minuteListRef.current) minuteListRef.current.scrollTop = initial.minute * ITEM_HEIGHT;
    });
  }, [open, initial.hour, initial.minute]);

  const handleConfirm = () => {
    onConfirm?.(currentDisplay);
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const handleHourScroll = (e) => {
    const idx = clamp(Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT), 0, 23);
    setHour(idx);
  };

  const handleMinuteScroll = (e) => {
    const idx = clamp(Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT), 0, 59);
    setMinute(idx);
  };

  const scrollToHour = (h) => {
    if (!hourListRef.current) return;
    hourListRef.current.scrollTo({ top: h * ITEM_HEIGHT, behavior: 'smooth' });
  };

  const scrollToMinute = (m) => {
    if (!minuteListRef.current) return;
    minuteListRef.current.scrollTo({ top: m * ITEM_HEIGHT, behavior: 'smooth' });
  };

  const wheelListSx = {
    height: LIST_HEIGHT,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    scrollSnapType: 'y mandatory',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
    maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
    '&::-webkit-scrollbar': { display: 'none' },
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          borderRadius: '22px',
          bgcolor: '#ffffff',
          width: 330,
          maxWidth: '90vw',
          boxShadow: '0 30px 80px rgba(15,23,42,0.45)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 1.4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'rgba(148,163,184,1)',
                fontWeight: 700,
                fontSize: '13px',
                userSelect: 'none',
              }}
            >
              {String(label || '').toUpperCase()}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color: '#ff385c',
                fontSize: '34px',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {currentDisplay}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: 3, pt: 0.6, pb: 2 }}>
          <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 20px 1fr', alignItems: 'center' }}>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: EDGE_SPACER,
                height: ITEM_HEIGHT,
                borderRadius: '16px',
                border: '1px solid rgba(255,56,92,0.55)',
                bgcolor: 'rgba(255,56,92,0.06)',
                boxShadow: '0 10px 24px rgba(255,56,92,0.10)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <Box ref={hourListRef} onScroll={handleHourScroll} sx={wheelListSx}>
              <Box sx={{ height: EDGE_SPACER, scrollSnapAlign: 'start' }} />
              {hours.map((h) => {
                const active = h === hour;
                return (
                  <Box
                    key={h}
                    onClick={() => scrollToHour(h)}
                    sx={{
                      height: ITEM_HEIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      scrollSnapAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '20px',
                      transition: 'all 200ms ease',
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#FF385C' : 'rgba(148,163,184,1)',
                    }}
                  >
                    {pad2(h)}
                  </Box>
                );
              })}
              <Box sx={{ height: EDGE_SPACER, scrollSnapAlign: 'end' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
              <Typography className="animate-pulse" sx={{ fontSize: '24px', fontWeight: 700, color: 'rgba(148,163,184,1)' }}>
                :
              </Typography>
            </Box>

            <Box ref={minuteListRef} onScroll={handleMinuteScroll} sx={wheelListSx}>
              <Box sx={{ height: EDGE_SPACER, scrollSnapAlign: 'start' }} />
              {minutes.map((m) => {
                const active = m === minute;
                return (
                  <Box
                    key={m}
                    onClick={() => scrollToMinute(m)}
                    sx={{
                      height: ITEM_HEIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      scrollSnapAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '20px',
                      transition: 'all 200ms ease',
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#FF385C' : 'rgba(148,163,184,1)',
                    }}
                  >
                    {pad2(m)}
                  </Box>
                );
              })}
              <Box sx={{ height: EDGE_SPACER, scrollSnapAlign: 'end' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid rgba(226,232,240,1)', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              onClick={handleCancel}
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(148,163,184,1)',
                fontWeight: 700,
                fontSize: '14px',
                minWidth: 96,
                '&:hover': { bgcolor: '#eeeeee80' },
              }}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleConfirm}
              className="hover:bg-[#E31C5F] hover:shadow-lg hover:shadow-[#FF385C]/30 transition-all duration-150 hover:-translate-y-0.5"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.06em',
                color: '#ffffff',
                bgcolor: '#ff385c',
                borderRadius: '14px',
                transition: 'all 0.3s ease',
                px: 4,
                height: 44,
                minWidth: 140,
                boxShadow: '0 10px 20px rgba(255,56,92,0.25)',
                '&:hover': { bgcolor: '#E31C5F' },
              }}
            >
              CONFIRM
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

