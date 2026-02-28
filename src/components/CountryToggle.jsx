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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { api } from '../api/client.js';

/** Fallback when API fails */
const FALLBACK_COUNTRIES = [
  { value: 'India', label: 'IN India' },
  { value: 'UAE', label: 'AE UAE' },
  { value: 'Australia', label: 'AU Australia' },
];

export default function CountryToggle() {
  const { country, setCountry } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const open = Boolean(anchorEl);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.trim().toLowerCase();
    return countries.filter(
      (c) =>
        c.label?.toLowerCase().includes(q) || c.value?.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/countries', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((c) => ({ value: c.name, label: c.label || `${c.code} ${c.name}` }))
          : [];
        setCountries(list.length > 0 ? list : FALLBACK_COUNTRIES);
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

  const current =
    countries.find((c) => c.value === country) ||
    countries[0] ||
    FALLBACK_COUNTRIES.find((c) => c.value === country) ||
    FALLBACK_COUNTRIES[0];

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setSearch('');
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSearch('');
  };
  const handleSelect = (val) => {
    setCountry(val);
    handleClose();
  };

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
            border: `1px solid ${
              isDark ? 'rgba(255,255,255,0.18)' : '#e5e7eb'
            }`,
            color: theme.palette.text.primary,
            backgroundColor: isDark ? theme.palette.background.paper : '#fff',
            boxShadow: isDark
              ? '0 8px 20px rgba(0,0,0,0.55)'
              : '0 6px 16px rgba(0, 0, 0, 0.08)',
            display: { xs: 'none', sm: 'inline-flex' },
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.04)'
                : '#f9fafb',
            },
          };
        }}
      >
        {current?.label ?? 'Select country'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { mt: 1.5, minWidth: 220, maxHeight: 360, borderRadius: 2 },
          },
        }}
        MenuListProps={{ role: 'listbox' }}
      >
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
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.875rem',
              },
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
            key={c.value}
            selected={c.value === country}
            onClick={() => handleSelect(c.value)}
            sx={{ borderRadius: 1, mx: 0.5 }}
          >
            {c.value === country ? (
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
            ) : (
              <Box sx={{ width: 32 }} />
            )}
            {c.label}
          </MenuItem>
        )))
        }
      </Menu>
    </>
  );
}
