
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOSStore } from './useOSStore';

// Mock performance.now if not available (Node environment usually has it, but good to be safe)
// vitest uses node, so performance is global.

describe('useOSStore Performance Benchmark', () => {
    let originalLocalStorage: any;

    beforeEach(() => {
        // Reset store state
        useOSStore.setState({
            fileSystem: {
                id: 'root',
                name: 'root',
                type: 'folder',
                children: [{
                    id: 'test-file',
                    name: 'test.txt',
                    type: 'file',
                    content: 'Initial content',
                    modified: '2023-01-01'
                }]
            }
        });

        originalLocalStorage = global.localStorage;

        // Mock localStorage with a slow setItem
        const slowLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn((key, value) => {
                const start = performance.now();
                // Simulate 50ms blocking I/O
                while (performance.now() - start < 50) {
                    // Busy wait
                }
            }),
            removeItem: vi.fn(),
            clear: vi.fn(),
            length: 0,
            key: vi.fn(),
        };

        Object.defineProperty(global, 'localStorage', {
            value: slowLocalStorage,
            writable: true
        });
    });

    afterEach(() => {
        // Restore localStorage
        Object.defineProperty(global, 'localStorage', {
            value: originalLocalStorage,
            writable: true
        });
    });

    it('benchmarks synchronous saveFileSystem performance', () => {
        const { updateFileContent } = useOSStore.getState();

        const start = performance.now();
        // This triggers saveFileSystem
        updateFileContent('test-file', 'Updated content');
        const end = performance.now();

        const duration = end - start;
        console.log(`[Optimized] updateFileContent duration: ${duration.toFixed(2)}ms`);

        // With the optimization, this should be very fast (non-blocking)
        expect(duration).toBeLessThan(10);
    });
});
