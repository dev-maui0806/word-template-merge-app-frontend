import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

const UTILITY_ITEMS = [
  {
    label: 'File Storage',
    path: '#',
    icon: FolderOpenIcon,
    ariaLabel: 'Document history',
  },
  {
    label: 'Calendar',
    path: '#',
    icon: CalendarMonthIcon,
    ariaLabel: 'Full calendar',
  },
  {
    label: 'Contacts',
    path: '#',
    icon: ContactPhoneIcon,
    ariaLabel: 'Contacts module',
  },
];

export default function UtilitySection() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      {UTILITY_ITEMS.map(({ label, path, icon: Icon, ariaLabel }) => (
        <Box
          key={label}
          component={Link}
          to={path}
          aria-label={ariaLabel}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'transparent',
            color: 'text.secondary',
            textDecoration: 'none',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={500}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
