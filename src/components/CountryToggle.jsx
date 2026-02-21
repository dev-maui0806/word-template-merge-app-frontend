import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';

const COUNTRIES = [
  { value: 'India', label: 'IN India' },
  { value: 'UAE', label: 'AE UAE' },
  { value: 'Australia', label: 'AU Australia' },
];

export default function CountryToggle() {
  const { country, setCountry } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const current = COUNTRIES.find((c) => c.value === country) || COUNTRIES[0];

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
        aria-haspopup="listbox"
        aria-expanded={open}
        startIcon={<PublicIcon sx={{ fontSize: 18 }} />}
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
        {current.label}
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
        {COUNTRIES.map((c) => (
          <MenuItem
            key={c.value}
            selected={c.value === country}
            onClick={() => handleSelect(c.value)}
            sx={{ borderRadius: 1, mx: 0.5 }}
          >
            {c.value === country && (
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
            )}
            {c.value !== country && <Box sx={{ width: 32 }} />}
            {c.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
