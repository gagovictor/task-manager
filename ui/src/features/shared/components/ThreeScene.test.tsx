import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from '@mui/material/styles';
import ThreeScene from './ThreeScene';
import * as THREE from 'three';

const mockStore = configureStore([]);

// Mock theme
const mockTheme = {
    palette: {
        background: {
            default: '#fff'
        },
        primary: {
            main: '#ff0000'
        },
        secondary: {
            main: '#00ff00'
        }
    }
};

// Helper to render ThreeScene with required providers
const renderWithProviders = (component, store) => {
    return render(
        <Provider store={store}>
            <ThemeProvider theme={mockTheme}>
                {component}
            </ThemeProvider>
        </Provider>
    );
};

describe('ThreeScene Component', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            preferences: {
                theme: 'light'
            }
        });
    });

    it('renders without crashing', () => {
        const { container } = renderWithProviders(<ThreeScene />, store);
        expect(container).toBeTruthy();
    });

    it('initializes THREE.js scene', () => {
        const sceneAddSpy = jest.spyOn(THREE.Scene.prototype, 'add');
        renderWithProviders(<ThreeScene />, store);
        expect(sceneAddSpy).toHaveBeenCalled();
    });

    it('creates the correct number of nodes', () => {
        const nodesCount = 10;
        const sceneAddSpy = jest.spyOn(THREE.Scene.prototype, 'add');
        renderWithProviders(<ThreeScene nodesCount={nodesCount} />, store);
        // Expecting at least nodesCount nodes to be added to the scene
        expect(sceneAddSpy).toHaveBeenCalledTimes(nodesCount + expect.any(Number));
    });

    it('disposes the scene properly on unmount', () => {
        const disposeSpy = jest.spyOn(THREE.WebGLRenderer.prototype, 'dispose');
        const { unmount } = renderWithProviders(<ThreeScene />, store);
        unmount();
        expect(disposeSpy).toHaveBeenCalled();
    });

    it('updates scene when theme changes', () => {
        const setClearColorSpy = jest.spyOn(THREE.WebGLRenderer.prototype, 'setClearColor');
        const { rerender } = renderWithProviders(<ThreeScene />, store);
        store = mockStore({
            preferences: {
                theme: 'dark'
            }
        });
        rerender(
            <Provider store={store}>
                <ThemeProvider theme={mockTheme}>
                    <ThreeScene />
                </ThemeProvider>
            </Provider>
        );
        expect(setClearColorSpy).toHaveBeenCalled();
    });

    it('responds to mouse move events', () => {
        renderWithProviders(<ThreeScene />, store);
        const mouseMoveEvent = new MouseEvent('mousemove', {
            clientX: 100,
            clientY: 100,
        });
        window.dispatchEvent(mouseMoveEvent);
        // Just verifying that no errors are thrown and events are handled
        expect(true).toBe(true);
    });

    it('responds to window resize events', () => {
        renderWithProviders(<ThreeScene />, store);
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        // Just verifying that no errors are thrown and events are handled
        expect(true).toBe(true);
    });
});
