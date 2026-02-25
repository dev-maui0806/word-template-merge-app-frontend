import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Divider } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { persist } = useAuth();
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input');
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'pin'
  const [pin, setPin] = useState('');
  const [pinLockSeconds, setPinLockSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const googleBtnRef = useRef(null);

  const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
  if (!localStorage.getItem('deviceId')) localStorage.setItem('deviceId', deviceId);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = method === 'email'
        ? await api('/auth/otp/email/send', {
            method: 'POST',
            body: JSON.stringify({ email, deviceId, userAgent: navigator.userAgent }),
          })
        : await api('/auth/otp/mobile/send', {
            method: 'POST',
            body: JSON.stringify({ mobile, deviceId, userAgent: navigator.userAgent }),
          });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setSuccess(`OTP sent successfully to your ${method === 'email' ? 'email' : 'mobile number'}!`);
      setStep('verify');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (method === 'email') {
        res = await api('/auth/otp/email/verify', {
          method: 'POST',
          body: JSON.stringify({ email, otp, deviceId, userAgent: navigator.userAgent }),
        });
      } else {
        res = await api('/auth/otp/mobile/verify', {
          method: 'POST',
          body: JSON.stringify({ mobile, otp, deviceId, userAgent: navigator.userAgent }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired OTP');
      }
      if (!data.accessToken || !data.refreshToken || !data.user) {
        throw new Error('Unexpected OTP response from server');
      }
      persist(data.accessToken, data.refreshToken, data.user);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeContact = () => {
    setStep('input');
    setEmail('');
    setMobile('');
    setOtp('');
    setError('');
  };

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
        navigate(location.state?.from?.pathname || '/', { replace: true });
      } else {
        setError(data.error || 'Google auth failed');
      }
    } catch (err) {
      setError(err.message || 'Google auth failed');
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
        text: 'signin_with',
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

  // If coming from the Register page, prefill email and show OTP verification step.
  useEffect(() => {
    const state = location.state;
    if (state?.prefillEmail && state?.showOtpAfterRegister) {
      setMethod('email');
      setEmail(state.prefillEmail);
      setStep('verify');
      setSuccess('We have sent an OTP to your email. Please enter it below to complete registration.');
    }
  }, [location.state]);

  // Countdown for PIN lockout (when PIN_LOCKED)
  useEffect(() => {
    if (pinLockSeconds <= 0) return;
    const id = setInterval(() => {
      setPinLockSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [pinLockSeconds]);

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api('/auth/pin/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          pin,
          deviceId,
          userAgent: navigator.userAgent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'PIN_NEW_DEVICE') {
          throw new Error(
            'This device has not been verified yet. Please sign in once with OTP or Google, then you can use your PIN.'
          );
        }
        if (data.code === 'PIN_LOCKED') {
          if (data.lockedUntil) {
            const diffMs = new Date(data.lockedUntil).getTime() - Date.now();
            if (diffMs > 0) {
              setPinLockSeconds(Math.round(diffMs / 1000));
            }
          }
          throw new Error(
            'PIN locked due to too many failed attempts. Please use OTP or Google to sign in.'
          );
        }
        if (data.code === 'PIN_INVALID') {
          const attemptsLeft =
            typeof data.attemptsLeft === 'number'
              ? ` (${data.attemptsLeft} attempt${data.attemptsLeft === 1 ? '' : 's'} left)`
              : '';
          throw new Error(`Invalid PIN.${attemptsLeft}`);
        }
        throw new Error(data.error || 'PIN sign-in failed');
      }
      if (!data.accessToken || !data.refreshToken || !data.user) {
        throw new Error('Unexpected PIN response from server');
      }
      persist(data.accessToken, data.refreshToken, data.user);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'PIN sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'center' }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, minHeight: '100vh', alignItems: 'center', justifyContent: 'center', p: 4, background: (t) => t.palette.mode === 'dark' ? 'linear-gradient(135deg, #1a2530 0%, #252d35 100%)' : 'linear-gradient(135deg, #e8f4f8 0%, #f0f4f8 100%)' }}>
        <img src="/auth-img.webp" alt="Sign in" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
        <Card sx={{ maxWidth: 430, width: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', marginBottom: 2 }}>
              <Box sx={{ width: 40, height: 40, mr:1.5, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DescriptionIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>FA DOC</Typography>
            </Link>
            <Typography variant="h5" sx={{ mb: 1, mt: 1, fontWeight: 700 }}>Sign In to your Account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Welcome back! Please enter your details.</Typography>

            <Box ref={googleBtnRef} sx={{ width: '100%', minHeight: 48, mb: 2, display: 'flex', justifyContent: 'center' }} aria-label="Sign in with Google" />

            <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">or</Typography></Divider>

            {/* Mode toggle: Google/OTP or PIN */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={authMode === 'otp' ? 'contained' : 'text'}
                onClick={() => {
                  setAuthMode('otp');
                  setError('');
                }}
                sx={{ textTransform: 'none', flex: 1, minWidth: 0 }}
              >
                Google / OTP
              </Button>
              <Button
                size="small"
                variant={authMode === 'pin' ? 'contained' : 'text'}
                onClick={() => {
                  setAuthMode('pin');
                  setError('');
                }}
                sx={{ textTransform: 'none', flex: 1, minWidth: 0 }}
              >
                PIN
              </Button>
            </Box>

            {authMode === 'otp' ? (
              <>
                {step === 'input' ? (
                  <Box component="form" onSubmit={handleSendOtp}>
                    {method === 'email' ? (
                      <TextField
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        sx={{ mb: 1.5 }}
                      />
                    ) : (
                      <TextField
                        type="tel"
                        label="Phone Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        fullWidth
                        sx={{ mb: 1.5 }}
                      />
                    )}
                    <Button
                      type="button"
                      size="small"
                      onClick={() => setMethod((m) => (m === 'email' ? 'mobile' : 'email'))}
                      sx={{ mb: 1.5, textTransform: 'none' }}
                    >
                      Use {method === 'email' ? 'mobile' : 'email'} instead
                    </Button>
                    {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5 }}>{error}</Alert>}
                    {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 1.5 }}>{success}</Alert>}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{ mb: 1, padding: 1, fontSize: '1.15rem' }}
                    >
                      Send OTP
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleVerifyOtp}>
                    <TextField
                      label="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputProps={{ maxLength: 6 }}
                      required
                      fullWidth
                      sx={{ mb: 1.5 }}
                    />
                    {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5 }}>{error}</Alert>}
                    <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 0.5, padding: 1, fontSize: '1.15rem' }}>
                      Verify OTP
                    </Button>
                    <Button
                      type="button"
                      fullWidth
                      size="small"
                      onClick={handleChangeContact}
                      sx={{ textTransform: 'none' }}
                    >
                      Change {method}
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box component="form" onSubmit={handlePinLogin}>
                <TextField
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  type="password"
                  label="4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputProps={{ maxLength: 4 }}
                  required
                  fullWidth
                  sx={{ mb: 1 }}
                />
                {pinLockSeconds > 0 && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    PIN is locked. Try again in approximately {pinLockSeconds}s, or use OTP / Google instead.
                  </Alert>
                )}
                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5 }}>{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 0.5, padding: 1, fontSize: '1.15rem' }}>
                  Sign in with PIN
                </Button>
                <Button
                  type="button"
                  fullWidth
                  size="small"
                  onClick={() => {
                    setAuthMode('otp');
                    setError('');
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Use OTP / Google instead
                </Button>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Don&apos;t have an account? <Link to="/auth/register" style={{ color: 'inherit', fontWeight: 600 }}>Sign Up</Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
