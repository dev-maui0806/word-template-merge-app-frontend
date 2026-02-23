import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
  CircularProgress,
} from '@mui/material';
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
  const open = Boolean(anchorEl);

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

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
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
        sx={{
          textTransform: 'none',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          minWidth: 'auto',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
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
            sx: { mt: 1.5, minWidth: 160, borderRadius: 2 },
          },
        }}
        MenuListProps={{ role: 'listbox' }}
      >
        {countries.map((c) => (
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
        ))}
      </Menu>
    </>
  );
}
