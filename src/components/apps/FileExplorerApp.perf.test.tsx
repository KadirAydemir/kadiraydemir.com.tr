import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileExplorerApp } from './FileExplorerApp';
import * as FileGridModule from './file-explorer/FileGrid';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../hooks/useProcess', () => ({
    useProcess: () => ({ openWindow: vi.fn() }),
}));

const mockFileSystem = {
    id: 'home',
    name: 'Home',
    type: 'folder',
    children: [
        {
            id: 'desktop',
            name: 'Desktop',
            type: 'folder',
            children: [
                { id: 'projects', name: 'Projects', type: 'folder', children: [] }
            ]
        }
    ]
};

vi.mock('../../store/useOSStore', () => ({
    useOSStore: () => ({
        fileSystem: mockFileSystem,
        createItem: vi.fn(),
        deleteItem: vi.fn(),
        renameItem: vi.fn(),
        restoreItem: vi.fn(),
        emptyTrash: vi.fn(),
        showConfirm: vi.fn(),
    }),
}));

// Mock child components to isolate FileGrid prop checks
vi.mock('./file-explorer/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('./file-explorer/Navigation', () => ({
    Navigation: () => <div data-testid="navigation">Navigation</div>
}));

vi.mock('../ui/ContextMenu', () => ({
    ContextMenu: () => <div data-testid="context-menu">ContextMenu</div>
}));

describe('FileExplorerApp Performance', () => {
    it('maintains stable object reference for folder items across re-renders', async () => {
        // Spy on FileGrid
        const fileGridSpy = vi.spyOn(FileGridModule, 'FileGrid');
        fileGridSpy.mockImplementation(() => <div data-testid="file-grid">FileGrid</div>);

        const { container } = render(<FileExplorerApp initialPath={['home', 'desktop', 'projects']} />);

        // Wait for initial render
        expect(screen.getByTestId('file-grid')).toBeDefined();

        // Get the items prop from the first render
        const initialCalls = fileGridSpy.mock.calls.length;
        const initialItems = fileGridSpy.mock.calls[initialCalls - 1][0].items;

        // Trigger a re-render by clicking the background (updates selectedItem to null, or just re-runs)
        // Or better, interact with something that changes state but not the folder content.
        // Clicking the container sets selectedItem to null.
        // If selectedItem is already null, it might bail out?
        // Let's set selectedItem first to something, then null?
        // Easier: The component has `const [contextMenu, setContextMenu] ...`
        // We can trigger context menu to update state.

        await act(async () => {
             fireEvent.contextMenu(container.firstChild as Element, { clientX: 100, clientY: 100 });
        });

        // Now FileGrid should have been rendered again
        const secondCalls = fileGridSpy.mock.calls.length;
        expect(secondCalls).toBeGreaterThan(initialCalls);

        const secondItems = fileGridSpy.mock.calls[secondCalls - 1][0].items;

        // In the optimized version, these should be the same reference
        // because we use useMemo
        expect(initialItems).toBe(secondItems);

        // Ensure content is actually the same (sanity check)
        expect(JSON.stringify(initialItems)).toEqual(JSON.stringify(secondItems));
    });
});
