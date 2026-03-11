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
  const transactionId = params.get('transactionId') || '';
  const isMockReturn = params.get('mock') === '1';

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

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

  const pollStatus = async (merchantOrderId) => {
    const res = await api(`/payments/phonepe/order/${encodeURIComponent(merchantOrderId)}/status`, {
      method: 'GET',
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Failed to fetch payment status');
    }
    return await res.json();
  };

  useEffect(() => {
    let cancelled = false;
    if (!transactionId) return;

    const run = async () => {
      try {
        setError('');
        setStatus('Verifying payment status…');
        // Poll a few times; webhook can be slightly delayed.
        for (let i = 0; i < 12 && !cancelled; i++) {
          const d = await pollStatus(transactionId);
          if (d.warning) {
            setError('');
            setStatus(d.warning);
          }
          if (d.status === 'SUCCESS') {
            setStatus('Payment successful. Activating your subscription…');
            setTimeout(() => {
              if (!cancelled) navigate('/settings?payment=success', { replace: true });
            }, 600);
            return;
          }
          if (d.status === 'FAILED') {
            setStatus('');
            setError('Payment failed or was cancelled. Please try again.');
            return;
          }
          // INITIATED / PENDING
          if (!d.warning) {
            setStatus('Payment pending. Waiting for confirmation…');
          }
          await new Promise((r) => setTimeout(r, 1500));
        }
        if (!cancelled) {
          setStatus('');
          setError('Payment is still pending. If you cancelled, you can safely retry.');
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('');
          setError('We couldn’t confirm the payment yet. If you cancelled, you can safely retry.');
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [transactionId, navigate]);

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

  const handleMockSettle = async (state) => {
    if (!transactionId) return;
    setError('');
    setLoading(true);
    try {
      const res = await api('/payments/phonepe/mock/settle', {
        method: 'POST',
        body: JSON.stringify({ merchantOrderId: transactionId, state }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Mock settle failed');
      }
      // Trigger a status poll immediately.
      setLoading(false);
    } catch (e) {
      setError(e.message || 'Mock settle failed');
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
            {!!transactionId && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Order: <strong>{transactionId}</strong>
              </Typography>
            )}
            {status && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {status}
              </Alert>
            )}
            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePay}
                disabled={loading || !!transactionId}
              >
                {loading ? 'Redirecting…' : 'Continue to PhonePe'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/settings')} disabled={loading}>
                Back to settings
              </Button>
            </Box>

            {isMockReturn && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Test mode
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  PhonePe KYC is pending. Use these buttons to simulate a callback.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleMockSettle('COMPLETED')}
                    disabled={loading || !transactionId}
                  >
                    Simulate Success
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleMockSettle('FAILED')}
                    disabled={loading || !transactionId}
                  >
                    Simulate Failure
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
