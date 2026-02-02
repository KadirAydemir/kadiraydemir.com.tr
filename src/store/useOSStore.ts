import { create } from 'zustand';
import { OSState, WindowState, AppType, BootState } from '../types/os';

const DEFAULT_WINDOW_SIZE = { width: 800, height: 600 };
const START_Z_INDEX = 10;

export const useOSStore = create<OSState>((set, get) => ({
    bootState: 'off',
    windows: [],
    activeWindowId: null,
    cookieConsent: localStorage.getItem('cookie-consent') === 'true' ? true :
        localStorage.getItem('cookie-consent') === 'false' ? false : null,

    setBootState: (state: BootState) => set({ bootState: state }),

    setCookieConsent: (consent: boolean) => {
        localStorage.setItem('cookie-consent', consent.toString());
        set({ cookieConsent: consent });
    },

    openWindow: (appType: AppType, title: string) => {
        const { windows } = get();
        // Check if app is already open
        const existingWindow = windows.find((w) => w.appType === appType);
        if (existingWindow) {
            get().focusWindow(existingWindow.id);
            if (existingWindow.isMinimized) {
                get().restoreWindow(existingWindow.id);
            }
            return;
        }

        const newWindow: WindowState = {
            id: crypto.randomUUID(),
            appType,
            title,
            isMinimized: false,
            isMaximized: false,
            zIndex: START_Z_INDEX + windows.length + 1,
            position: { x: 100 + (windows.length * 30), y: 60 + (windows.length * 30) }, // Moved further right and down
            size: DEFAULT_WINDOW_SIZE,
        };

        set({
            windows: [...windows, newWindow],
            activeWindowId: newWindow.id,
        });

        // Ensure newly opened window is focused and has highest z-index
        get().focusWindow(newWindow.id);
    },

    closeWindow: (id: string) => {
        set((state) => ({
            windows: state.windows.filter((w) => w.id !== id),
            activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
        }));
    },

    focusWindow: (id: string) => {
        set((state) => {
            const targetWindow = state.windows.find(w => w.id === id);
            if (!targetWindow) return state;

            // Sort existing windows by zIndex to maintain relative order
            const otherWindows = state.windows
                .filter(w => w.id !== id)
                .sort((a, b) => a.zIndex - b.zIndex);

            // Re-assign z-indices starting from START_Z_INDEX
            const reindexedWindows = otherWindows.map((w, idx) => ({
                ...w,
                zIndex: START_Z_INDEX + idx
            }));

            // Active window gets the highest z-index
            const focusedWindow = {
                ...targetWindow,
                zIndex: START_Z_INDEX + reindexedWindows.length
            };

            return {
                activeWindowId: id,
                windows: [...reindexedWindows, focusedWindow]
            };
        });
    },

    minimizeWindow: (id: string) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === id ? { ...w, isMinimized: true } : w
            ),
            activeWindowId: null, // Deselect active window
        }));
    },

    maximizeWindow: (id: string) => {
        get().focusWindow(id);
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === id ? { ...w, isMaximized: true } : w
            ),
        }));
    },

    restoreWindow: (id: string) => {
        get().focusWindow(id);
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === id ? { ...w, isMinimized: false, isMaximized: false } : w
            ),
        }));
    },

    toggleWindow: (appType: AppType, title: string) => {
        const { windows, activeWindowId } = get();
        const existingWindow = windows.find((w) => w.appType === appType);

        if (existingWindow) {
            if (activeWindowId === existingWindow.id && !existingWindow.isMinimized) {
                get().minimizeWindow(existingWindow.id);
            } else {
                get().focusWindow(existingWindow.id);
                if (existingWindow.isMinimized) {
                    get().restoreWindow(existingWindow.id);
                }
            }
        } else {
            get().openWindow(appType, title);
        }
    },

    updateWindowPosition: (id: string, position: { x: number; y: number }) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === id ? { ...w, position } : w
            ),
        }));
    },

    deselectAll: () => {
        set({ activeWindowId: null });
    },
}));
