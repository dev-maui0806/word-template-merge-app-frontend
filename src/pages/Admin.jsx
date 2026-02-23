import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Slider,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import PublicIcon from '@mui/icons-material/Public';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../api/client.js';
import TemplateEditorDialog from '../components/TemplateEditorDialog.jsx';
import { renderAsync } from 'docx-preview';
import dayjs from 'dayjs';

const ACTION_LABELS = {
  'arrange-venue': 'Arrange Venue',
  'cancel-venue': 'Cancel Venue',
  'arrange-transportation': 'Arrange Transportation',
  'cancel-transportation': 'Cancel Transportation',
  'arrange-accommodation': 'Arrange Accommodation',
  'cancel-accommodation': 'Cancel Accommodation',
  'arrange-notary': 'Arrange Notary',
  'cancel-notary': 'Cancel Notary',
  'arrange-ent-test': 'Arrange ENT Test',
  'cancel-ent-test': 'Cancel ENT Test',
  'no-transportation-needed': 'No Transportation Needed',
  'contact-claimant': 'Contact Claimant',
  'fa-traveled-to-attend': 'FA Traveled to Attend',
  'fa-booked-flight-ticket': 'FA Booked Flight Ticket',
  'fa-cancelled-flight-ticket': 'FA Cancelled Flight Ticket',
  'fa-traveled-back': 'FA Traveled Back',
  'fa-attend': 'FA Attend',
};

