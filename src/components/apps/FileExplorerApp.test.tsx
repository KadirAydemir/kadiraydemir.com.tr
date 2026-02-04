import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileExplorerApp } from './FileExplorerApp';
import * as osStore from '../../store/useOSStore';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, defaultVal: string) => defaultVal || key }),
}));

vi.mock('../../hooks/useProcess', () => ({
    useProcess: () => ({
        openCV: vi.fn(),
        openWindow: vi.fn(),
    }),
}));

vi.mock('../../hooks/useIsMobile', () => ({
    useIsMobile: () => false,
}));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
    };
});

describe('FileExplorerApp', () => {
    const mockRenameItem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock the store
        // We use spyOn because we want to intercept the hook call
        vi.spyOn(osStore, 'useOSStore').mockReturnValue({
            fileSystem: {
                id: 'root',
                name: 'Root',
                type: 'folder',
                children: [
                     { id: 'test-file', name: 'test.txt', type: 'file', extension: 'txt' }
                ]
            },
            createItem: vi.fn(),
            deleteItem: vi.fn(),
            renameItem: mockRenameItem,
            restoreItem: vi.fn(),
            emptyTrash: vi.fn(),
            showAlert: vi.fn(),
            showConfirm: vi.fn(),
            showPrompt: vi.fn(),
        } as any);
    });

    it('should automatically add .txt suffix if missing when renaming a text file', async () => {
        render(<FileExplorerApp initialPath={['root']} />);

        // Find the file
        const fileItem = screen.getByText('test.txt');

        // Right click to open context menu
        fireEvent.contextMenu(fileItem);

        // Click Rename
        const renameOption = screen.getByText('Rename');
        fireEvent.click(renameOption);

        // Find input (which should be visible now)
        // The input has the value of the file name
        const input = screen.getByDisplayValue('test.txt');

        // Change value to "newname" (missing .txt)
        fireEvent.change(input, { target: { value: 'newname' } });

        // Trigger submit (Enter)
        fireEvent.keyDown(input, { key: 'Enter' });

        // Expect renameItem to be called with "newname.txt"
        // This fails if the feature is not implemented
        expect(mockRenameItem).toHaveBeenCalledWith('test-file', 'newname.txt');
    });

    it('should not double add .txt suffix if already present', async () => {
        render(<FileExplorerApp initialPath={['root']} />);
        const fileItem = screen.getByText('test.txt');
        fireEvent.contextMenu(fileItem);
        const renameOption = screen.getByText('Rename');
        fireEvent.click(renameOption);
        const input = screen.getByDisplayValue('test.txt');
        fireEvent.change(input, { target: { value: 'newname.txt' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(mockRenameItem).toHaveBeenCalledWith('test-file', 'newname.txt');
    });
});
