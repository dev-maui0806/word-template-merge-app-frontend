import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';

/**
 * CountryToggle – select active country (and persist in AppContext).
 * Supports fuzzy search similar to Admin countries tab.
 */
export default function CountryToggle({ compact = false }) {
  const { country, countryLabel, countryTimezoneId, setCountry, setCountryLabel, setCountryTimezone } = useApp();
  const anchorRef = useRef(null);
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
  const [view, setView] = useState('countries'); // 'countries' | 'timezones'

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

  // When we have a country name but no label (e.g. from localStorage), backfill label from loaded countries.
  useEffect(() => {
    if (!country || countryLabel || countries.length === 0) return;
    const match = countries.find((c) => (c.name || '').toLowerCase() === country.toLowerCase());
    if (match) {
      const label = match.label || `${match.code || ''} ${match.name || ''}`.trim() || match.name;
      if (label) setCountryLabel(label);
    }
  }, [country, countryLabel, countries, setCountryLabel]);

  // Remote search across countries AND cities when user types.
  useEffect(() => {
    const q = search.trim();
    // Only run remote search while looking at the country list.
    if (!open || view !== 'countries' || q.length === 0) {
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
  }, [open, view, search]);

  const filteredCountries = useMemo(() => {
    const base = remoteCountries && search.trim() ? remoteCountries : countries;
    return [...base].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [countries, remoteCountries, search]);

  const handleSelectCountry = (c) => {
    const isSameCountry =
      typeof country === 'string' &&
      typeof c?.name === 'string' &&
      country.trim().toLowerCase() === c.name.trim().toLowerCase();

    // Only reset timezone when switching to a different country.
    // If the user re-opens a multi-timezone country they already selected,
    // keep the previously selected city highlighted.
    if (!isSameCountry) {
      setCountry(c.name);
      setCountryTimezone(null);
    }

    // Always set/refresh label (safe even when same country).
    setCountryLabel(c.label || `${c.code || ''} ${c.name || ''}`.trim() || c.name);
    setSelectedCountry(c);
    setTimezones([]);
    setTzError('');

    if (!c.hasMultipleTimezones) {
      // Single time zone country – we are done.
      setOpen(false);
      return;
    }

    // For multi-timezone countries, switch to city view and load timezones.
    setView('timezones');
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
    // After choosing a city, go back to country list while keeping dropdown open.
    setView('countries');
    setSelectedCountry(null);
    setTimezones([]);
  };

  const currentLabel = countryLabel || country || 'Select Country';

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
          ref={anchorRef}
          size="small"
          onClick={() => {
            setOpen((prev) => !prev);
            setView('countries');
          }}
          sx={(theme) => triggerStyles(theme)}
          aria-label="Select country"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <PublicIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ) : (
        <Button
          ref={anchorRef}
          variant="outlined"
          size="small"
          onClick={() => {
            setOpen((prev) => !prev);
            setView('countries');
          }}
          sx={(theme) => ({
            ...triggerStyles(theme),
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: '20px',
          })}
          startIcon={<PublicIcon sx={{ fontSize: 16 }} />}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {currentLabel}
        </Button>
      )}

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 320,
              maxWidth: 420,
              maxHeight: 'min(80vh, 480px)',
              mt: 1.5,
              borderRadius: 2,
              boxShadow: 4,
            },
          },
        }}
      >
        <Box sx={{ p: 2, pt: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {view === 'countries'
                ? 'Select Country'
                : selectedCountry?.name || 'Select City / Time Zone'}
            </Typography>
            {view === 'timezones' && (
              <Button
                size="small"
                onClick={() => {
                  setView('countries');
                  setSelectedCountry(null);
                  setTimezones([]);
                  setTzError('');
                }}
                sx={{ textTransform: 'none', fontSize: 11, minWidth: 'auto' }}
              >
                Back
              </Button>
            )}
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search countries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={view === 'timezones'}
            sx={{ mb: 2 }}
          />
          <Box sx={{ minHeight: 140, maxHeight: 340, overflow: 'auto' }}>
            {view === 'countries' ? (
              <>
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
                        selected={c.name === country}
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
              </>
            ) : (
              <>
                {tzLoading ? (
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
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
                  <List dense disablePadding>
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
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}

