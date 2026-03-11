import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Link as MuiLink,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Header from '../components/Header.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

const SUPPORT_EMAIL = 'Support@fieldagentreport.com';
const ADDRESS = '4-99, budumuru, laveru, srikakulam, Andhra Pradesh, India';

export default function Contact() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: { xs: 5, md: 7 },
          px: { xs: 2.5, sm: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
            gap: { xs: 4, md: 7 },
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                fontFamily: 'inter sans-serif, sans-serif',
                fontSize: 52,
                letterSpacing: '0.04em',
                mb: 1.5,
              }}
            >
              Contact
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 420, lineHeight: 1.8, fontSize: 15 }}
            >
              Contact us to report a problem, clarify any doubts about FieldAgentReport, or simply
              for more information.
            </Typography>

            <Box sx={{ mt: 4, display: 'grid', gap: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.12em' }}>
                Address
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: 420, lineHeight: 1.7 }}>
                {ADDRESS}
              </Typography>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.12em', mt: 3 }}
              >
                Email
              </Typography>
              <Typography variant="body2">
                <MuiLink href={`mailto:${SUPPORT_EMAIL}`} underline="hover">
                  {SUPPORT_EMAIL}
                </MuiLink>
              </Typography>
            </Box>
          </Box>

          <Paper
            component="form"
            noValidate
            elevation={0}
            sx={(theme) => ({
              p: { xs: 3, sm: 4 },
              borderRadius: 1,
              bgcolor: theme.palette.background.paper,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 16px 40px rgba(0,0,0,0.55)'
                  : '0 18px 40px rgba(15,23,42,0.15)',
            })}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
                mb: 2.5,
              }}
            >
              <TextField required label="Your name" name="name" size="small" fullWidth />
              <TextField
                required
                label="Your email address"
                name="email"
                type="email"
                size="small"
                fullWidth
              />
            </Box>

            <TextField
              select
              label="Regarding"
              name="regarding"
              size="small"
              fullWidth
              defaultValue=""
              sx={{ mb: 2.5 }}
            >
              <MenuItem value="">Choose a topic…</MenuItem>
              <MenuItem value="billing">Billing or subscription</MenuItem>
              <MenuItem value="technical">Technical issue</MenuItem>
              <MenuItem value="feedback">Product feedback</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Message"
              name="message"
              fullWidth
              multiline
              minRows={4}
              sx={{ mb: 2.5 }}
            />

            <FormControlLabel
              control={<Checkbox size="small" color="primary" />}
              sx={{ alignItems: 'center', mb: 2.5 }}
              label={
                <Typography variant="caption" color="text.secondary">
                  I accept the{' '}
                  <MuiLink
                    href="https://www.fieldagentreport.com/terms-and-conditions"
                    target="_blank"
                    rel="noreferrer"
                  >
                    General Terms and Conditions
                  </MuiLink>{' '}
                  and the{' '}
                  <MuiLink
                    href="https://www.fieldagentreport.com/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    data protection regulations
                  </MuiLink>
                  .
                </Typography>
              }
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="error"
                sx={{ px: 3.5, borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
              >
                Send Message
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
      <SiteFooter />
    </Box>
  );
}

