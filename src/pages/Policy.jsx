/**
 * Policy.jsx - Displays legal policy documents (Privacy, Refund, Terms, Cookie, Legal Disclaimer).
 * Routes match PhonePe merchant registration requirements:
 * /privacy_policy, /refund_policy, /terms-and-conditions, /cookie_policy, /legal_disclaimer
 */

import { useLocation, Link } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { POLICY_CONTENT } from '../content/policies.js';

function PolicyRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n').filter((l) => l.trim() !== '');
  const elements = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <Box key={key++} component="ul" sx={{ m: 0, pl: 2.5, mb: 1.5, '& li': { mb: 0.5 } }}>
          {listItems.map((item, i) => (
            <Typography key={i} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
              {item.replace(/^\*\s*/, '')}
            </Typography>
          ))}
        </Box>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <Typography key={key++} variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          {trimmed.slice(2)}
        </Typography>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <Typography key={key++} variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1, color: 'text.primary' }}>
          {trimmed.slice(3)}
        </Typography>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <Typography key={key++} variant="subtitle1" sx={{ fontWeight: 600, mt: 1.5, mb: 0.5, color: 'text.secondary' }}>
          {trimmed.slice(4)}
        </Typography>
      );
    } else if (trimmed === '---') {
      flushList();
      elements.push(<Box key={key++} sx={{ borderTop: 1, borderColor: 'divider', my: 2 }} />);
    } else if (trimmed.startsWith('* ')) {
      listItems.push(trimmed);
    } else if (trimmed.startsWith('*')) {
      listItems.push(trimmed);
    } else if (trimmed) {
      flushList();
      const parts = [];
      let rest = trimmed;
      while (rest.includes('**')) {
        const idx = rest.indexOf('**');
        const end = rest.indexOf('**', idx + 2);
        if (end === -1) break;
        parts.push({ type: 'text', value: rest.slice(0, idx) });
        parts.push({ type: 'bold', value: rest.slice(idx + 2, end) });
        rest = rest.slice(end + 2);
      }
      if (rest) parts.push({ type: 'text', value: rest });

      elements.push(
        <Typography key={key++} variant="body2" sx={{ mb: 1, color: 'text.secondary', lineHeight: 1.7 }}>
          {parts.map((p, idx) =>
            p.type === 'bold' ? (
              <Box key={idx} component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {p.value}
              </Box>
            ) : (
              p.value
            )
          )}
        </Typography>
      );
    }
  }
  flushList();

  return <>{elements}</>;
}

export default function Policy() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '').split('/')[0];
  const normalizedSlug =
    slug === 'T&C' || slug === 'T%26C'
      ? 'terms-and-conditions'
      : slug === 'Cookie_Policy'
        ? 'cookie-policy'
        : slug === 'Legal_Disclaimer'
          ? 'legal-disclaimer'
          : slug === 'privacy-policy'
            ? 'privacy-policy'
            : slug === 'refund-policy'
              ? 'refund-policy'
              : slug === 'return-policy'
                ? 'return-policy'
                : slug;
  const policy = POLICY_CONTENT[normalizedSlug];

  if (!policy) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Typography color="text.secondary">Policy not found.</Typography>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 16 }}>
            <ArrowBackIcon /> Back to Home
          </Link>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        py: 4,
        bgcolor: theme.palette.background.default,
      })}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.875rem',
            mb: 3,
            '&:hover': { color: 'primary.main' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Home
        </Box>

        <Paper
          elevation={0}
          sx={(theme) => ({
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(15,23,42,0.08)',
          })}
        >
          <PolicyRenderer content={policy} />
        </Paper>
      </Container>
    </Box>
  );
}
