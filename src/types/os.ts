export type BootState = 'off' | 'booting' | 'login' | 'desktop';

export type AppType = 'cv' | 'terminal' | 'settings' | 'browser' | 'explorer' | 'mail' | 'minesweeper' | 'sudoku' | 'htop' | 'about' | 'projects' | 'editor';

export interface FileSystemItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    extension?: string;
    size?: string;
    modified: string;
    children?: FileSystemItem[];
    content?: string;
    url?: string;
    isSystem?: boolean;
    originalParentId?: string;
}

export interface WindowState {
    id: string;
    appType: AppType;
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    params?: any;
}

export interface OSState {
    bootState: BootState;
    windows: WindowState[];
    activeWindowId: string | null;
    cookieConsent: boolean | null;
    fileSystem: FileSystemItem;

    setBootState: (state: BootState) => void;
    setCookieConsent: (consent: boolean) => void;
    openWindow: (appType: AppType, title: string, params?: any) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    toggleWindow: (appType: AppType, title: string) => void;
    updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
    deselectAll: () => void;

    // File System Actions
    createItem: (parentId: string, item: Partial<FileSystemItem>) => void;
    deleteItem: (id: string) => void;
    restoreItem: (id: string) => void;
    emptyTrash: () => void;
    updateFileContent: (id: string, content: string) => void;
    renameItem: (id: string, newName: string) => void;
}
