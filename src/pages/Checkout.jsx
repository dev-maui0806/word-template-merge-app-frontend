import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Container } from '@mui/material';
import Header from '../components/Header.jsx';

function usePlan() {
  const params = new URLSearchParams(useLocation().search);
  const plan = params.get('plan') || 'monthly';
  const details = {
    monthly: { name: 'Monthly', price: '₹799' },
    quarterly: { name: 'Quarterly', price: '₹2,099' },
    yearly: { name: 'Yearly', price: '₹6,999' },
  }[plan] || { name: 'Monthly', price: '₹799' };
  return details;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { name, price } = usePlan();

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Stripe checkout integration will be wired here in the backend. For now, this is a front-end placeholder.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/settings')}>
              Back to settings
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
