/**
 * Form.jsx - Unified dynamic form for all template-based actions.
 * Fetches field metadata from backend, renders inputs, submits to generate endpoint.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
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
      <Typography
        variant="overline"
        color="error"
        fontWeight={700}
        sx={{
          display: 'block',
          mb: 2,
          fontSize: '0.7rem',
          letterSpacing: '0.16em',
        }}
      >
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
  const { country, countryTimezoneId, getEventTypeForBackend } = useApp();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaError, setMetaError] = useState('');
  const [data, setData] = useState({});
  const [images, setImages] = useState({});
  const [imageLayout, setImageLayout] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewEditing, setPreviewEditing] = useState(false);
  const [previewEditedHtml, setPreviewEditedHtml] = useState('');
  const previewContentRef = useRef(null);
  const [claimantOptions, setClaimantOptions] = useState([]);

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

  // Load claimant name suggestions from history (File Manager) for autosuggest.
  useEffect(() => {
    let cancelled = false;
    api('/documents/claimants', { method: 'GET' })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || 'Failed to load claimants'); });
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data && data.ok && Array.isArray(data.claimants)) {
          setClaimantOptions(data.claimants);
        }
      })
      .catch(() => {
        // Silent fail – autosuggest is optional.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    setImageLayout((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleImageLayoutChange = useCallback((key, layout) => {
    setImageLayout((prev) => ({ ...prev, [key]: layout }));
  }, []);

  const buildPayload = useCallback(() => {
    const payload = { ...data };
    // Always include Country and Event_Type for all action types
    // These come from AppContext, not form inputs - ensure they override any form data
    payload.Country = country;
    if (countryTimezoneId) payload.CountryTimezoneId = countryTimezoneId;
    payload.Event_Type = getEventTypeForBackend();
    if (Object.keys(images).length) payload.images = images;
    if (Object.keys(imageLayout).length) {
      // Send only sizing-relevant fields to backend
      const out = {};
      for (const [k, v] of Object.entries(imageLayout)) {
        if (!v || typeof v !== 'object') continue;
        if (v.mode === 'custom') {
          out[k] = { widthPercent: v.widthPercent };
        }
      }
      if (Object.keys(out).length) payload.imageLayout = out;
    }
    return payload;
  }, [data, images, imageLayout, country, countryTimezoneId, getEventTypeForBackend]);

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
        if (d.code === 'TRIAL_LIMIT') {
          const reason = d.reason || 'Subscribe to download complete DOCX documents.';
          throw new Error(`Trial limit reached. ${reason}`);
        }
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
    // Preview opens even with no variable fields entered; backend handles empty values in preview mode.
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
      const html = result.value;
      setPreviewHtml(html);
      setPreviewEditedHtml(html);
      setPreviewBlob(blob);
      setPreviewOpen(true);
      setPreviewEditing(false);
      setSuccess('Document preview generated successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    // If the user has edited the preview HTML, prefer downloading that edited
    // content as a real DOCX generated server-side (keeps Aptos 13pt).
    const fromRef = previewContentRef.current?.innerHTML;
    const editedHtml = fromRef || previewEditedHtml;

    if (editedHtml && editedHtml.trim()) {
      try {
        const res = await api(`/generate/${actionSlug}/edited-docx`, {
          method: 'POST',
          body: JSON.stringify({ html: editedHtml }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || 'Failed to generate edited DOCX');
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${actionSlug}-edited.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        setError(e.message || 'Failed to download edited DOCX');
      }
      return;
    }

    // Fallback: use the DOCX preview generated by the backend.
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
    setPreviewEditedHtml('');
    await handleGenerate();
  };

  // Set content once when dialog opens (uncontrolled - avoids cursor reset on typing)
  useEffect(() => {
    if (!previewOpen || !previewHtml) return;
    const setContent = () => {
      const el = previewContentRef.current;
      if (el && !el.innerHTML.trim()) {
        el.innerHTML = previewHtml;
      }
    };
    setContent();
    const t = setTimeout(setContent, 50);
    return () => clearTimeout(t);
  }, [previewOpen, previewHtml]);

  if (loading) {
    return (
      <Box sx={(theme) => ({ minHeight: '100vh', pb: 4, bgcolor: theme.palette.background.default })}>
        <Header />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography color="text.secondary">Loading form…</Typography>
        </Container>
      </Box>
    );
  }

  if (metaError || !metadata?.ok) {
    return (
      <Box sx={(theme) => ({ minHeight: '100vh', pb: 4, bgcolor: theme.palette.background.default })}>
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
  // TYPE fields (Meeting_Type, Room_Type, etc.) go in header at top-right; exclude from sections
  const typeFields = fields.filter(
    (f) => f.type === 'select' && f.name !== 'Event_Type' && /_Type$/.test(f.name)
  );
  const sectionFields = fields.filter(
    (f) => !typeFields.some((tf) => tf.name === f.name)
  );
  const bySection = sectionFields.reduce((acc, f) => {
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
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        pb: 4,
        bgcolor: theme.palette.background.default,
      })}
    >
      <Header />
      <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'text.primary',
              }}
            >
              {slugToTitle(actionSlug)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {country} – {getEventTypeForBackend() || 'Select event type'}
            </Typography>
          </Box>
        </Box>

        <Card
          sx={(theme) => {
            const isDark = theme.palette.mode === 'dark';
            return {
              mb: 3,
              borderRadius: '24px',
              backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
              boxShadow: isDark
                ? '0 18px 45px rgba(0,0,0,0.9)'
                : '0 18px 45px rgba(15,23,42,0.12)',
              transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                boxShadow: isDark
                  ? '0 26px 60px rgba(0,0,0,1)'
                  : '0 26px 60px rgba(15,23,42,0.18)',
              },
            };
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header row: TYPE toggles at top-right (Meeting Type, Room Type, etc.) */}
            {typeFields.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 3,
                  pb: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                {typeFields.map((f) => (
                  <Box key={f.name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        color: 'text.secondary',
                      }}
                    >
                      {f.label.toUpperCase()}
                    </Typography>
                    <Box
                      sx={(theme) => ({
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f2f3f5',
                        borderRadius: '50px',
                        p: 0.5,
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e4e8'}`,
                      })}
                    >
                      {(f.options || []).map((opt) => {
                        const active = (data[f.name] ?? f.default ?? '') === opt;
                        return (
                          <Box
                            key={opt}
                            component="button"
                            type="button"
                            onClick={() => handleChange(f.name, opt)}
                            sx={(theme) => ({
                              px: 2,
                              py: 1,
                              borderRadius: '50px',
                              border: 'none',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              backgroundColor: active
                                ? theme.palette.error.main
                                : 'transparent',
                              color: active ? '#fff' : theme.palette.text.primary,
                              transition: 'background-color 0.2s ease, color 0.2s ease',
                              '&:hover': {
                                backgroundColor: active
                                  ? theme.palette.error.dark
                                  : theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.08)'
                                    : 'rgba(255,255,255,0.9)',
                              },
                            })}
                          >
                            {opt}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

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
                      // Special handling for Claimant_Name: autosuggest from previous documents
                      if (f.name === 'Claimant_Name') {
                        return (
                          <FormRow key={f.name} fullWidth={f.fullWidth}>
                            <Autocomplete
                              freeSolo
                              options={claimantOptions}
                              value={data[f.name] ?? ''}
                              onInputChange={(_, newValue) => handleChange(f.name, newValue)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  size="medium"
                                  label={f.label}
                                  placeholder={f.placeholder}
                                  InputLabelProps={{ shrink: true }}
                                />
                              )}
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
                            imageLayout={f.type === 'image' ? imageLayout[f.name] : undefined}
                            onImageLayoutChange={handleImageLayoutChange}
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

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
            mt: 1,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={handlePreview}
            disabled={submitLoading}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DownloadIcon />}
            onClick={handleGenerate}
            disabled={submitLoading}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Generate Document
          </Button>
        </Box>

        <Dialog
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewEditing(false);
          }}
          maxWidth="md"
          fullWidth
          slotProps={{
            transition: {
              onEntered: () => {
                if (previewContentRef.current && previewHtml) {
                  previewContentRef.current.innerHTML = previewHtml;
                }
              },
            },
          }}
          PaperProps={{ sx: { minHeight: '70vh' } }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              pr: { xs: 4, sm: 6 },
              pb: 1.5,
              gap: 1,
              position: 'relative',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Template Preview
              {previewEditing && (
                <Chip label="Editing" color="primary" size="small" sx={{ fontWeight: 600 }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: { xs: 0.5, sm: 0 } }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleDownloadTemplate}
                  disabled={!previewBlob}
                >
                  Download DOCX
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleSaveAndDownload}
                >
                  Save and Download
                </Button>
              </Box>
            </Box>
            <IconButton
              aria-label="Close preview"
              size="small"
              onClick={() => {
                setPreviewOpen(false);
                setPreviewEditing(false);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: 'grey.100' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 2,
              }}
            >
              <Box
                ref={previewContentRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setPreviewEditing(true)}
                onBlur={() => setPreviewEditing(false)}
                sx={(theme) => ({
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: previewEditing ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  minHeight: 400,
                  width: '100%',
                  maxWidth: 595,
                  p: 3,
                  outline: 'none',
                   fontFamily: '"Aptos", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                   fontSize: '13pt',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  boxShadow: previewEditing
                    ? `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.25)' : 'rgba(25, 118, 210, 0.15)'}, 0 4px 20px rgba(0,0,0,0.08)`
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  '&:hover': {
                    boxShadow: previewEditing
                      ? undefined
                      : `0 0 0 2px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}, 0 4px 12px rgba(0,0,0,0.08)`,
                  },
                  '&:focus': {
                    boxShadow: `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`,
                  },
                  '& p': { m: 0, mb: 1 },
                  '& p:last-child': { mb: 0 },
                })}
              />
            </Box>
          </DialogContent>
        </Dialog>

        <Typography variant="caption" color="text.secondary">
          This app was developed by another user. It may be inaccurate or unsafe.
        </Typography>
      </Container>
    </Box>
  );
}
