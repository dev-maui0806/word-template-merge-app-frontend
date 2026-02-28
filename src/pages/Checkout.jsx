import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Container, Alert } from '@mui/material';
import Header from '../components/Header.jsx';
import { api } from '../api/client.js';

function usePlan() {
  const params = new URLSearchParams(useLocation().search);
  const plan = params.get('plan') || 'monthly';
  const details = {
    monthly: { id: 'monthly', name: 'Monthly', price: '₹799' },
    quarterly: { id: 'quarterly', name: 'Quarterly', price: '₹2,099' },
    yearly: { id: 'yearly', name: 'Yearly', price: '₹6,999' },
  }[plan] || { name: 'Monthly', price: '₹799' };
  return details;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { id: planId, name, price } = usePlan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
              Selected plan: <strong>{name}</strong> – <strong>{price}</strong>
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
