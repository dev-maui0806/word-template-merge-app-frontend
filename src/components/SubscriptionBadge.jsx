import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

function computeTrialState(user) {
  if (!user) return { isTrialActive: false, docCount: 0 };
  const docCount = user.trialDocCount ?? 0;
  const trialStart = user.trialStartDate ? dayjs(user.trialStartDate) : null;

  const daysElapsed = trialStart ? dayjs().diff(trialStart, 'day') : 0;
  const isTrialActive =
    user.subscriptionStatus === 'trial' &&
    docCount < 5 &&
    daysElapsed < 7;

  return { isTrialActive, docCount, daysElapsed };
}

function getBadgeConfig(user) {
  if (!user) {
    return null;
  }

  const { isTrialActive, docCount } = computeTrialState(user);

  if (user.subscriptionStatus === 'active') {
    const plan = user.subscriptionPlan || 'monthly';
    const planLabel =
      plan === 'yearly'
        ? 'Yearly'
        : plan === 'quarterly'
        ? 'Quarterly'
        : 'Monthly';

    return {
      label: `Active • ${planLabel} plan`,
      color: 'success',
    };
  }

  if (isTrialActive) {
    if (docCount >= 3) {
      return {
        label: 'Trial • Approaching limit',
        color: 'warning',
      };
    }
    return {
      label: 'Trial • Full access',
      color: 'warning',
    };
  }

  return {
    label: 'Trial limit reached • Upgrade required',
    color: 'error',
  };
}

export default function SubscriptionBadge({ size = 'small' }) {
  const { user } = useAuth();
  const config = getBadgeConfig(user);

  if (!config) return null;

  const padding = size === 'small' ? 0.5 : 0.75;
  const px = size === 'small' ? 1.5 : 2;

  const bgColor =
    config.color === 'success'
      ? 'success.light'
      : config.color === 'warning'
      ? 'warning.light'
      : 'error.light';

  const textColor =
    config.color === 'success'
      ? 'success.dark'
      : config.color === 'warning'
      ? 'warning.dark'
      : 'error.dark';

  return (
    <Box
      sx={{
        px,
        py: padding,
        borderRadius: 999,
        bgcolor: bgColor,
        color: textColor,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        fontWeight: 600,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {config.label}
      </Typography>
    </Box>
  );
}

