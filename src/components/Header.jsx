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
  TextField,
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

const HEADER_HEIGHT = { xs: 56, sm: 64 };
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

        {/* Center search + right controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flex: 1, justifyContent: 'flex-end' }}>
          {/* Search templates pill */}
          <Box
            sx={{
              flex: { xs: 0, sm: 1 },
              maxWidth: 420,
              mx: { xs: 0.5, sm: 2 },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              onClick={() => setSearchOpen(true)}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 999,
                  bgcolor: 'background.default',
                  px: 1,
                },
              }}
            />
          </Box>

         

          {/* Contacts & Calendar buttons, matching pill style */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 1 }}>

               {/* Dark / light toggle as sun/moon icon */}
           <IconButton
            size="small"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            sx={{
              borderRadius: 999,
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            {dark ? (
              <DarkModeIcon sx={{ fontSize: 18 }} />
            ) : (
              <LightModeIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ContactPhoneIcon sx={{ fontSize: 18 }} />}
                onClick={() => setContactsOpen(true)}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.8rem',
                }}
              >
                Contacts
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                onClick={() => setCalendarOpen(true)}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.8rem',
                }}
              >
                Calendar
              </Button>
            </Box>
          )}

          
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

      {/* Search templates dialog (document history + search) */}
      <DocumentHistoryDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Contacts dialog (managed inside ContactDirectory) */}
      <ContactDirectory open={contactsOpen} onClose={() => setContactsOpen(false)} />

      {/* Calendar dialog (managed inside CalendarWidget) */}
      <CalendarWidget open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </AppBar>
  );
}
