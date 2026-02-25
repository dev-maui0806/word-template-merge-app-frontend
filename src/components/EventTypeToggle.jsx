import { useApp } from '../context/AppContext.jsx';
import { Box, Typography } from '@mui/material';

const PRIMARY_OPTIONS = [
  { label: 'Deposition', icon: null },
  { label: 'IME', icon: '🟢' },
  { label: 'VOC', icon: null },
  { label: 'Unsworn Interview', icon: null },
  { label: 'ENT Test', icon: null },
];

const IME_SUB_OPTIONS = [
  { label: 'Psychological IME', color: '#8012d1', bgColor: 'rgba(250, 245, 255, 1)' },
  { label: 'ENT IME', color: '#374151', bgColor: 'rgb(255, 255, 255)' },
  { label: 'Neurological IME', color: '#374151', bgColor: 'rgb(255, 255, 255)' },
];

export default function EventTypeToggle() {
  const { eventType, imeSubType, setEventType, setImeSubType } = useApp();
  const showImeSub = eventType === 'IME';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SELECT EVENT TYPE Label */}
      <Typography
        sx={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'text.secondary',
          letterSpacing: '3.6px',
          lineHeight: '27px',
          textTransform: 'uppercase',
          textAlign: 'right',
        }}
      >
        Select Event Type
      </Typography>

      {/* Primary Options Container */}
      <Box
        sx={(theme) => {
          const isDark = theme.palette.mode === 'dark';
          return {
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            backgroundColor: isDark ? 'rgba(24,24,27,1)' : '#f2f3f5',
            border: `1px solid ${
              isDark ? 'rgba(255,255,255,0.14)' : '#e2e4e8'
            }`,
            borderRadius: '50px',
            padding: '6px',
            boxShadow: isDark
              ? 'inset 0 1px 2px rgba(0,0,0,0.7)'
              : 'inset 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 2px 4px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.2s ease',
          };
        }}
      >
        {PRIMARY_OPTIONS.map((opt) => {
          const active = eventType === opt.label;
          return (
            <Box
              key={opt.label}
              component="button"
              onClick={() => setEventType(opt.label)}
              sx={(theme) => {
                const isDark = theme.palette.mode === 'dark';
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  px: '21px',
                  py: '8px',
                  borderRadius: '50px',
                  border: 'none',
                  backgroundColor: active
                    ? isDark
                      ? 'rgba(15,23,42,1)'
                      : 'rgb(255, 255, 255)'
                    : 'transparent',
                  color: theme.palette.text.primary,
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '21px',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease-in',
                  fontFamily: 'system-ui',
                  fontStyle: 'normal',
                  '&:hover': {
                    backgroundColor: active
                      ? undefined
                      : isDark
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.8)',
                  },
                };
              }}
            >
              {opt.icon && (
                <Box
                  sx={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    marginRight: '0px',
                  }}
                />
              )}
              <span>{opt.label}</span>
            </Box>
          );
        })}
      </Box>

      {/* IME Sub-options Container */}
      {showImeSub && (
        <Box
          sx={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginTop: '14px',
            transition: 'all 0.7s ease',
          }}
        >
          {IME_SUB_OPTIONS.map((opt) => {
            const active = imeSubType === opt.label;
            return (
              <Box
                key={opt.label}
                component="button"
                type="button"
                onClick={() => setImeSubType(opt.label)}
                sx={(theme) => {
                  const isDark = theme.palette.mode === 'dark';
                  const activeBgLight =
                    opt.color === '#8012d1'
                      ? 'rgba(240, 220, 255, 1)'
                      : 'rgba(245, 245, 245, 1)';
                  return {
                    px: '16px',
                    py: '7px',
                    borderRadius: '999px',
                    border: `1px solid ${
                      active
                        ? theme.palette.primary.main
                        : isDark
                        ? 'rgba(255,255,255,0.18)'
                        : '#e5e7eb'
                    }`,
                    backgroundColor: active
                      ? isDark
                        ? 'rgba(255,255,255,0.06)'
                        : activeBgLight
                      : isDark
                      ? 'transparent'
                      : opt.bgColor,
                    color: active
                      ? opt.color === '#8012d1'
                        ? '#8012d1'
                        : theme.palette.text.primary
                      : isDark
                      ? theme.palette.text.secondary
                      : opt.color,
                    fontSize: '12px',
                    fontWeight: 700,
                    lineHeight: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: active
                        ? undefined
                        : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : activeBgLight,
                    },
                  };
                }}
              >
                {opt.label}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