export default function Admin() {
  const [tab, setTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [countryDialog, setCountryDialog] = useState(false);
  const [countryForm, setCountryForm] = useState({
    name: '',
    code: '',
    label: '',
    standardTime: '',
    countryCode: '',
    timeShort: '',
    currency: '',
    order: 0,
  });
  const [editingCountry, setEditingCountry] = useState(null);
  const [savingCountry, setSavingCountry] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorActionSlug, setEditorActionSlug] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userDocsOpen, setUserDocsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocs, setUserDocs] = useState([]);
  const [userDocsLoading, setUserDocsLoading] = useState(false);
  const [userDocsError, setUserDocsError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null); // { userId, id, actionSlug }
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewTextContent, setPreviewTextContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [zoomPercent, setZoomPercent] = useState(100);
  const docxContainerRef = useRef(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await api('/admin/templates', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load templates');
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await api('/countries', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load countries');
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api('/admin/users', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchTemplates(), fetchCountries(), fetchUsers()]).finally(() => setLoading(false));
  }, [fetchTemplates, fetchCountries, fetchUsers]);

  const handleUpload = async (actionSlug, fileInput) => {
    const file = fileInput?.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('Only .docx files are allowed');
      return;
    }
    setUploading(actionSlug);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
      const url = `${base}/api/admin/templates/${actionSlug}/upload`;
      const at = localStorage.getItem('accessToken');
      const res = await fetch(url,
        {
          method: 'POST',
          headers: at ? { Authorization: `Bearer ${at}` } : {},
          body: formData,
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(null);
      fileInput.value = '';
    }
  };

  const handleDeleteTemplate = async (actionSlug) => {
    setDeletingTemplate(actionSlug);
    setError('');
    try {
      const res = await api(`/admin/templates/${actionSlug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingTemplate(null);
    }
  };

  const openCountryDialog = (country = null) => {
    if (country) {
      setEditingCountry(country.id);
      setCountryForm({
        name: country.name,
        code: country.code,
        label: country.label,
        standardTime: country.standardTime,
        countryCode: country.countryCode,
        timeShort: country.timeShort,
        currency: country.currency,
        order: country.order ?? 0,
      });
    } else {
      setEditingCountry(null);
      setCountryForm({
        name: '',
        code: '',
        label: '',
        standardTime: '',
        countryCode: '',
        timeShort: '',
        currency: '',
        order: countries.length,
      });
    }
    setCountryDialog(true);
  };

  const handleSaveCountry = async () => {
    setSavingCountry(true);
    setError('');
    try {
      if (editingCountry) {
        const res = await api(`/admin/countries/${editingCountry}`, {
          method: 'PATCH',
          body: JSON.stringify(countryForm),
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await api('/admin/countries', {
          method: 'POST',
          body: JSON.stringify(countryForm),
        });
        if (!res.ok) throw new Error('Create failed');
      }
      setCountryDialog(false);
      await fetchCountries();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCountry(false);
    }
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm('Delete this country?')) return;
    try {
      const res = await api(`/admin/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchCountries();
    } catch (err) {
      setError(err.message);
    }
  };

  const MIN_ZOOM = 50;
  const MAX_ZOOM = 200;

  const handleOpenUserDocs = async (user) => {
    setSelectedUser(user);
    setUserDocsOpen(true);
    setUserDocs([]);
    setUserDocsError('');
    setUserDocsLoading(true);
    try {
      const res = await api(`/admin/users/${user.id}/documents`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load documents');
      const data = await res.json();
      setUserDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      setUserDocsError(err.message || 'Failed to load documents');
      setUserDocs([]);
    } finally {
      setUserDocsLoading(false);
    }
  };

  const handleCloseUserDocs = () => {
    setUserDocsOpen(false);
    setSelectedUser(null);
    setUserDocs([]);
    setUserDocsError('');
  };

  const handleSelectUserDocument = async (doc) => {
    if (!selectedUser) return;
    setUserDocsOpen(false);
    setPreviewError('');
    setPreviewBlob(null);
    setPreviewTextContent('');
    setZoomPercent(100);
    setPreviewLoading(true);
    const docMeta = { userId: selectedUser.id, id: doc.id, actionSlug: doc.actionSlug };
    setTimeout(() => setPreviewDoc(docMeta), 0);
    try {
      const fileRes = await api(`/admin/users/${selectedUser.id}/documents/${doc.id}/file`, { method: 'GET' });
      if (fileRes.ok) {
        const blob = await fileRes.blob();
        setPreviewBlob(blob);
        setPreviewLoading(false);
        return;
      }
      const docRes = await api(`/admin/users/${selectedUser.id}/documents/${doc.id}`, { method: 'GET' });
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

  const handleZoomOut = () => {
    setZoomPercent((z) => Math.max(MIN_ZOOM, z - 10));
  };

  const handleZoomIn = () => {
    setZoomPercent((z) => Math.min(MAX_ZOOM, z + 10));
  };

  const handleZoomSlider = (_, value) => {
    setZoomPercent(value);
  };

  const handleDownload = () => {
    if (!previewBlob || !previewDoc) return;
    const slug = (previewDoc.actionSlug || 'document').replace(/\s+/g, '-');
    const url = URL.createObjectURL(previewBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.docx`;
    a.click();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: 'white',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 4,
          px: 3,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Admin Panel
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Manage templates and countries
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
            '& .Mui-selected': { color: 'white', fontWeight: 600 },
            '& .MuiTabs-indicator': { bgcolor: '#818cf8' },
          }}
        >
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Templates" />
          <Tab icon={<PublicIcon />} iconPosition="start" label="Countries" />
          <Tab icon={<PeopleAltIcon />} iconPosition="start" label="Users" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : tab === 0 ? (
          /* Templates */
          <Grid container spacing={2}>
            {templates.map((t) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={t.actionSlug}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'white', flex: 1 }}>
                        {ACTION_LABELS[t.actionSlug] || t.actionSlug}
                      </Typography>
                      <Chip
                        size="small"
                        icon={t.exists ? <CheckCircleIcon /> : <ErrorIcon />}
                        label={t.exists ? 'Ready' : 'Missing'}
                        color={t.exists ? 'success' : 'error'}
                        sx={{ ml: 0.5 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 1.5 }}>
                      {t.templateFile}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditNoteIcon fontSize="small" />}
                        onClick={() => {
                          setEditorActionSlug(t.actionSlug);
                          setEditorOpen(true);
                        }}
                        sx={{
                          color: '#a78bfa',
                          borderColor: 'rgba(167,139,250,0.5)',
                          '&:hover': {
                            borderColor: '#a78bfa',
                            bgcolor: 'rgba(167,139,250,0.1)',
                          },
                        }}
                        variant="outlined"
                      >
                        Manually Create and Edit
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <input
                        type="file"
                        accept=".docx"
                        hidden
                        id={`upload-${t.actionSlug}`}
                        onChange={(e) => handleUpload(t.actionSlug, e.target)}
                      />
                      <Button
                        component="label"
                        htmlFor={`upload-${t.actionSlug}`}
                        size="small"
                        startIcon={
                          uploading === t.actionSlug ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <CloudUploadIcon fontSize="small" />
                          )
                        }
                        disabled={uploading === t.actionSlug}
                        sx={{
                          color: '#818cf8',
                          borderColor: 'rgba(129,140,248,0.5)',
                          '&:hover': {
                            borderColor: '#818cf8',
                            bgcolor: 'rgba(129,140,248,0.1)',
                          },
                        }}
                        variant="outlined"
                      >
                        Upload
                      </Button>
                      {t.exists && (
                        <Tooltip title="Delete template">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTemplate(t.actionSlug)}
                            disabled={deletingTemplate === t.actionSlug}
                          >
                            {deletingTemplate === t.actionSlug ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : tab === 1 ? (
          /* Countries */
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openCountryDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                }}
              >
                Add Country
              </Button>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Currency</TableCell>
                    <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {countries.map((c) => (
                    <TableRow key={c.id} sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <TableCell sx={{ color: 'white' }}>{c.name}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.code}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.timeShort}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.countryCode}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.currency}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openCountryDialog(c)} sx={{ color: '#818cf8' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteCountry(c.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          /* Users */
          <Box>
            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: 'white' }} />
              </Box>
            ) : users.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                No users found.
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Subscription</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Trial Docs</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Joined</TableCell>
                      <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                        History
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <TableCell sx={{ color: 'white' }}>{u.email}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{u.name || '—'}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>
                          {u.role}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {u.subscriptionStatus || 'trial'}
                          {u.subscriptionPlan ? ` · ${u.subscriptionPlan}` : ''}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{u.trialDocCount ?? 0}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {u.trialStartDate ? dayjs(u.trialStartDate).format('D MMM YYYY') : ''}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View document history">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenUserDocs(u)}
                              sx={{ color: '#818cf8' }}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>

      {/* Country Dialog */}
      <Dialog
        open={countryDialog}
        onClose={() => setCountryDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          {editingCountry ? 'Edit Country' : 'Add Country'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {['name', 'code', 'label', 'standardTime', 'countryCode', 'timeShort', 'currency', 'order'].map(
              (key) => (
                <TextField
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  value={countryForm[key] ?? ''}
                  onChange={(e) =>
                    setCountryForm((prev) => ({
                      ...prev,
                      [key]: key === 'order' ? Number(e.target.value) || 0 : e.target.value,
                    }))
                  }
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                />
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCountryDialog(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCountry}
            disabled={savingCountry || !countryForm.name || !countryForm.code}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            {savingCountry ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User documents list dialog */}
      <Dialog
        open={userDocsOpen}
        onClose={handleCloseUserDocs}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {selectedUser ? `Documents — ${selectedUser.email}` : 'Documents'}
          </Typography>
          <IconButton aria-label="Close" onClick={handleCloseUserDocs} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {userDocsError && (
            <Alert severity="error" onClose={() => setUserDocsError('')} sx={{ mb: 2 }}>
              {userDocsError}
            </Alert>
          )}
          {userDocsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : userDocs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No documents for this user yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {userDocs.map((doc) => (
                <ListItemButton key={doc.id} onClick={() => handleSelectUserDocument(doc)}>
                  <ListItemText
                    primary={doc.actionSlug?.replace(/-/g, ' ') || 'Document'}
                    secondary={
                      doc.createdAt ? dayjs(doc.createdAt).format('D MMM YYYY, HH:mm') : ''
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

      {/* Full-screen document preview for admin */}
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
                onChange={handleZoomSlider}
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
            disabled={!previewBlob}
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

      <TemplateEditorDialog
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditorActionSlug(null);
        }}
        actionSlug={editorActionSlug}
        actionLabel={editorActionSlug ? ACTION_LABELS[editorActionSlug] : ''}
        templateExists={templates.find((x) => x.actionSlug === editorActionSlug)?.exists ?? false}
        onSaved={fetchTemplates}
      />
    </Box>
  );
}
