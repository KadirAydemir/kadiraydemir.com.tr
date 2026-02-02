export type BootState = 'off' | 'booting' | 'login' | 'desktop';

export type AppType = 'cv' | 'terminal' | 'settings' | 'browser' | 'explorer' | 'mail' | 'minesweeper' | 'sudoku' | 'htop' | 'about';

export interface WindowState {
    id: string;
    appType: AppType;
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

export interface OSState {
    bootState: BootState;
    windows: WindowState[];
    activeWindowId: string | null;
    cookieConsent: boolean | null;

    setBootState: (state: BootState) => void;
    setCookieConsent: (consent: boolean) => void;
    openWindow: (appType: AppType, title: string) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    toggleWindow: (appType: AppType, title: string) => void;
    updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
    deselectAll: () => void;
}
