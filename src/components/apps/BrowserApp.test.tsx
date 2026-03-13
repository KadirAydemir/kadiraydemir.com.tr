import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserApp } from './BrowserApp';
import * as osStore from '../../store/useOSStore';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../store/useOSStore', () => ({
    useOSStore: vi.fn(),
}));

describe('BrowserApp Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (osStore.useOSStore as any).mockReturnValue({
            cookieConsent: true,
        });
    });

    it('should allow valid LinkedIn URL', () => {
        render(<BrowserApp />);

        const input = screen.getByPlaceholderText('browserApp.searchPlaceholder');
        const validUrl = 'https://www.linkedin.com/in/kadir-aydemir-3a1a55148/';

        fireEvent.change(input, { target: { value: validUrl } });
        fireEvent.keyDown(input, { key: 'Enter' });

        // Check that error message is NOT displayed
        expect(screen.queryByText('browserApp.errorTitle')).toBeNull();
    });

    it('should reject malicious URL bypassing simple check', () => {
        render(<BrowserApp />);

        const input = screen.getByPlaceholderText('browserApp.searchPlaceholder');
        // This URL contains the allowed string but points to a different domain
        const maliciousUrl = 'https://malicious.com/?q=linkedin.com/in/kadir-aydemir';

        fireEvent.change(input, { target: { value: maliciousUrl } });
        fireEvent.keyDown(input, { key: 'Enter' });

        // Should show error screen, but currently likely doesn't
        // If the vulnerability exists, this expectation will fail (error title won't be found)
        expect(screen.getByText('browserApp.errorTitle')).toBeInTheDocument();
    });
});
