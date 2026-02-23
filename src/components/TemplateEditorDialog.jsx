import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import mammoth from 'mammoth';
import { api } from '../api/client.js';

const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

const Quill = ReactQuill?.Quill;
if (Quill) {
  const SizeStyle = Quill.import('attributors/style/size');
  SizeStyle.whitelist = FONT_SIZES;
  Quill.register(SizeStyle, true);
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: ['', 'serif', 'monospace', 'Arial', 'Times New Roman', 'Georgia', 'Verdana'] }],
    [{ size: FONT_SIZES }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

export default function TemplateEditorDialog({ open, onClose, actionSlug, actionLabel, templateExists, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const quillRef = useRef(null);

  useEffect(() => {
    if (!open || !actionSlug) return;

    let cancelled = false;
    setLoading(true);
    setError('');
    setContent('');

    if (templateExists) {
      const url = `${base}/api/admin/templates/${actionSlug}/file`;
      const at = localStorage.getItem('accessToken');
      fetch(url, { headers: at ? { Authorization: `Bearer ${at}` } : {} })
        .then((res) => {
          if (cancelled) return null;
          if (!res.ok) throw new Error(res.status === 404 ? 'Template not found' : 'Failed to load template');
          return res.arrayBuffer();
        })
        .then((arrayBuffer) => {
          if (cancelled || !arrayBuffer) return;
          return mammoth.convertToHtml({ arrayBuffer });
        })
        .then((result) => {
          if (cancelled || !result) return;
          setContent(result.value || '');
        })
        .catch((err) => {
          if (!cancelled) setError(err.message || 'Failed to load');
          if (!cancelled) setContent('<p></p>');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      setContent('<p></p>');
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [open, actionSlug, templateExists]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api(`/admin/templates/${actionSlug}/save`, {
        method: 'POST',
        body: JSON.stringify({ html: content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: '#1e293b',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 2,
        }}
      >
        <Box>
          <Box component="span" fontWeight={600}>
            {actionLabel || actionSlug}
          </Box>
          <Box component="span" sx={{ ml: 2, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            {templateExists ? 'Edit template' : 'Create new template'}
          </Box>
        </Box>
        <Button startIcon={<CloseIcon />} onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Close
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error && (
          <Box sx={{ px: 3, py: 2, bgcolor: 'error.dark', color: 'white' }}>
            {error}
          </Box>
        )}

        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#818cf8' }} />
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              '& .quill': { height: '100%', display: 'flex', flexDirection: 'column' },
              '& .ql-container': {
                flex: 1,
                fontSize: 16,
                fontFamily: 'inherit',
                border: 'none',
                bgcolor: '#0f172a',
              },
              '& .ql-editor': {
                minHeight: 300,
                color: 'white',
                fontSize: 16,
                '&.ql-blank::before': { color: 'rgba(255,255,255,0.4)' },
              },
              '& .ql-toolbar.ql-snow': {
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                bgcolor: '#334155',
                '& .ql-stroke': { stroke: 'rgba(255,255,255,0.3)' },
                '& .ql-fill': { fill: 'rgba(255,255,255,0.5)' },
                '& .ql-picker': { color: 'rgba(255,255,255,0.9)' },
                '& .ql-picker-options': { bgcolor: '#334155' },
              },
            }}
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Start typing or paste content..."
              style={{ height: 'calc(100vh - 200px)' }}
            />
          </Box>
        )}
      </DialogContent>

      {!loading && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            bgcolor: '#1e293b',
          }}
        >
          <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
