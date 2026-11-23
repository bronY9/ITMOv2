import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#334e9e', dark: '#263e84', light: '#e8edfb' },
    background: { default: '#f6f5f1', paper: '#ffffff' },
    text: { primary: '#202838', secondary: '#626c7d' },
    divider: '#dfe2e8',
    success: { main: '#267454' },
    error: { main: '#a52d1e' },
  },
  spacing: 8,
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: 38, lineHeight: 1.18, fontWeight: 750, letterSpacing: '-1.3px' },
    h2: { fontSize: 20, lineHeight: 1.35, fontWeight: 700, letterSpacing: '-.4px' },
    subtitle1: { fontSize: 18, fontWeight: 700 },
    body1: { fontSize: 16, lineHeight: 1.65 },
    body2: { fontSize: 14, lineHeight: 1.65 },
    button: { textTransform: 'none', fontWeight: 650, fontSize: 14 },
    caption: { fontSize: 12, lineHeight: 1.6 },
    overline: { fontSize: 11, lineHeight: 1.6, letterSpacing: 1.1, fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
        'a:focus-visible, button:focus-visible, .Mui-focusVisible': {
          outline: '3px solid #334e9e', outlineOffset: '4px',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8, padding: '10px 16px', minHeight: 42 } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 3px 12px #20283803' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fdfdfe',
          '&.Mui-focused': { outline: '3px solid #334e9e', outlineOffset: 3 },
        },
        input: {
          fontFamily: '"SFMono-Regular", Consolas, monospace',
          fontSize: 13, lineHeight: 1.65,
          '&:focus-visible': { outline: 'none' },
        },
      },
    },
    MuiDialog: { defaultProps: { transitionDuration: 120 } },
  },
});
