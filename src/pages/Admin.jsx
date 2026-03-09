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
  FormControlLabel,
  Checkbox,
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
import LocationCityIcon from '@mui/icons-material/LocationCity';
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
  'contact-claimant-required-transportation': 'Contact Claimant – Required Transportation',
  'contact-claimant-not-required-transportation': 'Contact Claimant – NOT Required Transportation',
  'contact-claimant-required-both': 'Contact Claimant – Required Both',
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
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [countryDialog, setCountryDialog] = useState(false);
  const [countryForm, setCountryForm] = useState({
    name: '',
    code: '',
    label: '',
    hasMultipleTimezones: false,
    standardTime: '',
    countryCode: '',
    timeShort: '',
    currency: '',
    order: 0,
  });
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryTimezones, setCountryTimezones] = useState([]);
  const [savingCountry, setSavingCountry] = useState(false);
  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [timezoneForm, setTimezoneForm] = useState({
    cityName: '',
    standardTime: '',
    timeShort: '',
    countryCode: '',
    currency: '',
  });
  const [editingTimezoneId, setEditingTimezoneId] = useState(null);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [viewTimezonesOpen, setViewTimezonesOpen] = useState(false);
  const [viewTimezonesCountry, setViewTimezonesCountry] = useState(null);
  const [viewTimezones, setViewTimezones] = useState([]);
  const [viewTimezonesLoading, setViewTimezonesLoading] = useState(false);
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
  const [countrySearch, setCountrySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      const res = await api('/admin/subscription/plans', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load subscription plans');
      const data = await res.json();
      setSubscriptionPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

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
    Promise.all([fetchTemplates(), fetchCountries(), fetchUsers(), fetchSubscriptionPlans()]).finally(() =>
      setLoading(false)
    );
  }, [fetchTemplates, fetchCountries, fetchUsers, fetchSubscriptionPlans]);

  useEffect(() => {
    if (countryDialog && editingCountry) {
      api(`/countries/${editingCountry}/timezones`, { method: 'GET' })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setCountryTimezones(Array.isArray(data) ? data : []))
        .catch(() => setCountryTimezones([]));
    }
  }, [countryDialog, editingCountry]);

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
        hasMultipleTimezones: Boolean(country.hasMultipleTimezones),
        standardTime: country.standardTime ?? '',
        countryCode: country.countryCode ?? '',
        timeShort: country.timeShort ?? '',
        currency: country.currency ?? '',
        order: country.order ?? 0,
      });
      setCountryTimezones([]);
    } else {
      setEditingCountry(null);
      setCountryTimezones([]);
      setCountryForm({
        name: '',
        code: '',
        label: '',
        hasMultipleTimezones: false,
        standardTime: '',
        countryCode: '',
        timeShort: '',
        currency: '',
        order: countries.length,
      });
    }
    setCountryDialog(true);
  };

  const fetchCountryTimezones = useCallback(async () => {
    if (!editingCountry) return;
    try {
      const res = await api(`/countries/${editingCountry}/timezones`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCountryTimezones(Array.isArray(data) ? data : []);
      }
    } catch {
      setCountryTimezones([]);
    }
  }, [editingCountry]);

  const openViewTimezones = async (country) => {
    setViewTimezonesCountry(country);
    setViewTimezonesOpen(true);
    setViewTimezones([]);
    setViewTimezonesLoading(true);
    try {
      const res = await api(`/countries/${country.id}/timezones`, { method: 'GET' });
      if (!res.ok) {
        setViewTimezones([]);
        return;
      }
      const data = await res.json();
      setViewTimezones(Array.isArray(data) ? data : []);
    } catch {
      setViewTimezones([]);
    } finally {
      setViewTimezonesLoading(false);
    }
  };

  const handleSaveCountry = async () => {
    if (!countryForm.hasMultipleTimezones && (!countryForm.standardTime || !countryForm.countryCode || !countryForm.timeShort || !countryForm.currency)) {
      setError('Single time zone country requires Time, Phone, Time Short, and Currency.');
      return;
    }
    setSavingCountry(true);
    setError('');
    try {
      if (editingCountry) {
        const res = await api(`/admin/countries/${editingCountry}`, {
          method: 'PATCH',
          body: JSON.stringify(countryForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Update failed');
        }
        setCountryDialog(false);
        await fetchCountries();
      } else {
        const res = await api('/admin/countries', {
          method: 'POST',
          body: JSON.stringify(countryForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Create failed');
        }
        const created = await res.json();
        if (created.id && countryForm.hasMultipleTimezones) {
          setEditingCountry(created.id);
          setCountryForm((prev) => ({ ...prev, ...created }));
          setCountryTimezones([]);
        } else {
          setCountryDialog(false);
          await fetchCountries();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCountry(false);
    }
  };

  const openTimezoneDialog = (tz = null) => {
    if (tz) {
      setEditingTimezoneId(tz.id);
      setTimezoneForm({
        cityName: tz.cityName ?? '',
        standardTime: tz.standardTime ?? '',
        timeShort: tz.timeShort ?? '',
        countryCode: tz.countryCode ?? '',
        currency: tz.currency ?? '',
      });
    } else {
      setEditingTimezoneId(null);
      setTimezoneForm({
        cityName: '',
        standardTime: '',
        timeShort: '',
        countryCode: countryForm.countryCode ?? '',
        currency: countryForm.currency ?? '',
      });
    }
    setTimezoneDialogOpen(true);
  };

  const handleSaveTimezone = async () => {
    if (!editingCountry || (!timezoneForm.cityName || !timezoneForm.standardTime || !timezoneForm.timeShort)) {
      setError('City name, standard time, and time short are required.');
      return;
    }
    setSavingTimezone(true);
    setError('');
    try {
      if (editingTimezoneId) {
        const res = await api(`/admin/countries/${editingCountry}/timezones/${editingTimezoneId}`, {
          method: 'PATCH',
          body: JSON.stringify(timezoneForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Update failed');
        }
      } else {
        const res = await api(`/admin/countries/${editingCountry}/timezones`, {
          method: 'POST',
          body: JSON.stringify(timezoneForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Create failed');
        }
      }
      await fetchCountryTimezones();
      setTimezoneDialogOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTimezone(false);
    }
  };

  const handleDeleteTimezone = async (timezoneId) => {
    if (!editingCountry || !window.confirm('Remove this city/time zone?')) return;
    setError('');
    try {
      const res = await api(`/admin/countries/${editingCountry}/timezones/${timezoneId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchCountryTimezones();
    } catch (err) {
      setError(err.message);
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
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Subscription" />
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
                        {t.exists ? 'Change' : 'Upload'}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <TextField
                size="small"
                placeholder="Search countries…"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                sx={{
                  maxWidth: 320,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                }}
              />
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
                  {countries
                    .filter((c) => {
                      if (!countrySearch.trim()) return true;
                      const q = countrySearch.trim().toLowerCase();
                      return (
                        c.name?.toLowerCase().includes(q) ||
                        c.code?.toLowerCase().includes(q) ||
                        c.currency?.toLowerCase().includes(q)
                      );
                    })
                    .map((c) => (
                    <TableRow key={c.id} sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <TableCell sx={{ color: 'white' }}>{c.name}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.code}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {c.hasMultipleTimezones ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}
                            >
                              Multiple
                            </Typography>
                            <Tooltip title="View cities and time zones">
                              <IconButton
                                size="small"
                                sx={{ color: '#a5b4fc' }}
                                onClick={() => openViewTimezones(c)}
                              >
                                <LocationCityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          c.timeShort ?? '—'
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.countryCode ?? '—'}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{c.currency ?? '—'}</TableCell>
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
        ) : tab === 2 ? (
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    px: 2,
                    pt: 1.5,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Search users…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    sx={{
                      maxWidth: 320,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                    }}
                  />
                </Box>
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
                    {users
                      .filter((u) => {
                        if (!userSearch.trim()) return true;
                        const q = userSearch.trim().toLowerCase();
                        return (
                          u.email?.toLowerCase().includes(q) ||
                          u.name?.toLowerCase().includes(q) ||
                          u.role?.toLowerCase().includes(q)
                        );
                      })
                      .map((u) => (
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
        ) : (
          /* Subscription plans */
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Subscription plans
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 3 }}>
              Update the subscription price for each plan. Changes apply to new PhonePe checkouts immediately.
            </Typography>
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
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Plan</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Duration (months)</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Current price (₹)</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Default price (₹)</TableCell>
                    <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptionPlans.map((plan) => (
                    <SubscriptionPlanRow
                      key={plan.id}
                      plan={plan}
                      onUpdated={fetchSubscriptionPlans}
                      setError={setError}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(countryForm.hasMultipleTimezones)}
                  onChange={(e) =>
                    setCountryForm((prev) => ({ ...prev, hasMultipleTimezones: e.target.checked }))
                  }
                  sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#818cf8' } }}
                />
              }
              label={
                <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Has multiple time zones (show city dropdown)
                </Typography>
              }
            />
            {['name', 'code', 'label'].map((key) => (
              <TextField
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                value={countryForm[key] ?? ''}
                onChange={(e) =>
                  setCountryForm((prev) => ({
                    ...prev,
                    [key]: e.target.value,
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
            ))}
            {(!countryForm.hasMultipleTimezones || editingCountry) && (
              <>
                {['standardTime', 'countryCode', 'timeShort', 'currency', 'order'].map((key) => (
                  <TextField
                    key={key}
                    label={
                      key === 'standardTime'
                        ? 'Time (e.g. India Standard Time)'
                        : key === 'countryCode'
                          ? 'Phone'
                          : key === 'timeShort'
                            ? 'Time short (e.g. IST)'
                            : key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
                    }
                    value={countryForm[key] ?? ''}
                    onChange={(e) =>
                      setCountryForm((prev) => ({
                        ...prev,
                        [key]: key === 'order' ? Number(e.target.value) || 0 : e.target.value,
                      }))
                    }
                    size="small"
                    placeholder={countryForm.hasMultipleTimezones ? 'Default (optional)' : undefined}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                ))}
              </>
            )}
            {countryForm.hasMultipleTimezones && editingCountry && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                  City / Time zones
                </Typography>
                <TableContainer component={Paper} sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 1, mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>City</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>Time</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>Short</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>Phone</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>Currency</TableCell>
                        <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.8)' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {countryTimezones.map((tz) => (
                        <TableRow key={tz.id}>
                          <TableCell sx={{ color: 'white' }}>{tz.cityName}</TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.standardTime}</TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.timeShort}</TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.countryCode ?? '—'}</TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.currency ?? '—'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => openTimezoneDialog(tz)} sx={{ color: '#a78bfa' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteTimezone(tz.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => openTimezoneDialog()}
                  sx={{ color: '#818cf8' }}
                >
                  Add city / time zone
                </Button>
              </Box>
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
            disabled={
              savingCountry ||
              !countryForm.name ||
              !countryForm.code ||
              (!countryForm.hasMultipleTimezones &&
                (!countryForm.standardTime || !countryForm.countryCode || !countryForm.timeShort || !countryForm.currency))
            }
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            {savingCountry ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Timezone (city) dialog for multi-TZ countries */}
      <Dialog
        open={timezoneDialogOpen}
        onClose={() => setTimezoneDialogOpen(false)}
        maxWidth="xs"
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
          {editingTimezoneId ? 'Edit city / time zone' : 'Add city / time zone'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {['cityName', 'standardTime', 'timeShort', 'countryCode', 'currency'].map((key) => (
              <TextField
                key={key}
                label={
                  key === 'cityName'
                    ? 'City name'
                    : key === 'standardTime'
                      ? 'Time (e.g. Pacific Standard Time)'
                      : key === 'timeShort'
                        ? 'Time short (e.g. PST)'
                        : key === 'countryCode'
                          ? 'Phone'
                          : 'Currency'
                }
                value={timezoneForm[key] ?? ''}
                onChange={(e) =>
                  setTimezoneForm((prev) => ({ ...prev, [key]: e.target.value }))
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
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTimezoneDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTimezone}
            disabled={
              savingTimezone ||
              !timezoneForm.cityName ||
              !timezoneForm.standardTime ||
              !timezoneForm.timeShort
            }
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            {savingTimezone ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View-only dialog for cities / time zones from the countries table */}
      <Dialog
        open={viewTimezonesOpen}
        onClose={() => setViewTimezonesOpen(false)}
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
        <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {viewTimezonesCountry ? `Cities – ${viewTimezonesCountry.name}` : 'Cities & time zones'}
          </Typography>
          <IconButton onClick={() => setViewTimezonesOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewTimezonesLoading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : viewTimezones.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              No cities configured yet for this country.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Time</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Short</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {viewTimezones.map((tz) => (
                  <TableRow key={tz.id}>
                    <TableCell sx={{ color: 'white' }}>{tz.cityName}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.standardTime}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.timeShort}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.countryCode ?? '—'}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.85)' }}>{tz.currency ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
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

function SubscriptionPlanRow({ plan, onUpdated, setError }) {
  const [value, setValue] = useState(plan.amountRupees ?? plan.defaultAmountRupees ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Please enter a valid positive price.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api(`/admin/subscription/plans/${plan.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ amountRupees: parsed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update subscription plan');
      }
      await onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TableRow sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <TableCell sx={{ color: 'white', textTransform: 'capitalize' }}>{plan.name}</TableCell>
      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{plan.months}</TableCell>
      <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputProps={{ min: 1 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            width: 140,
          }}
        />
      </TableCell>
      <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
        {plan.defaultAmountRupees ? plan.defaultAmountRupees.toLocaleString('en-IN') : '—'}
      </TableCell>
      <TableCell align="right">
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={saving}
          sx={{
            textTransform: 'none',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
          }}
        >
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
        </Button>
      </TableCell>
    </TableRow>
  );
}
