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
