import '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill crypto.randomUUID
if (!globalThis.crypto?.randomUUID) {
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
        value: () => 'test-uuid-' + Math.random(),
        writable: true,
    });
}

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: () => new Promise(() => { }),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
}));
