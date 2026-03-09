import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../api/client.js';

/** Fallback when API fails */
const FALLBACK_COUNTRIES = [
  {
    id: 'fallback-in',
    name: 'India',
    code: 'IN',
    label: 'IN India',
    hasMultipleTimezones: false,
    countryCode: '+91',
    standardTime: 'India Standard Time',
    timeShort: 'IST',
    currency: 'INR',
  },
  {
    id: 'fallback-ae',
    name: 'UAE',
    code: 'AE',
    label: 'AE UAE',
    hasMultipleTimezones: false,
    countryCode: '+971',
    standardTime: 'Gulf Standard Time (GST)',
    timeShort: 'GST',
    currency: 'AED',
  },
  {
    id: 'fallback-au',
    name: 'Australia',
    code: 'AU',
    label: 'AU Australia',
    hasMultipleTimezones: false,
    countryCode: '+61',
    standardTime: 'Australian Eastern Standard Time (AEST)',
    timeShort: 'AEST',
    currency: 'AUD',
  },
];

export default function CountryToggle() {
  const { country, countryTimezoneId, setCountry, setCountryTimezone } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuMode, setMenuMode] = useState('countries');
  const [timezoneCountry, setTimezoneCountry] = useState(null);
  const [timezones, setTimezones] = useState([]);
  const [timezonesLoading, setTimezonesLoading] = useState(false);
  const open = Boolean(anchorEl);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/countries', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCountries(Array.isArray(data) && data.length > 0 ? data : FALLBACK_COUNTRIES);
      } else {
        setCountries(FALLBACK_COUNTRIES);
      }
    } catch {
      setCountries(FALLBACK_COUNTRIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.name === country),
    [countries, country]
  );

  const fetchTimezones = useCallback(async (countryId) => {
    setTimezonesLoading(true);
    try {
      const res = await api(`/countries/${countryId}/timezones`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setTimezones(Array.isArray(data) ? data : []);
      } else {
        setTimezones([]);
      }
    } catch {
      setTimezones([]);
    } finally {
      setTimezonesLoading(false);
    }
  }, []);

  const selectedTimezone = useMemo(() => {
    if (!selectedCountry?.hasMultipleTimezones || !countryTimezoneId || !timezones.length) return null;
    return timezones.find((t) => t.id === countryTimezoneId) || null;
  }, [selectedCountry, countryTimezoneId, timezones]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.trim().toLowerCase();
    return countries.filter(
      (c) =>
        c.label?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setSearch('');
    setMenuMode('countries');
    setTimezoneCountry(null);
    setTimezones([]);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearch('');
    setMenuMode('countries');
    setTimezoneCountry(null);
    setTimezones([]);
  };

  const handleSelectCountry = (c) => {
    if (c.hasMultipleTimezones) {
      setTimezoneCountry(c);
      fetchTimezones(c.id);
      setMenuMode('timezones');
    } else {
      setCountry(c.name);
      setCountryTimezone(null);
      handleClose();
    }
  };

  const handleSelectTimezone = (tz) => {
    if (timezoneCountry) {
      setCountry(timezoneCountry.name);
      setCountryTimezone(tz.id);
    }
    handleClose();
  };

  const handleBackToCountries = () => {
    setMenuMode('countries');
    setTimezoneCountry(null);
    setTimezones([]);
    setSearch('');
  };

  const currentLabel = selectedCountry
    ? selectedCountry.hasMultipleTimezones && selectedTimezone
      ? `${selectedCountry.code} ${selectedCountry.name} • ${selectedTimezone.cityName}`
      : selectedCountry.label || `${selectedCountry.code} ${selectedCountry.name}`
    : 'Select country';

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        startIcon={
          loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <PublicIcon sx={{ fontSize: 18 }} />
          )
        }
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
        sx={(theme) => {
          const isDark = theme.palette.mode === 'dark';
          return {
            borderRadius: '20px',
            textTransform: 'none',
            px: 2,
            py: 0.8,
            fontSize: '12px',
            fontWeight: 700,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : '#e5e7eb'}`,
            color: theme.palette.text.primary,
            backgroundColor: isDark ? theme.palette.background.paper : '#fff',
            boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.55)' : '0 6px 16px rgba(0, 0, 0, 0.08)',
            display: { xs: 'none', sm: 'inline-flex' },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
            },
          };
        }}
      >
        {currentLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { mt: 1.5, minWidth: 260, maxHeight: 380, borderRadius: 2 },
          },
        }}
        MenuListProps={{ role: 'listbox' }}
      >
        {menuMode === 'timezones' ? (
          <>
            <Box sx={{ px: 1.5, py: 0.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={handleBackToCountries} aria-label="Back to countries">
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle2" color="text.secondary">
                {timezoneCountry?.label ?? timezoneCountry?.name} – Select city / time zone
              </Typography>
            </Box>
            {timezonesLoading ? (
              <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : timezones.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                No cities configured. Add them in Admin → Countries.
              </MenuItem>
            ) : (
              timezones.map((tz) => (
                <MenuItem
                  key={tz.id}
                  selected={tz.id === countryTimezoneId}
                  onClick={() => handleSelectTimezone(tz)}
                  sx={{ borderRadius: 1, mx: 0.5 }}
                >
                  {tz.id === countryTimezoneId ? (
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                  ) : (
                    <Box sx={{ width: 32 }} />
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {tz.cityName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tz.standardTime} ({tz.timeShort})
                      {tz.countryCode ? ` · ${tz.countryCode}` : ''}
                      {tz.currency ? ` · ${tz.currency}` : ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </>
        ) : (
          <>
            <Box sx={{ px: 1.5, pb: 1 }} onClick={(e) => e.stopPropagation()}>
              <TextField
                size="small"
                placeholder="Search country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.875rem' },
                }}
              />
            </Box>
            {filteredCountries.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                No countries match
              </MenuItem>
            ) : (
              filteredCountries.map((c) => (
                <MenuItem
                  key={c.id || c.code}
                  selected={
                    c.name === country &&
                    (!c.hasMultipleTimezones ||
                      (c.hasMultipleTimezones && Boolean(countryTimezoneId)))
                  }
                  onClick={() => handleSelectCountry(c)}
                  sx={{ borderRadius: 1, mx: 0.5 }}
                >
                  {c.name === country &&
                  (!c.hasMultipleTimezones ||
                    (c.hasMultipleTimezones && Boolean(countryTimezoneId))) ? (
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                  ) : (
                    <Box sx={{ width: 32 }} />
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {c.label || `${c.code} ${c.name}`}
                    </Typography>
                    {c.hasMultipleTimezones && (
                      <Typography variant="caption" color="text.secondary">
                        Multiple time zones – select city
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))
            )}
          </>
        )}
      </Menu>
    </>
  );
}
