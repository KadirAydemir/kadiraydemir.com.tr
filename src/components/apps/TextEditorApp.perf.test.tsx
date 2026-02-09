import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextEditorApp } from './TextEditorApp';
import { useOSStore } from '../../store/useOSStore';

// Mock the utility module to spy on findNode calls
vi.mock('../../utils/fileSystem', () => {
    return {
        findNode: vi.fn(),
    };
});

// Import the mocked function to verify calls
import { findNode } from '../../utils/fileSystem';

describe('TextEditorApp Performance', () => {
    const fileId = 'test-file-id';
    const mockFile = {
        id: fileId,
        name: 'test.txt',
        type: 'file',
        content: 'Initial content',
        modified: '2024-01-01',
    };

    const mockFileSystem = {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [mockFile],
    };

    beforeEach(() => {
        // Reset store state
        useOSStore.setState({
            fileSystem: mockFileSystem as any,
        });
        vi.clearAllMocks();

        // Setup mock implementation to return the file
        (findNode as any).mockImplementation((root: any, id: string) => {
            if (id === fileId) return mockFile;
            return null;
        });
    });

    it('should memoize file lookup and not re-scan file system on typing', () => {
        render(<TextEditorApp fileId={fileId} />);

        // Initial render should call findNode
        expect(findNode).toHaveBeenCalledTimes(1);

        const textarea = screen.getByPlaceholderText('editor.placeholder');

        // Type a character - this updates local state 'content' and triggers re-render
        fireEvent.change(textarea, { target: { value: 'A' } });

        // Should NOT call findNode again because of useMemo
        expect(findNode).toHaveBeenCalledTimes(1);

        // Type another character
        fireEvent.change(textarea, { target: { value: 'AB' } });

        // Still should NOT call findNode again
        expect(findNode).toHaveBeenCalledTimes(1);
    });
});
