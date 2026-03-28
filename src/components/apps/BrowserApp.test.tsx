import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserApp } from './BrowserApp';

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock store
vi.mock('../../store/useOSStore', () => ({
    useOSStore: () => ({
        cookieConsent: true,
    }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Globe: () => <div data-testid="icon-globe" />,
    RefreshCw: () => <div data-testid="icon-refresh" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
    WifiOff: () => <div data-testid="icon-wifi-off" />,
    RotateCcw: () => <div data-testid="icon-rotate" />,
    ShieldAlert: () => <div data-testid="icon-shield" />,
    Cookie: () => <div data-testid="icon-cookie" />,
}));

// Mock LinkedInBadge
vi.mock('../ui/LinkedInBadge', () => ({
    LinkedInBadge: () => <div data-testid="linkedin-badge">LinkedIn Profile</div>,
}));

describe('BrowserApp Security', () => {
    it('blocks malicious URLs that try to bypass validation with query params', () => {
        render(<BrowserApp />);

        const input = screen.getByPlaceholderText('browserApp.searchPlaceholder');

        // This URL contains the "required" string but is actually pointing to evil.com
        const maliciousUrl = 'https://evil.com/?q=linkedin.com/in/kadir-aydemir';

        fireEvent.change(input, { target: { value: maliciousUrl } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // Should show error screen
        // The error screen contains "browserApp.errorTitle"
        expect(screen.getByText('browserApp.errorTitle')).toBeInTheDocument();

        // Should NOT show LinkedIn badge (which would mean it was accepted as a valid linkedin url)
        expect(screen.queryByTestId('linkedin-badge')).not.toBeInTheDocument();

        // Should NOT show iframe (just in case)
        expect(screen.queryByTitle('Web Browser')).not.toBeInTheDocument();
    });

    it('allows valid LinkedIn profile URLs', () => {
        render(<BrowserApp />);

        const input = screen.getByPlaceholderText('browserApp.searchPlaceholder');
        const validUrl = 'https://www.linkedin.com/in/kadir-aydemir-3a1a55148/';

        fireEvent.change(input, { target: { value: validUrl } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // Should NOT show error
        expect(screen.queryByText('browserApp.errorTitle')).not.toBeInTheDocument();

        // Should show LinkedIn badge (since it matches the render logic for linkedin.com)
        expect(screen.getByTestId('linkedin-badge')).toBeInTheDocument();
    });
});
