import { createTheme } from '@mui/material/styles';

const accent = {
  main: '#dc3545',
  light: '#e84a5a',
  dark: '#c82333',
  contrastText: '#fff',
};

export function getMuiTheme(mode = 'light') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: accent,
      secondary: {
        main: isDark ? '#a1a1a6' : '#6e6e73',
        contrastText: isDark ? '#f5f5f7' : '#1d1d1f',
      },
      background: {
        default: isDark ? '#1a1a1d' : '#f5f5f7',
        paper: isDark ? '#252528' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f5f5f7' : '#1d1d1f',
        secondary: isDark ? '#a1a1a6' : '#6e6e73',
      },
      error: {
        main: isDark ? '#e84a5a' : '#dc3545',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontSize: '1.75rem', fontWeight: 700 },
      h2: { fontSize: '1.25rem', fontWeight: 600 },
      h3: { fontSize: '1.1rem', fontWeight: 600 },
      body1: { fontSize: '0.95rem' },
      body2: { fontSize: '0.875rem' },
      button: { textTransform: 'none', fontWeight: 600 },
      caption: { fontSize: '0.75rem' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': { borderWidth: 1.5 },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
          size: 'medium',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              transition: 'background-color 0.2s, border-color 0.2s',
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 2px 12px rgba(0,0,0,0.08)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
            borderRadius: 10,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiLink: {
        defaultProps: {
          underline: 'hover',
        },
        styleOverrides: {
          root: {
            cursor: 'pointer',
          },
        },
      },
      // Date picker & time picker theme (MUI X)
      MuiPickersDay: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
            '&.Mui-selected.Mui-focusVisible': {
              backgroundColor: 'primary.dark',
            },
          },
        },
      },
      MuiDateCalendar: {
        styleOverrides: {
          root: {
            '& .MuiPickersCalendarHeader-label': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          switchViewButton: {
            borderRadius: 10,
          },
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: {
            fontWeight: 600,
          },
        },
      },
      MuiTimeClock: {
        styleOverrides: {
          root: {
            '& .MuiClockNumber-root': {
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
            },
            '& .MuiClock-pin': {
              backgroundColor: 'primary.main',
            },
            '& .MuiClockPointer-thumb': {
              backgroundColor: 'primary.main',
              borderColor: 'primary.main',
            },
          },
        },
      },
      MuiPickersArrowSwitcher: {
        styleOverrides: {
          button: {
            borderRadius: 10,
          },
        },
      },
    },
  });
}
