import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Desktop } from './Desktop';
import * as osStore from '../../store/useOSStore';

// Define stable mocks
const processMocks = {
    openCV: vi.fn(),
    openWindow: vi.fn(),
    openExplorer: vi.fn(),
};

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, defaultVal: string) => defaultVal || key }),
}));

// Mock useProcess with stable return values
vi.mock('../../hooks/useProcess', () => ({
    useProcess: () => processMocks,
}));

vi.mock('../../hooks/useIsMobile', () => ({
    useIsMobile: () => false,
}));
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...(actual as any) };
});

// Spy on DesktopIcon
const desktopIconSpy = vi.fn();

// Mock DesktopIcon component to track renders
// We must mirror the new props structure and use React.memo
vi.mock('./DesktopIcon', () => {
    const React = require('react');
    return {
        DesktopIcon: React.memo((props: any) => {
            desktopIconSpy(props);
            return <div data-testid="desktop-icon">{props.item.name}</div>;
        })
    };
});

describe('Desktop Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup store with 3 files
        // We need to ensure fileSystem is stable across renders in the test too.
        // mockReturnValue does that.
        vi.spyOn(osStore, 'useOSStore').mockReturnValue({
            fileSystem: {
                id: 'home',
                children: [
                    {
                        id: 'desktop',
                        name: 'Desktop',
                        type: 'folder',
                        children: [
                            { id: 'file1', name: 'file1.txt', type: 'file' },
                            { id: 'file2', name: 'file2.txt', type: 'file' },
                            { id: 'file3', name: 'file3.txt', type: 'file' },
                        ]
                    }
                ]
            },
            createItem: vi.fn(),
            deleteItem: vi.fn(),
            renameItem: vi.fn(),
            restoreItem: vi.fn(),
            emptyTrash: vi.fn(),
            showAlert: vi.fn(),
            showConfirm: vi.fn(),
            showPrompt: vi.fn(),
            deselectAll: vi.fn(),
        } as any);
    });

    it('should NOT re-render icons when Desktop state changes (optimized)', async () => {
        const { container } = render(<Desktop />);

        // Initial render count
        // 2 canonical (cv, projects) + 3 dynamic = 5
        expect(desktopIconSpy).toHaveBeenCalledTimes(5);
        desktopIconSpy.mockClear();

        // Trigger Desktop re-render by opening context menu on background
        const background = container.firstChild as HTMLElement;
        fireEvent.contextMenu(background, { clientX: 100, clientY: 100 });

        // Optimized: Should NOT re-render icons because props are stable
        expect(desktopIconSpy).toHaveBeenCalledTimes(0);
    });
});
