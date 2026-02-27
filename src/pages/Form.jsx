/**
 * Form.jsx - Unified dynamic form for all template-based actions.
 * Fetches field metadata from backend, renders inputs, submits to generate endpoint.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import Header from '../components/Header.jsx';
import FormField from '../components/form/FormField.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // hard safety cap before compression

async function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image file'));
    };
    img.src = objectUrl;
  });
}

function FormSection({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="primary" fontWeight={700} sx={{ display: 'block', mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>{children}</Box>
    </Box>
  );
}

function FormRow({ fullWidth, children }) {
  return <Box sx={fullWidth ? { gridColumn: '1 / -1' } : undefined}>{children}</Box>;
}

/** Human-readable title from action slug */
function slugToTitle(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function Form() {
  const { actionSlug } = useParams();
  const navigate = useNavigate();
  const { country, getEventTypeForBackend } = useApp();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [data, setData] = useState({});
  const [images, setImages] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewBlob, setPreviewBlob] = useState(null);

  useEffect(() => {
    if (!actionSlug) return;
    let cancelled = false;
    setLoading(true);
    setMetaError('');
    api(`/templates/${actionSlug}/metadata`, { method: 'GET' })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || 'Failed to load template'); });
        return res.json();
      })
      .then((meta) => {
        if (cancelled) return;
        if (!meta.ok) throw new Error(meta.error);
        setMetadata(meta);
        const initial = {};
        for (const f of meta.fields || []) {
          if (f.computed) continue;
          if (f.type === 'select' && f.options?.length) initial[f.name] = f.default ?? f.options[f.options.length - 1] ?? f.options[0] ?? '';
          else initial[f.name] = '';
        }
        setData(initial);
      })
      .catch((err) => {
        if (!cancelled) setMetaError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [actionSlug]);

  const handleChange = useCallback((name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback(
    async (key, file) => {
      try {
        if (file.size > MAX_IMAGE_SIZE) {
          setError('Image file is too large to process. Please choose a smaller file.');
          return;
        }
        setError('');
        const compressedDataUrl = await compressImageFile(file);
        if (typeof compressedDataUrl === 'string' && compressedDataUrl.startsWith('data:image/')) {
          setImages((prev) => ({ ...prev, [key]: compressedDataUrl }));
        } else {
          setError('Please select a valid image file');
        }
      } catch (err) {
        setError(err.message || 'Failed to process image. Please try a different file.');
      }
    },
    []
  );

  const handleImageRemove = useCallback((key) => {
    setImages((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const buildPayload = useCallback(() => {
    const payload = { ...data };
    // Always include Country and Event_Type for all action types
    // These come from AppContext, not form inputs - ensure they override any form data
    payload.Country = country;
    payload.Event_Type = getEventTypeForBackend();
    if (Object.keys(images).length) payload.images = images;
    return payload;
  }, [data, images, country, getEventTypeForBackend]);

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    
    // Validate required context values
    const eventType = getEventTypeForBackend();
    if (!eventType) {
      setError('Please select an Event Type before generating the document.');
      return;
    }
    if (!country) {
      setError('Please select a Country before generating the document.');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const res = await api(`/generate/${actionSlug}`, {
        method: 'POST',
        body: JSON.stringify({ ...buildPayload(), preview: false }),
      });
      if (!res.ok) {
        const d = await res.json();
        if (d.code === 'TRIAL_LIMIT') throw new Error('Trial limit reached\nSubscribe to download complete DOCX documents.');
        throw new Error(d.error || 'Failed to generate');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actionSlug}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Document generated and downloaded successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePreview = async () => {
    setError('');
    setSuccess('');
    
    // Validate required context values
    const eventType = getEventTypeForBackend();
    if (!eventType) {
      setError('Please select an Event Type before previewing the document.');
      return;
    }
    if (!country) {
      setError('Please select a Country before previewing the document.');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const res = await api(`/generate/${actionSlug}`, {
        method: 'POST',
        body: JSON.stringify({ ...buildPayload(), preview: true }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to preview');
      }
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const { default: mammoth } = await import('mammoth');
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewHtml(result.value);
      setPreviewBlob(blob);
      setPreviewOpen(true);
      setSuccess('Document preview generated successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (!previewBlob) return;
    const url = URL.createObjectURL(previewBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${actionSlug}-preview.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveAndDownload = async () => {
    setPreviewOpen(false);
    setPreviewHtml('');
    setPreviewBlob(null);
    await handleGenerate();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', pb: 4 }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography color="text.secondary">Loading form…</Typography>
        </Container>
      </Box>
    );
  }

  if (metaError || !metadata?.ok) {
    return (
      <Box sx={{ minHeight: '100vh', pb: 4 }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{metaError || metadata?.error || 'Template not found'}</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Back
          </Button>
        </Container>
      </Box>
    );
  }

  const fields = metadata.fields || [];
  const bySection = fields.reduce((acc, f) => {
    const s = f.section || 'General';
    if (!acc[s]) acc[s] = [];
    acc[s].push(f);
    return acc;
  }, {});

  // Sort sections to ensure consistent order: Attachments always appears last
  const sectionOrder = ['Dates', 'Claimant Details', 'Times', 'Venue Information', 'Accommodation', 'Notary', 'ENT Test', 'Distance & Options', 'General', 'Attachments'];
  const sortedSections = Object.entries(bySection).sort(([a], [b]) => {
    const aIdx = sectionOrder.indexOf(a);
    const bIdx = sectionOrder.indexOf(b);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ textTransform: 'none' }}>
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">{slugToTitle(actionSlug)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {country} – {getEventTypeForBackend() || 'Select event type'}
            </Typography>
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            {fields.length === 0 ? (
              <Alert severity="info">
                No template variables were detected in this template. If your document uses placeholders like {'{{Variable_Name}}'}, ensure the template file exists and is valid. You can still use Preview or Generate Document.
              </Alert>
            ) : (
            sortedSections.map(([section, sectionFields], idx) => (
              <Box key={section}>
                {idx > 0 && <Divider sx={{ my: 3 }} />}
                <FormSection title={section}>
                  {sectionFields
                    .filter((f) => !f.computed)
                    .map((f) => {
                      // Special handling for Event_Type in arrange-venue (read-only from context)
                      if (f.name === 'Event_Type') {
                        return (
                          <FormRow key={f.name} fullWidth={f.fullWidth}>
                            <TextField
                              fullWidth
                              size="medium"
                              label={f.label}
                              value={getEventTypeForBackend() || '—'}
                              InputProps={{ readOnly: true }}
                              InputLabelProps={{ shrink: true }}
                            />
                          </FormRow>
                        );
                      }
                      return (
                        <FormRow key={f.name} fullWidth={f.fullWidth}>
                          <FormField
                            field={f}
                            value={f.type === 'image' ? images[f.name] : data[f.name]}
                            onChange={handleChange}
                            onImageUpload={handleImageUpload}
                            onImageRemove={handleImageRemove}
                          />
                        </FormRow>
                      );
                    })}
                </FormSection>
              </Box>
            ))
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Button variant="outlined" onClick={handlePreview} disabled={submitLoading}>
            Preview
          </Button>
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleGenerate} disabled={submitLoading}>
            Generate Document
          </Button>
        </Box>

        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: '70vh' } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
            Template Preview
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" color="error" size="small" onClick={handleDownloadTemplate} disabled={!previewBlob}>
                Download Template
              </Button>
              <Button variant="contained" color="error" size="small" onClick={handleSaveAndDownload}>
                Save and Download
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: 'grey.100' }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'error.main',
                borderRadius: 0,
                minHeight: 400,
                maxWidth: 595,
                mx: 'auto',
                p: 3,
                '& p': { m: 0, mb: 1 },
                '& p:last-child': { mb: 0 },
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </DialogContent>
        </Dialog>

        <Typography variant="caption" color="text.secondary">
          This app was developed by another user. It may be inaccurate or unsafe.
        </Typography>
      </Container>
    </Box>
  );
}
