import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import SaveIcon from '@mui/icons-material/Save';

const STORAGE_KEY = 'fadoc_home_notes';

export default function NotesWidget() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setText(stored);
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
  <Card
    sx={(theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
        boxShadow: isDark
          ? '0 18px 45px rgba(0,0,0,0.9)'
          : '0 18px 45px rgba(15,23,42,0.12)',
        transform: 'translateY(0) scale(1)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease, background-color 0.25s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 26px 60px rgba(0,0,0,1)'
            : '0 26px 60px rgba(15,23,42,0.18)',
          transform: 'translateY(-2px) scale(1.01)',
        },
      };
    }}
  >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NoteIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Notes
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
            onClick={handleSave}
            sx={{ textTransform: 'none', py: 0.5 }}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </Box>
        <TextField
          multiline
          minRows={4}
          maxRows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add notes..."
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '0.9rem',
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
