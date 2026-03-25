import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Container, Alert } from '@mui/material';
import Header from '../components/Header.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

const FALLBACK_PLANS = {
  monthly: { id: 'monthly', name: 'Monthly', amountRupees: 799 },
  quarterly: { id: 'quarterly', name: 'Quarterly', amountRupees: 2099 },
  yearly: { id: 'yearly', name: 'Yearly', amountRupees: 6999 },
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { country, countryTimezoneId } = useApp();
  const params = new URLSearchParams(location.search);
  const planParam = params.get('plan') || 'monthly';

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
        const params = new URLSearchParams();
        if (country) params.set('country', country);
        if (countryTimezoneId) params.set('timezoneId', countryTimezoneId);
        const q = params.toString();
        const res = await api(`/payments/plans${q ? `?${q}` : ''}`, { method: 'GET' });
        if (!res.ok) throw new Error('Failed to load subscription prices');
        const data = await res.json();
        if (!cancelled) {
          setPlans(Array.isArray(data) ? data : []);
        }
      } catch {
        // Fallback to static prices if API fails; backend still uses DB prices
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
  }, [country, countryTimezoneId]);

  const selectedPlan = useMemo(() => {
    const fromServer = plans.find((p) => p.id === planParam);
    if (fromServer) {
      const inrPrice =
        typeof fromServer.amountRupees === 'number' && Number.isFinite(fromServer.amountRupees)
          ? `₹${fromServer.amountRupees.toLocaleString('en-IN')}`
          : undefined;
      const localPrice =
        typeof fromServer.localAmount === 'number' &&
        Number.isFinite(fromServer.localAmount) &&
        fromServer.localCurrency &&
        fromServer.localCurrency !== 'INR'
          ? `${fromServer.localCurrency} ${fromServer.localAmount.toLocaleString('en-US')}`
          : undefined;
      return {
        id: fromServer.id,
        name: fromServer.name,
        inrPrice,
        localPrice,
      };
    }
    const fallback = FALLBACK_PLANS[planParam] || FALLBACK_PLANS.monthly;
    return {
      id: fallback.id,
      name: fallback.name,
      inrPrice: `₹${fallback.amountRupees.toLocaleString('en-IN')}`,
      localPrice: undefined,
    };
  }, [plans, planParam]);

  const planId = selectedPlan.id;
  const name = selectedPlan.name;
  const inrPrice = selectedPlan.inrPrice;
  const localPrice = selectedPlan.localPrice;

  const canPay = useMemo(() => !!planId, [planId]);

  const loadRazorpayCheckoutScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    if (!canPay) return;
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const scriptOk = await loadRazorpayCheckoutScript();
      if (!scriptOk) {
        throw new Error('Unable to load Razorpay checkout. Please check your internet connection.');
      }

      const res = await api('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ plan: planId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to initialize Razorpay checkout');
      }
      const order = await res.json();
      if (!order?.orderId || !order?.keyId) {
        throw new Error('Razorpay order initialization response is incomplete');
      }

      const rz = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency || 'INR',
        name: order.name || 'Field Agent Report',
        description: order.description || `Subscription ${name}`,
        prefill: order.prefill || {},
        notes: order.notes || {},
        theme: { color: '#ef4444' },
        handler: async (response) => {
          try {
            setStatus('Verifying payment...');
            const verifyRes = await api('/payments/razorpay/verify', {
              method: 'POST',
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            if (!verifyRes.ok) {
              const d = await verifyRes.json().catch(() => ({}));
              throw new Error(d.error || 'Payment verification failed');
            }
            setStatus('Payment successful. Activating your subscription...');
            setTimeout(() => {
              navigate('/settings?payment=success', { replace: true });
            }, 500);
          } catch (verifyErr) {
            setStatus('');
            setError(verifyErr.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatus('');
            setError('Payment was cancelled before completion.');
          },
        },
      });

      rz.open();
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
                {name} {localPrice ? `– ${localPrice}` : inrPrice ? `– ${inrPrice}` : ''}
              </strong>
            </Typography>
            {localPrice && inrPrice ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                INR equivalent: {inrPrice}
              </Typography>
            ) : null}
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
                disabled={loading}
              >
                {loading ? 'Opening Razorpay…' : 'Continue to Razorpay'}
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
