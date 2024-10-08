import preferencesSlice, {
    toggleTheme,
    setLanguage,
    PreferencesState,
    initialState,
} from './preferencesSlice';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
    };
})();

describe('preferencesSlice', () => {
    beforeEach(() => {
        localStorageMock.clear();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
        });
    });
    
    it('should return the initial state', () => {
        const state = preferencesSlice.reducer(undefined, { type: '' });
        expect(state).toEqual(initialState);
    });
    
    it('should toggle the theme from light to dark and update localStorage', () => {
        const previousState: PreferencesState = { ...initialState, theme: 'light' };
        const newState = preferencesSlice.reducer(previousState, toggleTheme());
        expect(newState.theme).toBe('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
    });
    
    it('should toggle the theme from dark to light and update localStorage', () => {
        const previousState: PreferencesState = { ...initialState, theme: 'dark' };
        const newState = preferencesSlice.reducer(previousState, toggleTheme());
        expect(newState.theme).toBe('light');
        expect(localStorage.getItem('theme')).toBe('light');
    });
    
    it('should set the language to "es"', () => {
        const previousState: PreferencesState = { ...initialState, language: 'en' };
        const newState = preferencesSlice.reducer(
            previousState,
            setLanguage('es')
        );
        expect(newState.language).toBe('es');
    });
    
    it('should set the language to "en"', () => {
        const previousState: PreferencesState = { ...initialState, language: 'es' };
        const newState = preferencesSlice.reducer(
            previousState,
            setLanguage('en')
        );
        expect(newState.language).toBe('en');
    });
});
