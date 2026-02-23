import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { api } from '../api/client.js';

const CATEGORIES = [
  { value: 'ALL', label: 'ALL' },
  { value: 'CAB', label: 'CAB' },
  { value: 'HOTEL', label: 'HOTEL' },
  { value: 'NOTARY', label: 'NOTARY' },
  { value: 'DOCTOR', label: 'DOCTOR' },
];

const FORM_CATEGORIES = [
  { value: 'CAB', label: 'CAB' },
  { value: 'HOTEL', label: 'HOTEL' },
  { value: 'NOTARY', label: 'NOTARY' },
  { value: 'DOCTOR', label: 'DOCTOR' },
  { value: 'CUSTOM', label: 'CUSTOM' },
];

export default function ContactDirectory({ open, onClose }) {
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Add form state
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formMail, setFormMail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCategory, setFormCategory] = useState('CAB');
  const [saving, setSaving] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await api(`/contacts?${params.toString()}`, { method: 'GET' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load contacts');
      }
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open, fetchContacts]);

  const handleAddNew = () => {
    setView('add');
    setFormName('');
    setFormNumber('');
    setFormMail('');
    setFormCity('');
    setFormCategory('CAB');
    setError('');
  };

  const handleCancelAdd = () => {
    setView('list');
    setError('');
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: formName.trim(),
          number: formNumber.trim(),
          mail: formMail.trim(),
          city: formCity.trim(),
          category: formCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save contact');
      }
      setView('list');
      setFormName('');
      setFormNumber('');
      setFormMail('');
      setFormCity('');
      fetchContacts();
    } catch (err) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (name) => {
    if (!name || !name.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return name.trim()[0].toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5"  fontWeight={600}>
            Contact Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MANAGE YOUR PROFESSIONAL NETWORK
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="medium">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2, px: 3, pb: 3 }}>
        {view === 'list' ? (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search contacts by name, number, mail or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 220 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {CATEGORIES.map(({ value, label }) => (
                  <Button
                    key={value}
                    size="small"
                    variant={categoryFilter === value ? 'contained' : 'outlined'}
                    onClick={() => setCategoryFilter(value)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '999px',
                      minWidth: 70,
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Box>

            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={handleAddNew}
              sx={{
                borderStyle: 'dashed',
                borderWidth: 2,
                py: 1.5,
                mb: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              ADD NEW CONTACT
            </Button>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  boxShadow: 'none',
                }}
              >
                <Table size="medium" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          bgcolor: 'action.hover',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          py: 1.5,
                        }}
                      >
                        NAME
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          bgcolor: 'action.hover',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          py: 1.5,
                        }}
                      >
                        NUMBER
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          bgcolor: 'action.hover',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          py: 1.5,
                        }}
                      >
                        MAIL
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          bgcolor: 'action.hover',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          py: 1.5,
                        }}
                      >
                        CITY
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{
                            py: 5,
                            textAlign: 'center',
                            color: 'text.secondary',
                            borderBottom: 'none',
                          }}
                        >
                          No contacts yet. Click &quot;ADD NEW CONTACT&quot; to add one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      contacts.map((c) => (
                        <TableRow
                          key={c.id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 'none' },
                            '& td': {
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              py: 2,
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'primary.main',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {getInitial(c.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {c.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {c.category}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{c.number || '—'}</TableCell>
                          <TableCell>{c.mail || '—'}</TableCell>
                          <TableCell>{c.city || '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        ) : (
          <Box component="form" onSubmit={handleSaveContact} sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                label="Full Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone Number"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email Address"
                value={formMail}
                onChange={(e) => setFormMail(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="City"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Categories and Save/Cancel on same line */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mt: 3,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  CATEGORY
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {FORM_CATEGORIES.map(({ value, label }) => (
                    <Button
                      key={value}
                      type="button"
                      size="small"
                      variant={formCategory === value ? 'contained' : 'outlined'}
                      onClick={() => setFormCategory(value)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '999px',
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                <Button onClick={handleCancelAdd} sx={{ textTransform: 'none' }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || !formName.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  {saving ? 'Saving…' : 'Save Contact'}
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
