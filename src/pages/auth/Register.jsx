import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

const GMAIL_SUFFIX = '@gmail.com';

export default function Register() {
  const navigate = useNavigate();
  const { persist } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);

  const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
  if (!localStorage.getItem('deviceId')) localStorage.setItem('deviceId', deviceId);

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          idToken: response.credential,
          deviceId,
          userAgent: navigator.userAgent,
        }),
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        persist(data.accessToken, data.refreshToken, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Google sign up failed');
      }
    } catch (err) {
      setError(err.message || 'Google sign up failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleBtnRef.current) return;
    const init = () => {
      if (typeof window.google === 'undefined') return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        width: Math.min(googleBtnRef.current?.offsetWidth || 400, 400),
      });
    };
    if (typeof window.google !== 'undefined') init();
    else {
      const t = setInterval(() => {
        if (typeof window.google !== 'undefined') {
          clearInterval(t);
          init();
        }
      }, 100);
      return () => clearInterval(t);
    }
  }, []);

  const normalizedEmail = email.trim().toLowerCase();
  const isGmail = normalizedEmail.endsWith(GMAIL_SUFFIX) && normalizedEmail.length > GMAIL_SUFFIX.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!isGmail) {
      setError('Please use your Gmail address (@gmail.com).');
      return;
    }

    setLoading(true);
    try {
      const res = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          deviceId,
          userAgent: navigator.userAgent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      if (!data.accessToken || !data.refreshToken || !data.user) {
        throw new Error('Unexpected response from server');
      }
      persist(data.accessToken, data.refreshToken, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a2530 0%, #252d35 100%)'
              : 'linear-gradient(135deg, #e8f4f8 0%, #f0f4f8 100%)',
        }}
      >
        <img
          src="/auth-img.webp"
          alt="Sign up"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
        <Card sx={{ maxWidth: 430, width: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                color: 'inherit',
                marginBottom: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  mr: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                FA DOC
              </Typography>
            </Link>
            <Typography variant="h5" sx={{ mb: 1, mt: 1, fontWeight: 700 }}>
              Create your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sign up with Google or use your Gmail address and a password.
            </Typography>

            <Box ref={googleBtnRef} sx={{ width: '100%', minHeight: 48, mb: 2, display: 'flex', justifyContent: 'center' }} aria-label="Sign up with Google" />

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">or</Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                type="email"
                label="email"
                placeholder="you@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                sx={{ mb: 1.5 }}
                helperText={email && !isGmail ? 'Only @gmail.com addresses are allowed' : ''}
                error={!!email && !isGmail}
              />
              <TextField
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                sx={{ mb: 1.5 }}
                helperText="At least 8 characters"
                inputProps={{ minLength: 8 }}
              />
              <TextField
                type="password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                sx={{ mb: 1.5 }}
                error={!!confirmPassword && password !== confirmPassword}
                helperText={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
              />
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5 }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                // disabled={loading || !isGmail || password.length < 8 || password !== confirmPassword}
                sx={{ padding: 1, fontSize: '1.15rem' }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link to="/auth/login" style={{ color: 'inherit', fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
