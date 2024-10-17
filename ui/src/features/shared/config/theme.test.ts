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
        });
        
        it('should generate a dark theme', () => {
            const theme: Theme = getTheme('dark');
            
            expect(theme.palette.mode).toBe('dark');
        });
        
        it('should have consistent typography settings', () => {
            const lightTheme: Theme = getTheme('light');
            const darkTheme: Theme = getTheme('dark');
            
            expect(lightTheme.typography.fontFamily).toBe(darkTheme.typography.fontFamily);
            expect(lightTheme.typography.button.fontWeight).toBe(darkTheme.typography.button.fontWeight);
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
            expect(getMetaTagContent('theme-color')).toBeTruthy();
            expect(getMetaTagContent('background-color')).toBeTruthy();
        });
        
        it('should set meta tags correctly for dark mode when meta tags do not exist', () => {
            // Ensure meta tags do not exist before
            expect(getMetaTagContent('theme-color')).toBeNull();
            expect(getMetaTagContent('background-color')).toBeNull();
            
            // Call getTheme
            getTheme('dark');
            
            // Check meta tags
            expect(getMetaTagContent('theme-color')).toBeTruthy();
            expect(getMetaTagContent('background-color')).toBeTruthy();
        });
        
        it('should update existing meta tags correctly for light mode', () => {
            // Create existing meta tags with different content
            const initialColor = '#000000';
            const existingThemeColor = document.createElement('meta');
            existingThemeColor.setAttribute('name', 'theme-color');
            existingThemeColor.setAttribute('content', initialColor);
            document.head.appendChild(existingThemeColor);
            
            const existingBackgroundColor = document.createElement('meta');
            existingBackgroundColor.setAttribute('name', 'background-color');
            existingBackgroundColor.setAttribute('content', initialColor);
            document.head.appendChild(existingBackgroundColor);
            
            // Verify initial content
            expect(getMetaTagContent('theme-color')).toBe(initialColor);
            expect(getMetaTagContent('background-color')).toBe(initialColor);
            
            // Call getTheme
            getTheme('light');
            
            // Check updated meta tags
            expect(getMetaTagContent('theme-color')).not.toBe(initialColor);
            expect(getMetaTagContent('background-color')).not.toBe(initialColor);
        });
        
        it('should update existing meta tags correctly for dark mode', () => {
            // Create existing meta tags with different content
            const initialColor = '#ffffff';
            const existingThemeColor = document.createElement('meta');
            existingThemeColor.setAttribute('name', 'theme-color');
            existingThemeColor.setAttribute('content', initialColor);
            document.head.appendChild(existingThemeColor);
            
            const existingBackgroundColor = document.createElement('meta');
            existingBackgroundColor.setAttribute('name', 'background-color');
            existingBackgroundColor.setAttribute('content', initialColor);
            document.head.appendChild(existingBackgroundColor);
            
            // Verify initial content
            expect(getMetaTagContent('theme-color')).toBe(initialColor);
            expect(getMetaTagContent('background-color')).toBe(initialColor);
            
            // Call getTheme
            getTheme('dark');
            
            // Check updated meta tags
            expect(getMetaTagContent('theme-color')).not.toBe(initialColor);
            expect(getMetaTagContent('background-color')).not.toBe(initialColor);
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
        });
    });
});
