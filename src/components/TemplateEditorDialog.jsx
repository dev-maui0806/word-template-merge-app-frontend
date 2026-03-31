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

// Quill size values must be actual CSS values, and we include 13px as the default.
const FONT_SIZES = ['10px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

const Quill = ReactQuill?.Quill;
let FONT_VALUES = ['Aptos', 'Arial', 'Georgia', 'Times New Roman', 'Verdana'];
let fontUsesStyleAttributor = true;
if (Quill) {
  // Sizes (safe-guarded for different Quill builds)
  try {
    const SizeStyle = Quill.import('attributors/style/size');
    if (SizeStyle) {
      SizeStyle.whitelist = FONT_SIZES;
      Quill.register(SizeStyle, true);
    }
  } catch {
    // ignore
  }

  // Fonts: prefer style-based attributor, but some Quill builds don't include it.
  try {
    const FontStyle = Quill.import('attributors/style/font');
    if (FontStyle) {
      FontStyle.whitelist = FONT_VALUES;
      Quill.register(FontStyle, true);
      fontUsesStyleAttributor = true;
    } else {
      throw new Error('missing style font attributor');
    }
  } catch {
    fontUsesStyleAttributor = false;
    // Fallback: class-based font format. Values must be class-friendly.
    FONT_VALUES = ['arial', 'georgia', 'times-new-roman', 'verdana'];
    try {
      const FontFormat = Quill.import('formats/font');
      if (FontFormat) {
        FontFormat.whitelist = FONT_VALUES;
        Quill.register(FontFormat, true);
      }
    } catch {
      // ignore
    }
  }
}

const DEFAULT_FONT_VALUE = fontUsesStyleAttributor ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : "inter";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: FONT_VALUES }],
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
  const defaultsAppliedRef = useRef(false);

  useEffect(() => {
    if (!open || !actionSlug) return;

    let cancelled = false;
    defaultsAppliedRef.current = false;
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

  useEffect(() => {
    if (!open || loading) return;
    if (defaultsAppliedRef.current) return;

    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    defaultsAppliedRef.current = true;

    // Set defaults for *new typing* only.
    // Do NOT reformat the entire document, otherwise we destroy the original DOCX's
    // paragraph styles, theme colors, and run-level formatting.
    editor.setSelection(0, 0, 'silent');
    editor.format('font', DEFAULT_FONT_VALUE, 'silent');
    editor.format('size', '13px', 'silent');
  }, [open, loading, actionSlug]);

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
              // Quill uses hardcoded "Normal" labels for custom sizes unless we
              // override the picker label/item content.
              '&& .ql-snow .ql-picker.ql-size .ql-picker-label::before': {
                content: 'attr(data-value)',
              },
              '&& .ql-snow .ql-picker.ql-size .ql-picker-item::before': {
                content: 'attr(data-value)',
              },
              // Same issue for the font picker: without overrides, Quill's default
              // CSS doesn't label custom font values (shows "Sans Serif" repeatedly).
              '&& .ql-snow .ql-picker.ql-font .ql-picker-label::before': {
                content: 'attr(data-value)',
              },
              '&& .ql-snow .ql-picker.ql-font .ql-picker-item::before': {
                content: 'attr(data-value)',
              },
              '&& .ql-snow .ql-picker.ql-font .ql-picker-label:not([data-value])::before': {
                content: '"Aptos"',
              },
              // If we fall back to class-based font format, map labels + actual font-families.
              '&& .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="aptos"]::before, && .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="aptos"]::before': {
                content: '"Aptos"',
              },
              '&& .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before, && .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before': {
                content: '"Times New Roman"',
              },
              '& .ql-font-aptos': {
                fontFamily: '"Aptos", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              },
              '& .ql-font-times-new-roman': {
                fontFamily: '"Times New Roman", Times, serif',
              },
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
                fontFamily: '"Aptos", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
