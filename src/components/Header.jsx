import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Switch,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockIcon from '@mui/icons-material/Lock';
import { useTheme as useAppTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CountryToggle from './CountryToggle.jsx';

const HEADER_HEIGHT = { xs: 56, sm: 64 };
const ADMIN_EMAIL = 'ipkaushal16@gmail.com';

function isAdmin(user) {
  if (!user) return false;
  return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user.role === 'admin';
}

export default function Header() {
  const { dark, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: HEADER_HEIGHT,
          maxHeight: HEADER_HEIGHT,
          maxWidth: 'xl',
          mx: 'auto',
          width: '100%',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 1,
            }}
          >
            <DescriptionIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              FA DOC
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.1, fontSize: '0.7rem' }}
            >
              Welcome back
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                mr: 0.25,
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              {dark ? 'Night' : 'Day'}
            </Box>
            <Switch
              size="small"
              checked={dark}
              onChange={toggleTheme}
              sx={{ m: 0 }}
              inputProps={{ 'aria-label': 'Dark mode' }}
            />
          </Box>
          <CountryToggle />
          {isAuthenticated && user ? (
            <>
              <IconButton
                onClick={handleMenu}
                aria-label="Profile"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: { mt: 1.5, minWidth: 160, borderRadius: 2, boxShadow: 2 },
                  },
                }}
              >
                {isAdmin(user) && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={handleClose}
                  >
                    <AdminPanelSettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Admin
                  </MenuItem>
                )}
                <MenuItem onClick={handleSettings}>
                  <PersonOutlineIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LockIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton
              component={Link}
              to="/auth/login"
              aria-label="Login"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastText' },
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
