import { useMemo, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Button, Typography } from '@mui/material';

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

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const currentDisplay = `${pad2(hour)}:${pad2(minute)}`;

  const handleConfirm = () => {
    onConfirm?.(currentDisplay);
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const listStyles = {
    flex: 1,
    maxHeight: 200,
    overflowY: 'auto',
    px: 2,
    '&::-webkit-scrollbar': {
      width: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(148, 163, 184, 0.7)',
      borderRadius: 999,
    },
  };

  const itemStyles = (active) => ({
    py: 0.75,
    textAlign: 'center',
    fontSize: '1.4rem',
    cursor: 'pointer',
    color: active ? '#f97373' : 'rgba(148, 163, 184, 1)',
    fontWeight: active ? 700 : 500,
    transition: 'color 0.15s, transform 0.15s',
    transform: active ? 'scale(1.06)' : 'scale(1)',
  });

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
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(148,163,184,1)' }}
        >
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {currentDisplay}
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
            position: 'relative',
            borderRadius: 3,
            bgcolor: '#f9fafb',
            px: 1,
            py: 2,
            display: 'flex',
            gap: 2,
            mb: 2,
          }}
        >
          {/* Center highlight lines */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 12,
              right: 12,
              height: 40,
              borderRadius: 2,
              pointerEvents: 'none',
              borderTop: '1px solid rgba(148,163,184,0.4)',
              borderBottom: '1px solid rgba(148,163,184,0.4)',
              transform: 'translateY(-50%)',
            }}
          />

          <Box sx={listStyles}>
            {hours.map((h) => (
              <Box key={h} sx={itemStyles(h === hour)} onClick={() => setHour(h)}>
                {pad2(h)}
              </Box>
            ))}
          </Box>
          <Box sx={listStyles}>
            {minutes.map((m) => (
              <Box key={m} sx={itemStyles(m === minute)} onClick={() => setMinute(m)}>
                {pad2(m)}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button
            onClick={handleCancel}
            sx={{
              textTransform: 'none',
              color: 'rgba(148,163,184,1)',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{
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

