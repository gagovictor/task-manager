import getTheme from './theme';
import { Theme } from '@mui/material/styles';

describe('getTheme', () => {
    it('should generate a light theme', () => {
        const theme: Theme = getTheme('light');
        
        expect(theme.palette.mode).toBe('light');
        expect(theme.palette.primary.main).toBe('#39588A');
        expect(theme.palette.primary.contrastText).toBe('#EDF5FF');
        expect(theme.palette.secondary.main).toBe('#E0672F');
        expect(theme.palette.background.default).toBe('#FFFFFF');
        expect(theme.palette.text.primary).toBe('#212121');
        expect(theme.palette.text.secondary).toBe('#757575');
        
        const snackbarContentStyles = theme.components?.MuiSnackbarContent?.styleOverrides?.root as React.CSSProperties;
        expect(snackbarContentStyles.backgroundColor).toBe('#444E5E');
        
        expect(theme.typography.fontFamily).toBe('Roboto, Arial, sans-serif');
    });
    
    it('should generate a dark theme', () => {
        const theme: Theme = getTheme('dark');
        
        expect(theme.palette.mode).toBe('dark');
        expect(theme.palette.primary.main).toBe('#EDF5FF');
        expect(theme.palette.primary.contrastText).toBe('#39588A');
        expect(theme.palette.secondary.main).toBe('#FFF1EB');
        expect(theme.palette.background.default).toBe('#1e1e1e');
        expect(theme.palette.text.primary).toBe('#ffffff');
        expect(theme.palette.text.secondary).toBe('#e0e0e0');
        
        const snackbarContentStyles = theme.components?.MuiSnackbarContent?.styleOverrides?.root as React.CSSProperties;
        expect(snackbarContentStyles.backgroundColor).toBe('#333');
        
        expect(theme.typography.fontFamily).toBe('Roboto, Arial, sans-serif');
    });
    
    it('should have consistent typography settings', () => {
        const lightTheme: Theme = getTheme('light');
        const darkTheme: Theme = getTheme('dark');
        
        expect(lightTheme.typography.fontFamily).toBe('Roboto, Arial, sans-serif');
        expect(darkTheme.typography.fontFamily).toBe('Roboto, Arial, sans-serif');
        expect(lightTheme.typography.button.fontWeight).toBe(700);
        expect(darkTheme.typography.button.fontWeight).toBe(700);
    });
});
