import { useEffect, useMemo, useState } from 'react';
import { Box, Dialog, DialogContent, Button, Typography } from '@mui/material';

function pad2(n) {
  return n.toString().padStart(2, '0');
}

export default function TimeWheelPickerDialog({ open, onClose, value, onConfirm, label = 'Select time' }) {
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

  const currentDisplay = `${pad2(hour)}:${pad2(minute)}`;

  useEffect(() => {
    if (!open) return;
    setHour(initial.hour);
    setMinute(initial.minute);
  }, [open, initial.hour, initial.minute]);

  const handleConfirm = () => {
    onConfirm?.(currentDisplay);
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const rowOffsets = [-2, -1, 0, 1, 2];
  const mod = (n, m) => ((n % m) + m) % m;
  const hourRowValues = rowOffsets.map((o) => mod(hour + o, 24));
  const minuteRowValues = rowOffsets.map((o) => mod(minute + o, 60));

  const digitSx = {
    fontSize: '20px',
    fontWeight: 500,
    color: 'rgba(148,163,184,1)',
    lineHeight: 1,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  };

  const selectedDigitSx = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#ff385c',
    lineHeight: 1.1,
    userSelect: 'none',
  };

  const stepFromWheelDelta = (deltaY) => {
    // Trackpads can emit small deltas; snap to +/- 1 when scrolling meaningfully.
    if (!Number.isFinite(deltaY)) return 0;
    if (Math.abs(deltaY) < 1) return 0;
    return deltaY < 0 ? -1 : 1;
  };

  const handleWheelHour = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const step = stepFromWheelDelta(e.deltaY);
    if (!step) return;
    setHour((prev) => mod(prev + step, 24));
  };

  const handleWheelMinute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const step = stepFromWheelDelta(e.deltaY);
    if (!step) return;
    setMinute((prev) => mod(prev + step, 60));
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
      <DialogContent
        sx={{
          p: 0,
        }}
      >
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 20px 1fr',
              alignItems: 'center',
            }}
          >
            {rowOffsets.map((offset, rowIdx) => {
              const hVal = hourRowValues[rowIdx];
              const mVal = minuteRowValues[rowIdx];

              if (offset === 0) {
                return (
                  <Box
                    key="selected"
                    sx={{
                      gridColumn: '1 / -1',
                      mx: 'auto',
                      width: '100%',
                      maxWidth: 270,
                      height: 54,
                      borderRadius: '16px',
                      border: '1px solid rgba(255,56,92,0.55)',
                      bgcolor: 'rgba(255,56,92,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 6,
                      boxShadow: '0 10px 24px rgba(255,56,92,0.10)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 52 }} onWheel={handleWheelHour}>
                      <Typography sx={selectedDigitSx}>{pad2(hour)}</Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(148,163,184,1)' }} />
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(148,163,184,1)' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 52 }} onWheel={handleWheelMinute}>
                      <Typography sx={selectedDigitSx}>{pad2(minute)}</Typography>
                    </Box>
                  </Box>
                );
              }

              return (
                <Box
                  key={`row-${offset}`}
                  sx={{
                    gridColumn: '1 / -1',
                    display: 'grid',
                    gridTemplateColumns: '1fr 20px 1fr',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                  }}
                >
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setHour(hVal);
                    }}
                    sx={{
                      ...digitSx,
                      cursor: 'pointer',
                      opacity: 1,
                    }}
                    onWheel={handleWheelHour}
                  >
                    {pad2(hVal)}
                  </Box>
                  <Box sx={{}} />
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setMinute(mVal);
                    }}
                    sx={{
                      ...digitSx,
                      cursor: 'pointer',
                      opacity: 1,
                    }}
                    onWheel={handleWheelMinute}
                  >
                    {pad2(mVal)}
                  </Box>
                </Box>
              );
            })}
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
              className='hover:bg-[#E31C5F] hover:shadow-lg hover:shadow-[#FF385C]/30 transition-all duration-150 hover:-translate-y-0.5'
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

