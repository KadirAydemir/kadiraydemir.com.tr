import { create } from 'zustand';
import { OSState, WindowState, AppType, BootState } from '../types/os';

const DEFAULT_WINDOW_SIZE = { width: 800, height: 600 };
const START_Z_INDEX = 10;

export const useOSStore = create<OSState>((set, get) => ({
    bootState: 'off',
    windows: [],
    activeWindowId: null,

    setBootState: (state: BootState) => set({ bootState: state }),

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

        const maxZIndex = windows.reduce((max, w) => Math.max(max, w.zIndex), START_Z_INDEX);

        const newWindow: WindowState = {
            id: crypto.randomUUID(),
            appType,
            title,
            isMinimized: false,
            isMaximized: false,
            zIndex: maxZIndex + 1,
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

            // Find current max zIndex
            const maxZIndex = state.windows.reduce((max, w) => Math.max(max, w.zIndex), START_Z_INDEX);

            // Optimization: If already active and on top, do nothing
            if (state.activeWindowId === id && targetWindow.zIndex === maxZIndex) {
                return state;
            }

            const newZIndex = maxZIndex + 1;

            return {
                activeWindowId: id,
                windows: state.windows.map(w => w.id === id ? { ...w, zIndex: newZIndex } : w)
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
