import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Toolbar,
  TextField,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { api } from '../api/client.js';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import { renderAsync } from 'docx-preview';
import ContactDirectory from './ContactDirectory.jsx';
import CalendarWidget from './CalendarWidget.jsx';

const UTILITY_ITEMS = [
  {
    label: 'File Storage',
    path: '#',
    icon: FolderOpenIcon,
    ariaLabel: 'Document history',
    isFileStorage: true,
  },
  {
    label: 'Calendar',
    path: '#',
    icon: CalendarMonthIcon,
    ariaLabel: 'Full calendar',
    isCalendar: true,
  },
  {
    label: 'Contacts',
    path: '#',
    icon: ContactPhoneIcon,
    ariaLabel: 'Contacts module',
    isContacts: true,
  },
];

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;

export default function UtilitySection() {
  const [fileStorageOpen, setFileStorageOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [docList, setDocList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Full-screen preview
  const [previewDoc, setPreviewDoc] = useState(null); // { id, actionSlug }
  const [previewBlob, setPreviewBlob] = useState(null);
  const docxContainerRef = useRef(null);
  const [previewTextContent, setPreviewTextContent] = useState(''); // fallback when file not stored
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [zoomPercent, setZoomPercent] = useState(100);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    setError('');
    try {
      const res = await api('/documents', { method: 'GET' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load documents');
      }
      const data = await res.json();
      setDocList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
      setDocList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fileStorageOpen) {
      fetchList();
    }
  }, [fileStorageOpen, fetchList]);

  const handleSelectDocument = async (doc) => {
    setFileStorageOpen(false);
    setError('');
    setPreviewBlob(null);
    setPreviewTextContent('');
    setPreviewError('');
    setZoomPercent(100);
    setPreviewLoading(true);
    // Open preview after list modal has closed to avoid stacking/focus issues
    const docToPreview = { id: doc.id, actionSlug: doc.actionSlug };
    setTimeout(() => setPreviewDoc(docToPreview), 0);
    try {
      const fileRes = await api(`/documents/${doc.id}/file`, { method: 'GET' });
      if (fileRes.ok) {
        const blob = await fileRes.blob();
        setPreviewBlob(blob);
        setPreviewLoading(false);
        return;
      }
      // File not available (e.g. older document) — fall back to archived text
      const docRes = await api(`/documents/${doc.id}`, { method: 'GET' });
      if (!docRes.ok) {
        const data = await docRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load document');
      }
      const data = await docRes.json();
      const text = typeof data.content === 'string' ? data.content : '';
      setPreviewTextContent(text || '— No archived text for this document.');
    } catch (err) {
      setPreviewError(err.message || 'Failed to load document');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCloseFileStorage = () => {
    setFileStorageOpen(false);
    setError('');
  };

  const handleClosePreview = () => {
    setPreviewDoc(null);
    setPreviewBlob(null);
    setPreviewTextContent('');
    setPreviewError('');
    setZoomPercent(100);
    if (docxContainerRef.current) {
      docxContainerRef.current.innerHTML = '';
    }
  };

  // Render archived DOCX buffer into preview container using docx-preview
  useEffect(() => {
    if (!previewBlob || !docxContainerRef.current || !previewDoc) return;
    const container = docxContainerRef.current;
    container.innerHTML = '';
    renderAsync(previewBlob, container, null, {
      className: 'docx-preview',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
    }).catch((err) => {
      console.error('docx-preview render failed:', err);
      setPreviewError('Failed to render document preview.');
    });
    return () => {
      container.innerHTML = '';
    };
  }, [previewBlob, previewDoc]);

  const handleDownload = () => {
    const slug = (previewDoc?.actionSlug || 'document').replace(/\s+/g, '-');
    if (previewBlob) {
      const url = URL.createObjectURL(previewBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (previewTextContent) {
      const blob = new Blob([previewTextContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleZoomIn = () => {
    setZoomPercent((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  };
  const handleZoomOut = () => {
    setZoomPercent((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  };

  const handleFileStorageClick = (e) => {
    e.preventDefault();
    setFileStorageOpen(true);
  };

  const handleContactsClick = (e) => {
    e.preventDefault();
    setContactsOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      {UTILITY_ITEMS.map(({ label, path, icon: Icon, ariaLabel, isFileStorage, isCalendar, isContacts }) => {
        if (isFileStorage) {
          return (
            <Box
              key={label}
              component="button"
              type="button"
              onClick={handleFileStorageClick}
              aria-label={ariaLabel}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'transparent',
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                font: 'inherit',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
            </Box>
          );
        }
        if (isCalendar) {
          return (
            <Box
              key={label}
              component="button"
              type="button"
              onClick={() => setCalendarOpen(true)}
              aria-label={ariaLabel}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'transparent',
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                font: 'inherit',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
            </Box>
          );
        }
        if (isContacts) {
          return (
            <Box
              key={label}
              component="button"
              type="button"
              onClick={handleContactsClick}
              aria-label={ariaLabel}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'transparent',
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                font: 'inherit',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
            </Box>
          );
        }
        return (
          <Box
            key={label}
            component={Link}
            to={path}
            aria-label={ariaLabel}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'transparent',
              color: 'text.secondary',
              textDecoration: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
            <Typography variant="body2" fontWeight={500}>
              {label}
            </Typography>
          </Box>
        );
      })}

      {/* List-only modal */}
      <Dialog
        open={fileStorageOpen}
        onClose={handleCloseFileStorage}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Saved documents</Typography>
          <IconButton aria-label="Close" onClick={handleCloseFileStorage} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              File Manager – documents grouped by event date and claimant.
            </Typography>
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by claimant, event date, event type, folder, or file name…"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : docList.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No saved documents yet. Generate a document from a form to see it here.
            </Typography>
          ) : (
            (() => {
              const q = search.trim().toLowerCase();

              const slugToTitle = (slug = '') =>
                String(slug)
                  .split('-')
                  .filter(Boolean)
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ');

              const enriched = docList.map((d) => {
                const folderName = d.folderName || 'Uncategorized';
                const eventType = d.eventType || slugToTitle(d.actionSlug || '');
                const claimantName = d.claimantName || '';
                const fileName = `${eventType || 'Document'}.docx`;
                const eventDateLabel =
                  d.eventDateDisplay ||
                  (d.createdAt ? dayjs(d.createdAt).format('D MMM YYYY') : '');
                const haystack = [
                  folderName,
                  fileName,
                  claimantName,
                  eventType,
                  eventDateLabel,
                ]
                  .join(' ')
                  .toLowerCase();
                const matches = !q || haystack.includes(q);
                return { ...d, folderName, eventType, claimantName, fileName, eventDateLabel, matches };
              });

              const grouped = enriched.reduce((acc, doc) => {
                if (!doc.matches) return acc;
                if (!acc[doc.folderName]) acc[doc.folderName] = [];
                acc[doc.folderName].push(doc);
                return acc;
              }, {});

              const folderNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

              if (folderNames.length === 0) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    No documents match this search yet.
                  </Typography>
                );
              }

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {folderNames.map((folder) => (
                    <Box key={folder}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                        {folder}
                      </Typography>
                      <List dense disablePadding sx={{ pl: 1 }}>
                        {grouped[folder].map((doc) => (
                          <ListItemButton
                            key={doc.id}
                            onClick={() => handleSelectDocument(doc)}
                          >
                            <ListItemText
                              primary={doc.fileName}
                              secondary={
                                doc.eventDateLabel
                                  ? `${doc.eventType} • ${doc.eventDateLabel}`
                                  : doc.eventType
                              }
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  ))}
                </Box>
              );
            })()
          )}
        </DialogContent>
      </Dialog>

      {/* Full-screen preview */}
      <Dialog
        open={!!previewDoc}
        onClose={handleClosePreview}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
          },
        }}
      >
        <Toolbar
          sx={{
            flexShrink: 0,
            borderBottom: '1px solid',
            borderColor: 'divider',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <IconButton aria-label="Close" onClick={handleClosePreview} size="medium">
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              ml: 1,
              mr: 2,
              textTransform: 'capitalize',
              fontWeight: 600,
            }}
          >
            {previewDoc?.actionSlug?.replace(/-/g, ' ') || 'Document'}
          </Typography>
          <Box sx={{ flex: 1, minWidth: 0 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton aria-label="Zoom out" onClick={handleZoomOut} size="medium" disabled={zoomPercent <= MIN_ZOOM}>
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 48, textAlign: 'center' }}>
              {zoomPercent}%
            </Typography>
            <IconButton aria-label="Zoom in" onClick={handleZoomIn} size="medium" disabled={zoomPercent >= MAX_ZOOM}>
              <ZoomInIcon />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={!previewBlob && !previewTextContent}
          >
            {previewBlob ? 'Download DOCX' : previewTextContent ? 'Download as TXT' : 'Download'}
          </Button>
        </Toolbar>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
              <CircularProgress />
            </Box>
          ) : previewError ? (
            <Alert severity="error" onClose={() => setPreviewError('')}>
              {previewError}
            </Alert>
          ) : previewTextContent ? (
            <Box
              sx={{
                transform: `scale(${zoomPercent / 100})`,
                transformOrigin: 'top center',
                width: '210mm',
                maxWidth: '100%',
                minHeight: '297mm',
                bgcolor: 'background.paper',
                boxShadow: 2,
                borderRadius: 0,
                p: 3,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            >
              {previewTextContent}
            </Box>
          ) : previewBlob ? (
            <Box
              sx={{
                transform: `scale(${zoomPercent / 100})`,
                transformOrigin: 'top center',
                width: '210mm',
                maxWidth: '100%',
                minHeight: '297mm',
                bgcolor: 'background.paper',
                boxShadow: 2,
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              <Box
                ref={docxContainerRef}
                className="docx-preview-wrapper"
                sx={{
                  p: 2,
                  minHeight: '297mm',
                  '& .docx': { backgroundColor: 'transparent' },
                  '& .docx-wrapper': { backgroundColor: 'background.paper' },
                  '& img': { maxWidth: '100%', height: 'auto' },
                }}
              />
            </Box>
          ) : null}
        </Box>
      </Dialog>

      <CalendarWidget open={calendarOpen} onClose={() => setCalendarOpen(false)} />
      <ContactDirectory open={contactsOpen} onClose={() => setContactsOpen(false)} />
    </Box>
  );
}