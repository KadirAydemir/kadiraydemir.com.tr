import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationsMenu } from './ApplicationsMenu';
import { useOSStore } from '../../store/useOSStore';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        Search: () => <div data-testid="icon-search" />,
        Terminal: () => <div data-testid="icon-terminal" />,
        Globe: () => <div data-testid="icon-globe" />,
        // ... other icons as needed, or let them render if they are just SVGs
    };
});

// Mock Framer Motion to avoid animation issues
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }: any) => (
            <div className={className} onClick={onClick} {...props}>
                {children}
            </div>
        ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ApplicationsMenu', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        useOSStore.setState({
            windows: [],
            activeWindowId: null,
            bootState: 'desktop'
        });
        mockOnClose.mockClear();
    });

    it('renders nothing when isOpen is false', () => {
        render(<ApplicationsMenu isOpen={false} onClose={mockOnClose} />);
        expect(screen.queryByPlaceholderText('Type to search...')).not.toBeInTheDocument();
    });

    it('renders correctly when isOpen is true', () => {
        render(<ApplicationsMenu isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument();
        expect(screen.getByText('Frequent')).toBeInTheDocument();
        expect(screen.getByText('All Applications')).toBeInTheDocument();
    });

    it('shows frequent apps by default', () => {
        render(<ApplicationsMenu isOpen={true} onClose={mockOnClose} />);

        // Terminal, Browser, Mail are frequent
        expect(screen.getByText('Terminal')).toBeInTheDocument();
        expect(screen.getByText('Browser')).toBeInTheDocument();
        expect(screen.getByText('Mail')).toBeInTheDocument();

        // Minesweeper, Sudoku are not frequent (in default list)
        // Note: verify if Minesweeper is frequent in ApplicationsMenu.tsx
        // Looking at file: Minesweeper frequent: false
        expect(screen.queryByText('Minesweeper')).not.toBeInTheDocument();
    });

    it('switches to All Applications tab', () => {
        render(<ApplicationsMenu isOpen={true} onClose={mockOnClose} />);

        const allAppsTab = screen.getByText('All Applications');
        fireEvent.click(allAppsTab);

        // Now Minesweeper should be visible
        expect(screen.getByText('Minesweeper')).toBeInTheDocument();
        // Terminal should still be visible
        expect(screen.getByText('Terminal')).toBeInTheDocument();
    });

    it('filters apps by search query', () => {
        render(<ApplicationsMenu isOpen={true} onClose={mockOnClose} />);

        // Switch to All Apps to search everything
        fireEvent.click(screen.getByText('All Applications'));

        const searchInput = screen.getByPlaceholderText('Type to search...');
        fireEvent.change(searchInput, { target: { value: 'mine' } });

        expect(screen.getByText('Minesweeper')).toBeInTheDocument();
        expect(screen.queryByText('Terminal')).not.toBeInTheDocument();
        expect(screen.queryByText('Browser')).not.toBeInTheDocument();
    });

    it('launches an app and closes menu', () => {
        render(<ApplicationsMenu isOpen={true} onClose={mockOnClose} />);

        const terminalApp = screen.getByText('Terminal');
        // Click the button wrapping the text
        fireEvent.click(terminalApp.closest('button')!);

        // Should call onClose
        expect(mockOnClose).toHaveBeenCalled();

        // Should open window
        const { windows } = useOSStore.getState();
        expect(windows).toHaveLength(1);
        expect(windows[0].appType).toBe('terminal');
    });

    it('closes menu when clicking backdrop', () => {
        render(<ApplicationsMenu isOpen={true} onClose={mockOnClose} />);

        // The backdrop is the first fixed div.
        // It has class "fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        // We can find it by generic div selector if it's the first one, or add test id.
        // Given existing code doesn't have test id, and we shouldn't modify unless needed...
        // Let's rely on the mock of motion.div.
        // The backdrop is a motion.div with onClick={onClose}

        // We can find it by className partially?
        // document.querySelector('.fixed.inset-0.bg-black\\/40')

        const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/40');
        expect(backdrop).toBeTruthy();

        fireEvent.click(backdrop!);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
