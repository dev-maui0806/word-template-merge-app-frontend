import { Box, Container, Divider, Typography, Link as MuiLink, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PublicIcon from '@mui/icons-material/Public';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const SUPPORT_EMAIL = 'Support@fieldagentreport.com';
const ADDRESS = '4-99, budumuru, laveru, srikakulam, Andhra Pradesh, India';
const PHONE_NUMBER = '+91 XXXXX XXXX';

const POLICY_LINKS = [
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Refund Policy', to: '/refund-policy' },
  { label: 'Return Policy', to: '/return-policy' },
];

const PRODUCT_LINKS = [
  { label: 'Features', to: '/' },
  { label: 'Pricing', to: '/settings?section=subscription' },
  { label: 'Tools', to: '/' },
  { label: 'FAQ', to: '/contact' },
];

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={(theme) => ({
        mt: 8,
        py: 5,
        borderTop: '1px solid rgba(148,163,253,0.25)',
        backgroundColor:
          theme.palette.mode === 'dark' ? '#020617' : theme.palette.background.paper,
      })}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2.5, sm: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
          }}
        >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr 1.3fr' },
            gap: { xs: 3.5, md: 5 },
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={(theme) => ({
                fontWeight: 800,
                mb: 1.25,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontSize: 14,
                backgroundImage:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(120deg, #f97316, #fb7185)'
                    : 'linear-gradient(120deg, #ea580c, #db2777)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              })}
            >
              FIELDAGENTREPORT
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.9,
                maxWidth: 520,
                fontSize: 14,
              }}
            >
              FieldAgentReport helps manage field investigation workflows and generate structured documentation.
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: '0.16em', fontSize: 11 }}
            >
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {PRODUCT_LINKS.map((p) => (
                <MuiLink
                  key={p.to}
                  component={RouterLink}
                  to={p.to}
                  underline="hover"
                >
                  {p.label}
                </MuiLink>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: '0.16em', fontSize: 11 }}
            >
              Policies
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {POLICY_LINKS.map((p) => (
                <MuiLink
                  key={p.to}
                  component={RouterLink}
                  to={p.to}
                  underline="hover"
                >
                  {p.label}
                </MuiLink>
              ))}
            </Box>
            <Box sx={{ mt: 2 }}>
              <MuiLink component={RouterLink} to="/contact" underline="hover">
                Contact
              </MuiLink>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 11 }}
            >
              Contact Us
            </Typography>
            <Box
              sx={{
                mt: 1.25,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                <MailOutlineIcon
                  sx={{ fontSize: 20, mt: '2px', color: 'text.secondary' }}
                />
                <Typography variant="body2" sx={{ fontSize: 14 }}>
                  <MuiLink href={`mailto:${SUPPORT_EMAIL}`} underline="hover">
                    {SUPPORT_EMAIL}
                  </MuiLink>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <PhoneInTalkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontSize: 14 }}>
                  {PHONE_NUMBER}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                <PublicIcon sx={{ fontSize: 20, mt: '2px', color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontSize: 14 }}>
                  {ADDRESS}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(148,163,253,0.35)' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12.5 }}>
            © {new Date().getFullYear()} FieldAgentReport. All rights reserved.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              gap: 1,
            }}
          >
            {[TwitterIcon, FacebookIcon, LinkedInIcon, InstagramIcon, YouTubeIcon].map(
              (Icon, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={(theme) => ({
                    color: 'text.secondary',
                    borderRadius: '999px',
                    border: '1px solid rgba(148,163,253,0.35)',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(15,23,42,0.9)'
                        : 'rgba(248,250,252,0.9)',
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0 6px 16px rgba(15,23,42,0.85)'
                        : '0 6px 14px rgba(15,23,42,0.18)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, rgba(249,115,22,0.92), rgba(236,72,153,0.96))',
                      color: '#0b1120',
                      transform: 'translateY(-1px)',
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 14px 28px rgba(15,23,42,0.95)'
                          : '0 18px 32px rgba(15,23,42,0.3)',
                    },
                    transition: 'all 200ms ease-out',
                  })}
                >
                  <Icon sx={{ fontSize: 19 }} />
                </IconButton>
              )
            )}
          </Box>
        </Box>
        </Box>
      </Container>
    </Box>
  );
}

