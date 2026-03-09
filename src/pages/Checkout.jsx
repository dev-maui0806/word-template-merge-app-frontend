import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Container, Alert } from '@mui/material';
import Header from '../components/Header.jsx';
import { api } from '../api/client.js';

const FALLBACK_PLANS = {
  monthly: { id: 'monthly', name: 'Monthly', amountRupees: 799 },
  quarterly: { id: 'quarterly', name: 'Quarterly', amountRupees: 2099 },
  yearly: { id: 'yearly', name: 'Yearly', amountRupees: 6999 },
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planParam = params.get('plan') || 'monthly';

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await api('/payments/plans', { method: 'GET' });
        if (!res.ok) throw new Error('Failed to load subscription prices');
        const data = await res.json();
        if (!cancelled) {
          setPlans(Array.isArray(data) ? data : []);
        }
      } catch {
        // Fallback to static prices if API fails; PhonePe will still use DB prices
        if (!cancelled) {
          setPlans([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      }
    };
    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = useMemo(() => {
    const fromServer = plans.find((p) => p.id === planParam);
    if (fromServer) {
      const price =
        typeof fromServer.amountRupees === 'number' && Number.isFinite(fromServer.amountRupees)
          ? `₹${fromServer.amountRupees.toLocaleString('en-IN')}`
          : undefined;
      return {
        id: fromServer.id,
        name: fromServer.name,
        price,
      };
    }
    const fallback = FALLBACK_PLANS[planParam] || FALLBACK_PLANS.monthly;
    return {
      id: fallback.id,
      name: fallback.name,
      price: `₹${fallback.amountRupees.toLocaleString('en-IN')}`,
    };
  }, [plans, planParam]);

  const planId = selectedPlan.id;
  const name = selectedPlan.name;
  const price = selectedPlan.price;

  const canPay = useMemo(() => !!planId, [planId]);

  const handlePay = async () => {
    if (!canPay) return;
    setError('');
    setLoading(true);
    try {
      const res = await api('/payments/phonepe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: planId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to start PhonePe checkout');
      }
      const d = await res.json();
      if (!d.url) throw new Error('PhonePe checkout URL missing');
      window.location.href = d.url;
    } catch (err) {
      setError(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Checkout</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You&apos;re almost there. Confirm your subscription details and continue to payment.
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Selected plan:{' '}
              <strong>
                {name} {price ? `– ${price}` : ''}
              </strong>
            </Typography>
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary" onClick={handlePay} disabled={loading}>
                {loading ? 'Redirecting…' : 'Continue to PhonePe'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/settings')} disabled={loading}>
                Back to settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
