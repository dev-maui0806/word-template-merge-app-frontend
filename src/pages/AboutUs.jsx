import { Box, Container, Typography, Paper } from '@mui/material';
import Header from '../components/Header.jsx';
import SiteFooter from '../components/SiteFooter.jsx';

export default function AboutUs() {
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
        maxWidth="md"
        sx={{
          flexGrow: 1,
          py: { xs: 5, md: 7 },
          px: { xs: 2.5, sm: 4, md: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={(theme) => ({
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(15,23,42,0.08)',
          })}
        >
          <Typography variant="h4" sx={{ fontWeight: 700,textAlign:'center', mb: 2 }}>
            About Us
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            FieldAgentReport is a cloud-based Software-as-a-Service (SaaS) platform designed
            exclusively for insurance field agents, investigators, and field professionals
            worldwide. Our platform enables users to generate structured, professional reports
            quickly by entering required information into predefined templates.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Line of Business
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            We operate as a SaaS provider offering digital report generation software. Payments
            collected on this platform are solely for access to software features, tools, and
            subscription services.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            FieldAgentReport does not provide insurance, financial, or advisory services and does
            not act as a broker, intermediary, or representative of any insurance company.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Nature of Service
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            FieldAgentReport uses automated document generation technology to convert user-entered
            variable data into complete, standardized reports within seconds. The system
            significantly reduces manual documentation effort and report preparation time, enabling
            field professionals to complete reports in under one minute.
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1.5, mb: 0.5 }}>
            Key capabilities include:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Automated report generation from user inputs
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Pre-structured templates with fixed professional content
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Consistent formatting across documents
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Reduced manual work and errors
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Faster submission to supervisors or organizations
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Secure cloud-based access from anywhere
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            The platform is purely a productivity tool for documentation and reporting.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Target Users
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            Our services are intended only for professionals involved in insurance-related field
            operations, including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Field investigators
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Surveyors and loss assessors
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Verification officers
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Claims field personnel
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Independent insurance field agents
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            The platform is not designed for general consumer use.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Independence and Non-Affiliation
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            FieldAgentReport is an independent technology provider.
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              We are not affiliated with, partnered with, or endorsed by any insurance company or
              financial institution.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              We do not represent any insurer or third party.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              We do not participate in claim processing or decision-making.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              We do not sell insurance products or services.
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            Users generate reports independently for submission to their respective organizations.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Payments and Transactions
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            All payments made through the platform are for access to digital software services only.
            FieldAgentReport does not collect or process payments on behalf of any external entity
            and does not facilitate transactions between users and third parties.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Data Responsibility
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            Reports are generated based solely on information provided by users. FieldAgentReport
            does not verify, modify, or take responsibility for the accuracy of user-submitted data.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Our Mission
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            Our mission is to modernize field reporting by eliminating repetitive manual paperwork
            and enabling fast, reliable, and standardized digital documentation for field
            professionals worldwide.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Our Commitment
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.8 }}>
            We are committed to providing:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Reliable and secure cloud services
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Simple, efficient, and user-friendly tools
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              High-speed report generation
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Strong data privacy practices
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>
              Continuous improvement based on field needs
            </Typography>
          </Box>
        </Paper>
      </Container>
      <SiteFooter />
    </Box>
  );
}

