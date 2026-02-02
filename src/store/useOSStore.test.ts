import { describe, it, expect, beforeEach } from 'vitest';
import { useOSStore } from './useOSStore';

describe('useOSStore', () => {
    beforeEach(() => {
        useOSStore.setState({
            windows: [],
            activeWindowId: null,
            bootState: 'desktop'
        });
    });

    it('opens a new window and focuses it', () => {
        useOSStore.getState().openWindow('terminal', 'Terminal');

        const state = useOSStore.getState();
        expect(state.windows).toHaveLength(1);
        expect(state.windows[0].appType).toBe('terminal');
        expect(state.activeWindowId).toBe(state.windows[0].id);
        expect(state.windows[0].isMinimized).toBe(false);
    });

    it('does not duplicate window if already open', () => {
        useOSStore.getState().openWindow('terminal', 'Terminal');
        const firstId = useOSStore.getState().windows[0].id;

        useOSStore.getState().openWindow('terminal', 'Terminal');

        const state = useOSStore.getState();
        expect(state.windows).toHaveLength(1);
        expect(state.activeWindowId).toBe(firstId);
    });

    it('closes a window', () => {
        useOSStore.getState().openWindow('terminal', 'Terminal');
        const id = useOSStore.getState().windows[0].id;

        useOSStore.getState().closeWindow(id);

        const state = useOSStore.getState();
        expect(state.windows).toHaveLength(0);
        expect(state.activeWindowId).toBe(null);
    });

    it('focuses a window and updates z-index', () => {
        // Open two windows
        useOSStore.getState().openWindow('terminal', 'Terminal');
        useOSStore.getState().openWindow('about', 'About');

        const stateAfterOpen = useOSStore.getState();
        const terminalWin = stateAfterOpen.windows.find(w => w.appType === 'terminal')!;
        const aboutWin = stateAfterOpen.windows.find(w => w.appType === 'about')!;

        // Initially, the last opened (About) should be focused and have higher z-index
        expect(stateAfterOpen.activeWindowId).toBe(aboutWin.id);
        expect(aboutWin.zIndex).toBeGreaterThan(terminalWin.zIndex);

        // Focus the first window (Terminal)
        useOSStore.getState().focusWindow(terminalWin.id);

        const stateAfterFocus = useOSStore.getState();
        const terminalWinAfter = stateAfterFocus.windows.find(w => w.appType === 'terminal')!;
        const aboutWinAfter = stateAfterFocus.windows.find(w => w.appType === 'about')!;

        expect(stateAfterFocus.activeWindowId).toBe(terminalWin.id);
        expect(terminalWinAfter.zIndex).toBeGreaterThan(aboutWinAfter.zIndex);
    });

    it('minimizes and restores a window', () => {
        useOSStore.getState().openWindow('terminal', 'Terminal');
        const id = useOSStore.getState().windows[0].id;

        // Minimize
        useOSStore.getState().minimizeWindow(id);
        expect(useOSStore.getState().windows[0].isMinimized).toBe(true);
        expect(useOSStore.getState().activeWindowId).toBe(null);

        // Restore
        useOSStore.getState().restoreWindow(id);
        expect(useOSStore.getState().windows[0].isMinimized).toBe(false);
        expect(useOSStore.getState().activeWindowId).toBe(id);
    });
});
