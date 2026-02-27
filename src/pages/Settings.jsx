import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItemButton,
  TextField,
  Typography,
  Fade,
  Chip,
} from '@mui/material';
import Header from '../components/Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SubscriptionBadge from '../components/SubscriptionBadge.jsx';
import { api } from '../api/client.js';

const SECTIONS = [
  { id: 'profile', label: 'Profile & PIN' },
  { id: 'subscription', label: 'Subscription & Pricing' },
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹799',
    description: 'Perfect for short-term or trial usage.',
    tag: 'Monthly billing',
    highlight: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '₹2,099',
    description: 'Better value for regular case work.',
    tag: 'Save vs monthly',
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹6,999',
    description: 'Best value with up to 14 months access.',
    tag: 'Limited-time offer',
    highlight: true,
  },
];

export default function Settings() {
  const [active, setActive] = useState('profile');

  return (
    <Box sx={{ minHeight: '100vh', pb: 4, bgcolor: 'background.default' }}>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: { xs: 'auto', md: 'calc(100vh - 160px)' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          {/* Sidebar */}
          <Card
            sx={{
              width: { xs: '100%', md: 260 },
              flexShrink: 0,
              height: { xs: 'auto', md: '100%' },
              borderRadius: 1,
              boxShadow: 4,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: '0.12em', mb: 0.5, display: 'block' }}
                >
                  Workspace
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Settings
                </Typography>
              </Box>
              <List disablePadding sx={{ mt: 1 }}>
                {SECTIONS.map((s) => (
                  <ListItemButton
                    key={s.id}
                    selected={s.id === active}
                    onClick={() => setActive(s.id)}
                    sx={{
                      borderRadius: 999,
                      mb: 0.75,
                      px: 2,
                      py: 1,
                      fontSize: '0.9rem',
                    }}
                  >
                    {s.label}
                  </ListItemButton>
                ))}
              </List>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', display: 'block' }}>
                Tune your profile, subscription, and PIN unlock from one place.
              </Typography>
            </CardContent>
          </Card>

          {/* Main content column – scrollable when tall */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              height: { xs: 'auto', md: '100%' },
              overflowY: { xs: 'visible', md: 'auto' },
              pr: { md: 1 },
            }}
          >
            {active === 'subscription' && <SubscriptionSection />}
            {active === 'profile' && <ProfileAndPinSection />}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function SubscriptionSection() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          minHeight: { xs: 'auto', md: '100%' },
          borderRadius: 1,
          boxShadow: 4,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.16em' }}>
              Billing
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, fontSize:"2rem", letterSpacing:'0.02em' }}>
              Subscription & Pricing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.7, fontSize: '0.95rem' }}>
              Choose a plan that fits your workflow. These prices are current and offers are time-bound—no permanent
              discounts.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1,  fontSize:"1.25em" }}>
                Active users:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb:0.5, fontSize: '0.95rem' }}>
                • Unlimited DOCX downloads
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb:0.5, fontSize: '0.95rem' }}>
                • Full preview visible
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb:0.5, fontSize: '0.95rem' }}>
                • No masking anywhere
              </Typography>
            </Box>
          </Box>
          <SubscriptionBadge />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            height: 'calc(100vh - 510px)',
            alignItems: 'space-between',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                borderColor: plan.highlight ? 'primary.main' : 'divider',
                borderWidth: plan.highlight ? 2 : 1,
                background: plan.highlight
                  ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.06), rgba(59, 130, 246, 0.06))'
                  : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(`/checkout?plan=${plan.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {plan.price}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {plan.description}
                </Typography>
                {plan.id === 'yearly' && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Includes up to 14 months of access.
                  </Typography>
                )}
                <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                  {plan.tag}
                </Typography>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ display: 'block', mt: 1, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Continue to checkout →
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}

function ProfileAndPinSection() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || user?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinError, setPinError] = useState('');

  // Ensure we have the latest profile from the server when opening Settings
  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  // When the authenticated user object loads or changes, populate the form fields.
  // This fixes the case where the component mounted before user data was available,
  // leaving the inputs permanently blank until the user types manually.
  useEffect(() => {
    if (!user) return;

    setName((prev) => prev || user.name || user.email?.split('@')[0] || '');
    setEmail((prev) => prev || user.email || '');
    setMobile((prev) => prev || user.mobile || '');
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await api('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ name, mobile }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile');
      }
      await refreshUser?.();
      setProfileSuccess('Profile updated successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    setPinMessage('');
    setPinError('');
    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PIN and confirmation do not match.');
      return;
    }
    try {
      const res = await api('/auth/pin/setup', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save PIN');
      }
      setPinMessage('PIN saved successfully!');
      setPin('');
      setConfirmPin('');
      // Refresh user data to update PIN status indicator
      await refreshUser?.();
      // Clear success message after 5 seconds
      setTimeout(() => setPinMessage(''), 5000);
    } catch (err) {
      setPinError(err.message);
    }
  };

  return (
    <Card
      sx={{
        minHeight: { xs: 'auto', md: '100%' },
        borderRadius: 1,
        boxShadow: 4,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, pt: 4 }}>
        {/* Profile Section – horizontal */}
        <Fade in timeout={500}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: { xs: 3, lg:6 },
              alignItems: 'flex-start',
            }}
          >
            {/* Left: title + description */}
            <Box sx={{ flex: { xs: '1 1 auto', lg: '0 0 320px' }, minWidth: 0 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ mb: 1.5, display: 'block', letterSpacing: '0.16em', fontWeight: 600, fontSize: '0.75rem' }}
              >
                User Profile
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  fontSize: { xs: '1.7rem', md: '1.9rem' },
                }}
              >
                My Profile
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                Keep your contact details up to date so we can reach you with important case updates and billing
                notifications.
              </Typography>
            </Box>

            {/* Right: form */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 0' }, minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
              <Box
                component="form"
                onSubmit={handleProfileSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  width: { xs: '100%', lg: 'auto' },
                  maxWidth: { xs: '100%', lg: 520 },
                }}
              >
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  InputProps={{ readOnly: true }}
                  helperText="Email is fixed for this account and cannot be changed."
                />
                <TextField
                  fullWidth
                  label="Mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter mobile number"
                />
                {profileSuccess && (
                  <Alert severity="success" onClose={() => setProfileSuccess('')} sx={{ mt: -1 }}>
                    {profileSuccess}
                  </Alert>
                )}
                {profileError && (
                  <Alert severity="error" onClose={() => setProfileError('')} sx={{ mt: -1 }}>
                    {profileError}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    alignSelf: { xs: 'stretch', lg: 'flex-start' },
                    borderRadius: 999,
                    px: 4,
                    py: 1.3,
                    textTransform: 'none',
                  }}
                >
                  Update Profile
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Divider */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', my: 1 }} />

        {/* PIN Section – unchanged layout */}
        <Fade in timeout={600}>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ mb: 1, display: 'block', letterSpacing: '0.16em' }}
            >
              Security
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                PIN (4‑digit) – Convenience Unlock
              </Typography>
              <Chip
                label={user?.hasPin ? 'PIN Set' : 'PIN Not Set'}
                color={user?.hasPin ? 'success' : 'default'}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
              Use a 4‑digit PIN to quickly unlock on devices that have already completed OTP or Google login. PIN is a
              convenience feature only, not identity verification.
            </Typography>
            <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: '1.1fr 1fr', gap: 4 }}>
              <Box sx={{ mb: { xs: 3, md: 0 } }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Rules
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, color: 'text.secondary', '& li': { mb: 0.5 } }}>
                  <li>PIN is optional but encouraged after your first successful login.</li>
                  <li>PIN is account-level and works across your verified devices.</li>
                  <li>New devices must complete OTP / Google once before PIN works.</li>
                  <li>PIN is stored hashed on the server, never in plaintext.</li>
                </Box>
              </Box>
              <Box component="form" onSubmit={handleSavePin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="New PIN"
                  type="password"
                  inputMode="numeric"
                  inputProps={{ maxLength: 4 }}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                />
                <TextField
                  label="Confirm PIN"
                  type="password"
                  inputMode="numeric"
                  inputProps={{ maxLength: 4 }}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                />
                {pinMessage && (
                  <Alert severity="success" onClose={() => setPinMessage('')}>
                    {pinMessage}
                  </Alert>
                )}
                {pinError && (
                  <Alert severity="error" onClose={() => setPinError('')}>
                    {pinError}
                  </Alert>
                )}
                <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 999, px: 4, py: 1.3 }}>
                  Save PIN
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
}

