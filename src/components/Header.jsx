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
  InputAdornment,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme as useAppTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CountryToggle from './CountryToggle.jsx';
import ContactDirectory from './ContactDirectory.jsx';
import CalendarWidget from './CalendarWidget.jsx';
import DocumentHistoryDialog from './DocumentHistoryDialog.jsx';

const ADMIN_EMAIL = 'yasasrree02@gmail.com';

function isAdmin(user) {
  if (!user) return false;
  return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user.role === 'admin';
}

export default function Header() {
  const navigate = useNavigate();
  const { dark, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSettings = () => {
    handleClose();
    window.location.href = '/settings';
  };
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => {
          const isDark = theme.palette.mode === 'dark';
          return {
            maxWidth: '1500px',
            margin: 'auto',
            backgroundColor: isDark ? theme.palette.background.paper : '#f1f2f6',
            color: theme.palette.text.primary,
            borderBottom: 'none',
          };
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: 64,
            px: { xs: 1.5, sm: 3 },
            gap: 2,
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Red Pill Icon – acts as a Home/Dashboard button */}
            <Box
              onClick={() => navigate('/')}
              role="button"
              aria-label="Go to dashboard"
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#ff385c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(255, 56, 92, 0.35)',
                color: 'white',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(255, 56, 92, 0.5)',
                },
              }}
            >
              <DescriptionIcon sx={{ fontSize: 20 }} />
            </Box>

            {/* Logo Text */}
            <Box>
              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 500,
                  letterSpacing: '-0.75px',
                  lineHeight: '36px',
                }}
              >
                FA
                <span style={{ color: '#ff385c', fontWeight: 500 }}> DOC</span>
                PRO
              </Typography>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '1.4px',
                  color: '#9ca3af',
                  marginTop: '4px',
                }}
              >
                APPLICATION LAYER V5.0
              </Typography>
            </Box>
          </Box>

          {/* Center - Search & Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            {/* Search Pill */}
            <Box
              onClick={() => setSearchOpen(true)}
              sx={(theme) => {
                const isDark = theme.palette.mode === 'dark';
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  padding: '7px 12px',
                  backgroundColor: isDark ? theme.palette.background.paper : '#fff',
                  border: `1px solid ${
                    isDark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'
                  }`,
                  borderRadius: '50%',
                  boxShadow: isDark
                    ? '0 8px 20px rgba(0,0,0,0.55)'
                    : '0 6px 16px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'width 0.35s ease, padding 0.35s ease, background-color 0.2s ease',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.04)'
                      : '#f9fafb',
                  },
                };
              }}
            >
              <SearchIcon
                sx={(theme) => ({
                  fontSize: 16,
                  color: theme.palette.text.secondary,
                  flexShrink: 0,
                })}
              />
            </Box>

           

            {/* Dark/Light Toggle */}
            <IconButton
              size="small"
              onClick={toggleTheme}
              sx={(theme) => {
                const isDark = theme.palette.mode === 'dark';
                return {
                  width: 41,
                  height: 41,
                  borderRadius: '15px',
                  backgroundColor: isDark ? theme.palette.background.paper : '#fff',
                  border: `1px solid ${
                    isDark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'
                  }`,
                  boxShadow: isDark
                    ? '0 8px 20px rgba(0,0,0,0.55)'
                    : '0 6px 16px rgba(0, 0, 0, 0.08)',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.04)'
                      : '#f9fafb',
                  },
                };
              }}
            >
              {dark ? <DarkModeIcon sx={{ fontSize: 16 }} /> : <LightModeIcon sx={{ fontSize: 16 }} />}
            </IconButton>

            {/* Contacts Button */}
            {isAuthenticated && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setContactsOpen(true)}
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
                      isDark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'
                    }`,
                    color: theme.palette.text.primary,
                    backgroundColor: isDark
                      ? theme.palette.background.paper
                      : '#fff',
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
                <ContactPhoneIcon sx={{ mr: 0.5, fontSize: 14 }} />
                Contacts
              </Button>
            )}

            {/* Calendar Button */}
            {isAuthenticated && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCalendarOpen(true)}
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
                      isDark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'
                    }`,
                    color: theme.palette.text.primary,
                    backgroundColor: isDark
                      ? theme.palette.background.paper
                      : '#fff',
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
                <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 14 }} />
                Calendar
              </Button>
            )}

            {/* Country Toggle */}
            <CountryToggle />

            {/* User Profile */}
            {isAuthenticated && user ? (
              <>
                <Box
                  onClick={handleMenu}
                  sx={(theme) => {
                    const isDark = theme.palette.mode === 'dark';
                    return {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      padding: '4.5px',
                      backgroundColor: isDark
                        ? theme.palette.background.paper
                        : '#fff',
                      border: `1px solid ${
                        isDark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'
                      }`,
                      borderRadius: '50px',
                      boxShadow: isDark
                        ? '0 8px 20px rgba(0,0,0,0.55)'
                        : '0 6px 16px rgba(0, 0, 0, 0.08)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isDark
                          ? 'rgba(255,255,255,0.04)'
                          : '#f9fafb',
                      },
                    };
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'text.primary',
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name || user.email}
                  </Typography>
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.5,
                        minWidth: 180,
                        borderRadius: 1.5,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                      },
                    },
                  }}
                >
                  {isAdmin(user) && (
                    <MenuItem component={Link} to="/admin" onClick={handleClose}>
                      <AdminPanelSettingsIcon sx={{ mr: 1.5, fontSize: 14 }} />
                      Admin
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleSettings}>
                    <PersonOutlineIcon sx={{ mr: 1.5, fontSize: 14 }} />
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                    <LockIcon sx={{ mr: 1.5, fontSize: 14 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                component={Link}
                to="/auth/login"
                sx={{
                  width: 41,
                  height: 41,
                  borderRadius: '15px',
                  backgroundColor: '#ff385c',
                  color: '#fff',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                  '&:hover': { backgroundColor: '#ff1f47' },
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Document history (generated DOCX) */}
      <DocumentHistoryDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Contacts Dialog */}
      <ContactDirectory open={contactsOpen} onClose={() => setContactsOpen(false)} />

      {/* Calendar Dialog */}
      <CalendarWidget open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </>
  );
}
