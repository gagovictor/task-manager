import getTheme from './theme';
import { Theme } from '@mui/material/styles';

const getMetaTagContent = (name: string): string | null => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
};

describe('getTheme', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
    });

    describe('Theme Object', () => {
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
    
    describe('Meta Tags', () => {
        it('should set meta tags correctly for light mode when meta tags do not exist', () => {
            // Ensure meta tags do not exist before
            expect(getMetaTagContent('theme-color')).toBeNull();
            expect(getMetaTagContent('background-color')).toBeNull();
            
            // Call getTheme
            getTheme('light');
            
            // Check meta tags
            expect(getMetaTagContent('theme-color')).toBe('#39588A'); // pwaBackgroundColor in light mode is primary.main
            expect(getMetaTagContent('background-color')).toBe('#39588A'); // Same as pwaBackgroundColor
        });
        
        it('should set meta tags correctly for dark mode when meta tags do not exist', () => {
            // Ensure meta tags do not exist before
            expect(getMetaTagContent('theme-color')).toBeNull();
            expect(getMetaTagContent('background-color')).toBeNull();
            
            // Call getTheme
            getTheme('dark');
            
            // Check meta tags
            expect(getMetaTagContent('theme-color')).toBe('#272727'); // pwaBackgroundColor in dark mode
            expect(getMetaTagContent('background-color')).toBe('#272727'); // Same as pwaBackgroundColor
        });
        
        it('should update existing meta tags correctly for light mode', () => {
            // Create existing meta tags with different content
            const existingThemeColor = document.createElement('meta');
            existingThemeColor.setAttribute('name', 'theme-color');
            existingThemeColor.setAttribute('content', '#000000');
            document.head.appendChild(existingThemeColor);
            
            const existingBackgroundColor = document.createElement('meta');
            existingBackgroundColor.setAttribute('name', 'background-color');
            existingBackgroundColor.setAttribute('content', '#000000');
            document.head.appendChild(existingBackgroundColor);
            
            // Verify initial content
            expect(getMetaTagContent('theme-color')).toBe('#000000');
            expect(getMetaTagContent('background-color')).toBe('#000000');
            
            // Call getTheme
            getTheme('light');
            
            // Check updated meta tags
            expect(getMetaTagContent('theme-color')).toBe('#39588A');
            expect(getMetaTagContent('background-color')).toBe('#39588A');
        });
        
        it('should update existing meta tags correctly for dark mode', () => {
            // Create existing meta tags with different content
            const existingThemeColor = document.createElement('meta');
            existingThemeColor.setAttribute('name', 'theme-color');
            existingThemeColor.setAttribute('content', '#ffffff');
            document.head.appendChild(existingThemeColor);
            
            const existingBackgroundColor = document.createElement('meta');
            existingBackgroundColor.setAttribute('name', 'background-color');
            existingBackgroundColor.setAttribute('content', '#ffffff');
            document.head.appendChild(existingBackgroundColor);
            
            // Verify initial content
            expect(getMetaTagContent('theme-color')).toBe('#ffffff');
            expect(getMetaTagContent('background-color')).toBe('#ffffff');
            
            // Call getTheme
            getTheme('dark');
            
            // Check updated meta tags
            expect(getMetaTagContent('theme-color')).toBe('#272727');
            expect(getMetaTagContent('background-color')).toBe('#272727');
        });
        
        it('should create meta tags if they do not exist', () => {
            // Ensure meta tags do not exist before
            expect(getMetaTagContent('theme-color')).toBeNull();
            expect(getMetaTagContent('background-color')).toBeNull();
            
            // Call getTheme
            getTheme('light');
            
            // Check that meta tags are created
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            const backgroundColorMeta = document.querySelector('meta[name="background-color"]');
            
            expect(themeColorMeta).not.toBeNull();
            expect(backgroundColorMeta).not.toBeNull();
            
            expect(themeColorMeta?.getAttribute('content')).toBe('#39588A');
            expect(backgroundColorMeta?.getAttribute('content')).toBe('#39588A');
        });
    });
    
    describe('PWA Background Color', () => {
        it('should set PWA background color to primary.main in light mode', () => {
            getTheme('light');
            
            expect(getMetaTagContent('background-color')).toBe('#39588A');
        });
        
        it('should set PWA background color to #272727 in dark mode', () => {
            getTheme('dark');
            
            expect(getMetaTagContent('background-color')).toBe('#272727');
        });
    });
});
