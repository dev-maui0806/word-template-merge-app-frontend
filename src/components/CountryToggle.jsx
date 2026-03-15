import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';

/**
 * CountryToggle – select active country (and persist in AppContext).
 * Supports fuzzy search similar to Admin countries tab.
 */
export default function CountryToggle({ compact = false }) {
  const { country, countryTimezoneId, setCountry, setCountryTimezone } = useApp();
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [timezones, setTimezones] = useState([]);
  const [tzLoading, setTzLoading] = useState(false);
  const [tzError, setTzError] = useState('');
  const [remoteCountries, setRemoteCountries] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState('');

  useEffect(() => {
    if (!open || countries.length > 0) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api('/countries', { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.error || 'Failed to load countries');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setCountries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load countries');
          setCountries([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, countries.length]);

  // Remote search across countries AND cities when user types.
  useEffect(() => {
    const q = search.trim();
    if (!open || q.length === 0) {
      setRemoteCountries(null);
      setRemoteError('');
      setRemoteLoading(false);
      return;
    }

    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError('');

    api(`/countries/search?q=${encodeURIComponent(q)}`, { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.error || 'Failed to search countries');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRemoteCountries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setRemoteError(err.message || 'Failed to search countries');
          setRemoteCountries([]);
        }
      })
      .finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, search]);

  const filteredCountries = useMemo(() => {
    const base = remoteCountries && search.trim() ? remoteCountries : countries;
    return [...base].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [countries, remoteCountries, search]);

  const handleSelectCountry = (c) => {
    setCountry(c.name);
    setCountryTimezone(null);
    setSelectedCountry(c);
    setTimezones([]);
    setTzError('');

    if (!c.hasMultipleTimezones) {
      // Single time zone country – we are done.
      setOpen(false);
      return;
    }

    // Load city / timezone options for this country.
    setTzLoading(true);
    api(`/countries/${c.id}/timezones`, { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.error || 'Failed to load time zones');
          });
        }
        return res.json();
      })
      .then((data) => {
        setTimezones(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setTzError(err.message || 'Failed to load time zones');
        setTimezones([]);
      })
      .finally(() => {
        setTzLoading(false);
      });
  };

  const handleSelectTimezone = (tz) => {
    setCountryTimezone(tz.id);
    setOpen(false);
  };

  const currentLabel = country || 'Select Country';

  const triggerStyles = (theme) => {
    const isDark = theme.palette.mode === 'dark';
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      px: compact ? 1 : 1.75,
      py: compact ? 0.5 : 0.9,
      borderRadius: compact ? '50%' : '999px',
      backgroundColor: isDark ? theme.palette.background.paper : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'}`,
      boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.55)' : '0 6px 16px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      color: theme.palette.text.primary,
      minWidth: compact ? 40 : undefined,
      minHeight: compact ? 40 : undefined,
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
      },
    };
  };

  return (
    <>
      {compact ? (
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          sx={(theme) => triggerStyles(theme)}
          aria-label="Select country"
        >
          <PublicIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOpen(true)}
          sx={(theme) => ({
            ...triggerStyles(theme),
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: '20px',
          })}
          startIcon={<PublicIcon sx={{ fontSize: 16 }} />}
        >
          {currentLabel}
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 4,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Country
          </Typography>
          <IconButton
            aria-label="Close"
            size="small"
            onClick={() => setOpen(false)}
            sx={{ ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search countries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1.1fr 1fr' },
              gap: 2,
              alignItems: 'flex-start',
            }}
          >
            {/* Left: country list */}
            <Box>
              {loading ? (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              ) : remoteLoading ? (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : remoteError ? (
                <Typography variant="body2" color="error">
                  {remoteError}
                </Typography>
              ) : filteredCountries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No countries match your search.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {filteredCountries.map((c) => (
                    <ListItemButton
                      key={c.id || c.code || c.name}
                      onClick={() => handleSelectCountry(c)}
                      selected={selectedCountry ? selectedCountry.id === c.id : c.name === country}
                    >
                      <ListItemText
                        primary={c.name}
                        secondary={
                          c.code || c.currency
                            ? [c.code, c.currency].filter(Boolean).join(' · ')
                            : undefined
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>

            {/* Right: timezone list for multi-timezone countries */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedCountry?.hasMultipleTimezones ? (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    City / time zone
                  </Typography>
                  {tzLoading ? (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : tzError ? (
                    <Typography variant="body2" color="error">
                      {tzError}
                    </Typography>
                  ) : timezones.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No cities configured yet.
                    </Typography>
                  ) : (
                    <List dense disablePadding sx={{ maxHeight: 260, overflow: 'auto' }}>
                      {timezones.map((tz) => (
                        <ListItemButton
                          key={tz.id}
                          onClick={() => handleSelectTimezone(tz)}
                          selected={tz.id === countryTimezoneId}
                        >
                          <ListItemText
                            primary={tz.cityName}
                            secondary={
                              [tz.timeShort, tz.countryCode, tz.currency]
                                .filter(Boolean)
                                .join(' · ')
                            }
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a country with multiple time zones (e.g. US, Canada) to choose a city.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

