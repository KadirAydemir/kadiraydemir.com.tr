import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CookieBanner } from './CookieBanner';
import { useOSStore } from '../../store/useOSStore';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        Cookie: () => <div data-testid="icon-cookie" />,
        X: () => <div data-testid="icon-x" />,
        Check: () => <div data-testid="icon-check" />,
        ShieldCheck: () => <div data-testid="icon-shield-check" />,
    };
});

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} {...props}>
                {children}
            </div>
        ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CookieBanner', () => {
    beforeEach(() => {
        useOSStore.setState({
            cookieConsent: null
        });
    });

    it('renders when cookieConsent is null', () => {
        render(<CookieBanner />);

        expect(screen.getByText('Çerez Ayarları')).toBeInTheDocument();
        expect(screen.getByText('Kabul Et')).toBeInTheDocument();
        expect(screen.getByText('Reddet')).toBeInTheDocument();
    });

    it('does not render when cookieConsent is true', () => {
        useOSStore.setState({ cookieConsent: true });
        render(<CookieBanner />);
        expect(screen.queryByText('Çerez Ayarları')).not.toBeInTheDocument();
    });

    it('does not render when cookieConsent is false', () => {
        useOSStore.setState({ cookieConsent: false });
        render(<CookieBanner />);
        expect(screen.queryByText('Çerez Ayarları')).not.toBeInTheDocument();
    });

    it('sets consent to true when "Kabul Et" is clicked', () => {
        render(<CookieBanner />);

        fireEvent.click(screen.getByText('Kabul Et'));

        const { cookieConsent } = useOSStore.getState();
        expect(cookieConsent).toBe(true);
    });

    it('sets consent to false when "Reddet" is clicked', () => {
        render(<CookieBanner />);

        fireEvent.click(screen.getByText('Reddet'));

        const { cookieConsent } = useOSStore.getState();
        expect(cookieConsent).toBe(false);
    });

    it('sets consent to false when close icon is clicked', () => {
        render(<CookieBanner />);

        const closeBtn = screen.getByTestId('icon-x').parentElement;
        fireEvent.click(closeBtn!);

        const { cookieConsent } = useOSStore.getState();
        expect(cookieConsent).toBe(false);
    });
});
