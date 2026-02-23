import { useApp } from '../context/AppContext.jsx';
import { Box, Typography } from '@mui/material';

const PRIMARY_OPTIONS = [
  'Deposition',
  'IME',
  'VOC',
  'Vocational Assessment',
  'Unsworn Interview',
  'ENT Test',
];

const IME_SUB_OPTIONS = ['Psychological IME', 'ENT IME', 'Neurological IME'];

export default function EventTypeToggle() {
  const { eventType, imeSubType, setEventType, setImeSubType } = useApp();
  const showImeSub = eventType === 'IME';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minHeight: showImeSub ? undefined : 60,
      }}
    >
      {/* <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ width:"max-content", letterSpacing: '0.08em', padding:"2px 10px", borderBlockEnd: '2px solid rgb(192, 53, 53)' }}
      >
        SELECT EVENT TYPE
      </Typography> */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          overflowX: { xs: 'auto', md: 'visible' },
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          pb: { xs: 0.5, md: 0 },
          mx: { xs: -0.5, md: 0 },
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'divider' },
        }}
      >
        {PRIMARY_OPTIONS.map((opt) => {
          const active = eventType === opt;
          return (
            <Box
              key={opt}
              component="button"
              type="button"
              onClick={() => setEventType(opt)}
              sx={{
                flexShrink: 0,
                px: 2,
                py: 1,
                borderRadius: '999px',
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'divider',
                bgcolor: active ? 'primary.main' : 'transparent',
                color: active ? 'primary.contrastText' : 'text.primary',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                boxShadow: active ? 2 : 0,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: active ? 'primary.dark' : 'action.hover',
                  color: active ? 'primary.contrastText' : 'primary.main',
                  transform: 'scale(1.02)',
                  boxShadow: 2,
                },
              }}
            >
              {opt}
            </Box>
          );
        })}
      </Box>
      {showImeSub && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexWrap: 'wrap',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {IME_SUB_OPTIONS.map((opt) => {
            const active = imeSubType === opt;
            return (
              <Box
                key={opt}
                component="button"
                type="button"
                onClick={() => setImeSubType(opt)}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: active ? 'primary.main' : 'divider',
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: active ? 'primary.dark' : 'action.hover',
                    color: active ? 'primary.contrastText' : 'primary.main',
                  },
                }}
              >
                {opt}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
