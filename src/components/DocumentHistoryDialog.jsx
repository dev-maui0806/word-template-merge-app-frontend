import { useState, useEffect, useCallback, useRef } from 'react';
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
  Toolbar,
  Slider,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import { renderAsync } from 'docx-preview';
import { api } from '../api/client.js';

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;

const CLAIMANT_SLUGS = new Set([
  'arrange-venue',
  'cancel-venue',
  'arrange-transportation',
  'cancel-transportation',
  'arrange-accommodation',
  'cancel-accommodation',
  'arrange-notary',
  'cancel-notary',
  'arrange-ent-test',
  'cancel-ent-test',
  'no-transportation-needed',
  'contact-claimant',
]);

const AGENT_SLUGS = new Set([
  'fa-traveled-to-attend',
  'fa-booked-flight-ticket',
  'fa-cancelled-flight-ticket',
  'fa-traveled-back',
  'fa-attend',
]);

function getCategoryFromSlug(actionSlug) {
  if (!actionSlug) return 'OTHER';
  if (CLAIMANT_SLUGS.has(actionSlug)) return 'CLAIMANT';
  if (AGENT_SLUGS.has(actionSlug)) return 'AGENT';
  return 'OTHER';
}

export default function DocumentHistoryDialog({ open, onClose }) {
  const [docList, setDocList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null); // { id, actionSlug }
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewTextContent, setPreviewTextContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [zoomPercent, setZoomPercent] = useState(100);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL'); // ALL | CLAIMANT | AGENT
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const docxContainerRef = useRef(null);

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
    if (open) {
      fetchList();
    }
  }, [open, fetchList]);

  const handleSelectDocument = async (doc) => {
    setError('');
    setPreviewBlob(null);
    setPreviewTextContent('');
    setPreviewError('');
    setZoomPercent(100);
    setPreviewLoading(true);
    const docToPreview = { id: doc.id, actionSlug: doc.actionSlug };
    setPreviewDoc(docToPreview);
    try {
      const fileRes = await api(`/documents/${doc.id}/file`, { method: 'GET' });
      if (fileRes.ok) {
        const blob = await fileRes.blob();
        setPreviewBlob(blob);
        setPreviewLoading(false);
        return;
      }
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

  const handleZoomOut = () => {
    setZoomPercent((z) => Math.max(MIN_ZOOM, z - 10));
  };

  const handleZoomIn = () => {
    setZoomPercent((z) => Math.min(MAX_ZOOM, z + 10));
  };

  const filteredDocs = docList.filter((doc) => {
    const q = search.trim().toLowerCase();
    const docCategory = getCategoryFromSlug(doc.actionSlug);
    if (category !== 'ALL' && docCategory !== category) return false;
    if (date) {
      const d = doc.createdAt ? dayjs(doc.createdAt).format('YYYY-MM-DD') : '';
      if (d !== date) return false;
    }
    if (!q) return true;
    const label = doc.actionSlug?.replace(/-/g, ' ') || 'document';
    const when = doc.createdAt ? dayjs(doc.createdAt).format('D MMM YYYY, HH:mm') : '';
    return (
      label.toLowerCase().includes(q) ||
      when.toLowerCase().includes(q) ||
      docCategory.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Search documents</Typography>
          <IconButton aria-label="Close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Search across your generated documents since sign-up.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, mb: 2, alignItems: 'center' }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or date…"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button onClick={onClose} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Select
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="CLAIMANT">Claimant</MenuItem>
              <MenuItem value="AGENT">Agent</MenuItem>
            </Select>
            <TextField
              type="date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredDocs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No documents match this search yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {filteredDocs.map((doc) => (
                <ListItemButton
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc)}
                >
                  <ListItemText
                    primary={doc.actionSlug?.replace(/-/g, ' ') || 'Document'}
                    secondary={
                      doc.createdAt
                        ? `${getCategoryFromSlug(doc.actionSlug)} • ${dayjs(doc.createdAt).format('D MMM YYYY, HH:mm')}`
                        : getCategoryFromSlug(doc.actionSlug)
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

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
            <IconButton
              aria-label="Zoom out"
              onClick={handleZoomOut}
              size="medium"
              disabled={zoomPercent <= MIN_ZOOM}
            >
              <ZoomOutIcon />
            </IconButton>
            <Box sx={{ width: 120 }}>
              <Slider
                size="small"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                value={zoomPercent}
                onChange={(_, value) => setZoomPercent(value)}
              />
            </Box>
            <Typography variant="body2" sx={{ width: 40 }}>
              {zoomPercent}%
            </Typography>
            <IconButton
              aria-label="Zoom in"
              onClick={handleZoomIn}
              size="medium"
              disabled={zoomPercent >= MAX_ZOOM}
            >
              <ZoomInIcon />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={!previewBlob && !previewTextContent}
            sx={{ ml: 1 }}
          >
            Download
          </Button>
        </Toolbar>
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
            display: 'flex',
            justifyContent: 'center',
            alignItems: previewLoading ? 'center' : 'flex-start',
            p: 2,
          }}
        >
          {previewLoading ? (
            <CircularProgress />
          ) : previewError ? (
            <Alert severity="error">{previewError}</Alert>
          ) : previewBlob ? (
            <Box
              ref={docxContainerRef}
              sx={{
                transform: `scale(${zoomPercent / 100})`,
                transformOrigin: 'top center',
              }}
              className="docx-preview-wrapper"
            />
          ) : (
            <Box
              sx={{
                maxWidth: 800,
                width: '100%',
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 2,
                boxShadow: 1,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 14,
              }}
            >
              {previewTextContent || 'No content to display.'}
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  );
}

