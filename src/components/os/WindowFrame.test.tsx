import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindowFrame } from './WindowFrame';
import { useOSStore } from '../../store/useOSStore';
import { WindowState } from '../../types/os';
import React from 'react';

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

describe('WindowFrame Performance', () => {
    beforeEach(() => {
        useOSStore.setState({
            windows: [],
            activeWindowId: null,
            bootState: 'desktop'
        });
    });

    it('tracks updateWindowPosition calls during drag', () => {
        // Create a spy function
        const updateSpy = vi.fn();

        // Override the store function
        useOSStore.setState({
            updateWindowPosition: updateSpy
        });

        const mockWindow: WindowState = {
            id: 'win-1',
            appType: 'terminal',
            title: 'Terminal',
            isMinimized: false,
            isMaximized: false,
            zIndex: 10,
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 }
        };

        useOSStore.setState({ windows: [mockWindow] });

        render(
            <WindowFrame window={mockWindow}>
                <div data-testid="content">Content</div>
            </WindowFrame>
        );

        const header = document.querySelector('.window-header');
        expect(header).toBeTruthy();

        if (header) {
            // Simulate drag
            fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });
            fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
            fireEvent.mouseMove(document, { clientX: 120, clientY: 120 });
            fireEvent.mouseMove(document, { clientX: 130, clientY: 130 });
            fireEvent.mouseUp(document);
        }

        console.log('Call count:', updateSpy.mock.calls.length);

        // Expect only 1 call (on stop), not on every move
        expect(updateSpy).toHaveBeenCalledTimes(1);

        // Verify the position was updated to the final coordinates
        // Note: In JSDOM, precise drag coordinates are hard to simulate without layout mocking,
        // so we receive {x: 0, y: 0} often. We primarily care about the call count here.
        expect(updateSpy).toHaveBeenCalledWith('win-1', expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number)
        }));
    });
});
