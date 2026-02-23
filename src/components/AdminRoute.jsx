import { Link, Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Alert, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext.jsx';
import Header from './Header.jsx';

const ADMIN_EMAIL = 'yasasrree02@gmail.com';

function isAdmin(user) {
  if (!user) return false;
  return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user.role === 'admin';
}

export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!isAdmin(user)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 480, width: '100%' }}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ mb: 2 }}
          >
            Admin access required
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can still use all action types from the dashboard—select Claimant or Agent actions, fill in template variables, and generate documents. Trial users have full access to document generation (up to 5 documents).
          </Typography>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} color="error" sx={{ textTransform: 'none' }}>
            Back
          </Button>
        </Box>
      </Box>
    );
  }

  return children;
}
