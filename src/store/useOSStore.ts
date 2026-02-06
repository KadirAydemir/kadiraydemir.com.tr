import { create } from 'zustand';
import { OSState, WindowState, AppType, BootState, FileSystemItem } from '../types/os';

const DEFAULT_WINDOW_SIZE = { width: 800, height: 600 };
const START_Z_INDEX = 10;

const initialMockFileSystem: FileSystemItem = {
    id: 'home',
    name: 'Home',
    type: 'folder',
    modified: '2026-02-04',
    isSystem: true,
    children: [
        {
            id: 'desktop',
            name: 'Desktop',
            type: 'folder',
            modified: '2026-02-04',
            isSystem: true,
            children: [
                { id: 'cv-pdf', name: 'Kadir_CV.pdf', type: 'file', extension: 'pdf', size: '245 KB', modified: '2026-01-15', isSystem: true },
                { id: 'projects', name: 'Projects', type: 'folder', modified: '2026-02-04', isSystem: true, children: [] },
            ]
        },
        {
            id: 'documents',
            name: 'Documents',
            type: 'folder',
            modified: '2026-02-04',
            isSystem: true,
            children: [
                { id: 'notes', name: 'notes.txt', type: 'file', extension: 'txt', size: '12 KB', modified: '2026-01-10', content: 'Hello! This is a sample note.' },
            ]
        },
        {
            id: 'downloads',
            name: 'Downloads',
            type: 'folder',
            modified: '2026-02-04',
            isSystem: true,
            children: []
        },
        {
            id: 'trash',
            name: 'Trash',
            type: 'folder',
            modified: '2026-02-04',
            isSystem: true,
            children: []
        }
    ]
};

const migrateFileSystem = (saved: FileSystemItem, initial: FileSystemItem): FileSystemItem => {
    // Merge isSystem flag from initial into saved for matching IDs
    const migrateNode = (node: FileSystemItem): FileSystemItem => {
        const findInInitial = (id: string, searchNode: FileSystemItem): FileSystemItem | undefined => {
            if (searchNode.id === id) return searchNode;
            if (searchNode.children) {
                for (const child of searchNode.children) {
                    const found = findInInitial(id, child);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const initialNode = findInInitial(node.id, initial);
        const newNode = { ...node };
        if (initialNode?.isSystem) {
            newNode.isSystem = true;
        }

        if (newNode.children) {
            newNode.children = newNode.children.map(migrateNode);
        }

        return newNode;
    };

    return migrateNode(saved);
};

const safeStorage = {
    getItem: (key: string) => {
        try {
            return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
                ? localStorage.getItem(key)
                : null;
        } catch { return null; }
    },
    setItem: (key: string, value: string) => {
        try {
            if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
                localStorage.setItem(key, value);
            }
        } catch { /* ignore */ }
    }
};

const getInitialFileSystem = (): FileSystemItem => {
    const saved = safeStorage.getItem('os-file-system');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return migrateFileSystem(parsed, initialMockFileSystem);
        } catch (e) {
            console.error('Failed to parse saved file system', e);
        }
    }
    return initialMockFileSystem;
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const saveFileSystem = (fs: FileSystemItem) => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
        const save = () => {
            safeStorage.setItem('os-file-system', JSON.stringify(fs));
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(save);
        } else {
            save();
        }
    }, 1000);
};

export const useOSStore = create<OSState>((set, get) => ({
    bootState: 'off',
    windows: [],
    activeWindowId: null,
    cookieConsent: (() => {
        const val = safeStorage.getItem('cookie-consent');
        if (val === 'true') return true;
        if (val === 'false') return false;
        return null;
    })(),
    fileSystem: getInitialFileSystem(),

    dialog: null,

    setBootState: (state: BootState) => set({ bootState: state }),

    setCookieConsent: (consent: boolean) => {
        safeStorage.setItem('cookie-consent', consent.toString());
        set({ cookieConsent: consent });
    },

    showAlert: (title, message) => {
        return new Promise((resolve) => {
            set({
                dialog: {
                    type: 'alert',
                    title,
                    message,
                    resolve,
                }
            });
        });
    },

    showConfirm: (title, message, confirmLabel, cancelLabel) => {
        return new Promise((resolve) => {
            set({
                dialog: {
                    type: 'confirm',
                    title,
                    message,
                    confirmLabel,
                    cancelLabel,
                    resolve,
                }
            });
        });
    },

    showPrompt: (title, message, defaultValue) => {
        return new Promise((resolve) => {
            set({
                dialog: {
                    type: 'prompt',
                    title,
                    message,
                    defaultValue,
                    resolve,
                }
            });
        });
    },

    closeDialog: (value) => {
        const { dialog } = get();
        if (dialog) {
            dialog.resolve(value);
            set({ dialog: null });
        }
    },

    openWindow: (appType: AppType, title: string, params?: any) => {
        const { windows } = get();
        // Check if app is already open
        const existingWindow = windows.find((w) => w.appType === appType);

        // If it's the editor, we might want multiple instances if it's different files?
        // But for now, let's keep it simple: one editor instance per file maybe?
        // Actually, the current architecture seems to favor one instance.
        // If opening editor, check if title matches (usually title is the filename)
        if (appType === 'editor' && existingWindow && existingWindow.params?.fileId !== params?.fileId) {
            // If different file, we can either allow multiple editors or just update params.
            // Let's allow multiple for editor if they have different fileIds.
        } else if (existingWindow) {
            if (params) {
                set({
                    windows: windows.map(w => w.id === existingWindow.id ? { ...w, params } : w)
                });
            }
            get().focusWindow(existingWindow.id);
            if (existingWindow.isMinimized) {
                get().restoreWindow(existingWindow.id);
            }
            return;
        }

        const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

        const newWindow: WindowState = {
            id: crypto.randomUUID(),
            appType,
            title,
            isMinimized: false,
            isMaximized: isMobile,
            zIndex: START_Z_INDEX + windows.length + 1,
            position: { x: 100 + (windows.length * 30), y: 60 + (windows.length * 30) },
            size: DEFAULT_WINDOW_SIZE,
            params,
        };

        set({
            windows: [...windows, newWindow],
            activeWindowId: newWindow.id,
        });

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

            const otherWindows = state.windows
                .filter(w => w.id !== id)
                .sort((a, b) => a.zIndex - b.zIndex);

            const reindexedWindows = otherWindows.map((w, idx) => ({
                ...w,
                zIndex: START_Z_INDEX + idx
            }));

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
            activeWindowId: null,
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

    createItem: (parentId: string, item: Partial<FileSystemItem>) => {
        const { fileSystem } = get();

        // Helper to find parent node
        const findNode = (node: FileSystemItem, id: string): FileSystemItem | null => {
            if (node.id === id) return node;
            if (node.children) {
                for (const child of node.children) {
                    const found = findNode(child, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const parentFolder = findNode(fileSystem, parentId);
        if (!parentFolder || parentFolder.type !== 'folder') return;

        let finalName = item.name || (item.type === 'folder' ? 'New Folder' : 'New File');
        const children = parentFolder.children || [];
        const nameExists = (name: string) => children.some(c => c.name.toLowerCase() === name.toLowerCase());

        if (nameExists(finalName)) {
            const nameParts = finalName.split('.');
            let baseName = '';
            let extension = '';

            if (item.type === 'folder') {
                baseName = finalName;
            } else {
                if (nameParts.length > 1) {
                    extension = `.${nameParts.pop()}`;
                    baseName = nameParts.join('.');
                } else {
                    baseName = finalName;
                }
            }

            let counter = 1;
            while (nameExists(`${baseName}-${counter}${extension}`)) {
                counter++;
            }
            finalName = `${baseName}-${counter}${extension}`;
        }

        const newItem: FileSystemItem = {
            id: crypto.randomUUID(),
            type: item.type || 'file',
            modified: new Date().toISOString().split('T')[0],
            extension: item.extension,
            size: item.type === 'folder' ? undefined : '0 KB',
            children: item.type === 'folder' ? [] : undefined,
            content: item.content || '',
            ...item,
            name: finalName, // Ensure finalName is used and overrides item.name
        };

        const updateTree = (node: FileSystemItem): FileSystemItem => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [...(node.children || []), newItem]
                };
            }
            if (node.children) {
                let hasChanges = false;
                const newChildren = node.children.map(child => {
                    const updated = updateTree(child);
                    if (updated !== child) hasChanges = true;
                    return updated;
                });

                if (hasChanges) {
                    return {
                        ...node,
                        children: newChildren
                    };
                }
            }
            return node;
        };

        const newFs = updateTree(fileSystem);
        set({ fileSystem: newFs });
        saveFileSystem(newFs);
    },

    deleteItem: async (id: string) => {
        const { fileSystem } = get();

        // Helper to find item 
        const findItem = (node: FileSystemItem, targetId: string): FileSystemItem | null => {
            if (node.id === targetId) return node;
            if (node.children) {
                for (const child of node.children) {
                    const found = findItem(child, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        // Helper to find parent of an item
        const findParent = (node: FileSystemItem, targetId: string): FileSystemItem | null => {
            if (node.children?.some(c => c.id === targetId)) return node;
            if (node.children) {
                for (const child of node.children) {
                    const found = findParent(child, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const itemToDelete = findItem(fileSystem, id);
        if (!itemToDelete) return;

        if (itemToDelete.isSystem) {
            await get().showAlert('System Error', 'This item is protected. Administrator privileges are required to delete system files.');
            return;
        }


        const parent = findParent(fileSystem, id);
        if (!parent) return;

        let newFs: FileSystemItem;

        if (parent.id === 'trash') {
            // Permanent delete if already in trash
            const removeFromTree = (node: FileSystemItem): FileSystemItem => {
                if (node.children) {
                    const filtered = node.children.filter(child => child.id !== id);
                    const removed = filtered.length !== node.children.length;

                    let hasChanges = false;
                    const newChildren = filtered.map(child => {
                        const updated = removeFromTree(child);
                        if (updated !== child) hasChanges = true;
                        return updated;
                    });

                    if (removed || hasChanges) {
                        return {
                            ...node,
                            children: newChildren
                        };
                    }
                }
                return node;
            };
            newFs = removeFromTree(fileSystem);
        } else {
            // Move to trash
            const itemToMove = { ...itemToDelete, originalParentId: parent.id };

            const moveInTree = (node: FileSystemItem): FileSystemItem => {
                // Remove from current parent
                if (node.id === parent.id) {
                    return {
                        ...node,
                        children: node.children?.filter(c => c.id !== id)
                    };
                }
                // Add to trash
                if (node.id === 'trash') {
                    return {
                        ...node,
                        children: [...(node.children || []), itemToMove]
                    };
                }
                // Recurse
                if (node.children) {
                    let hasChanges = false;
                    const newChildren = node.children.map(child => {
                        const updated = moveInTree(child);
                        if (updated !== child) hasChanges = true;
                        return updated;
                    });

                    if (hasChanges) {
                        return {
                            ...node,
                            children: newChildren
                        };
                    }
                }
                return node;
            };
            newFs = moveInTree(fileSystem);
        }

        set({ fileSystem: newFs });
        saveFileSystem(newFs);
    },

    restoreItem: (id: string) => {
        const { fileSystem } = get();

        const findItem = (node: FileSystemItem, targetId: string): FileSystemItem | null => {
            if (node.id === targetId) return node;
            if (node.children) {
                for (const child of node.children) {
                    const found = findItem(child, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const itemToRestore = findItem(fileSystem, id);
        if (!itemToRestore || !itemToRestore.originalParentId) return;

        const targetParentId = itemToRestore.originalParentId;

        const restoreInTree = (node: FileSystemItem): FileSystemItem => {
            // Remove from trash
            if (node.id === 'trash') {
                return {
                    ...node,
                    children: node.children?.filter(c => c.id !== id)
                };
            }
            // Add back to original parent
            if (node.id === targetParentId) {
                const itemWithoutOrigin = { ...itemToRestore };
                delete itemWithoutOrigin.originalParentId;
                return {
                    ...node,
                    children: [...(node.children || []), itemWithoutOrigin]
                };
            }
            // Recurse
            if (node.children) {
                let hasChanges = false;
                const newChildren = node.children.map(child => {
                    const updated = restoreInTree(child);
                    if (updated !== child) hasChanges = true;
                    return updated;
                });

                if (hasChanges) {
                    return {
                        ...node,
                        children: newChildren
                    };
                }
            }
            return node;
        };

        const newFs = restoreInTree(fileSystem);
        set({ fileSystem: newFs });
        saveFileSystem(newFs);
    },

    emptyTrash: () => {
        const { fileSystem } = get();

        const emptyTrashInTree = (node: FileSystemItem): FileSystemItem => {
            if (node.id === 'trash') {
                return {
                    ...node,
                    children: []
                };
            }
            if (node.children) {
                let hasChanges = false;
                const newChildren = node.children.map(child => {
                    const updated = emptyTrashInTree(child);
                    if (updated !== child) hasChanges = true;
                    return updated;
                });

                if (hasChanges) {
                    return {
                        ...node,
                        children: newChildren
                    };
                }
            }
            return node;
        };

        const newFs = emptyTrashInTree(fileSystem);
        set({ fileSystem: newFs });
        saveFileSystem(newFs);
    },

    updateFileContent: (id: string, content: string) => {
        const { fileSystem } = get();
        const updateTree = (node: FileSystemItem): FileSystemItem => {
            if (node.id === id) {
                return {
                    ...node,
                    content,
                    modified: new Date().toISOString().split('T')[0],
                    size: `${Math.round(content.length / 1024)} KB`
                };
            }
            if (node.children) {
                let hasChanges = false;
                const newChildren = node.children.map(child => {
                    const updated = updateTree(child);
                    if (updated !== child) hasChanges = true;
                    return updated;
                });

                if (hasChanges) {
                    return {
                        ...node,
                        children: newChildren
                    };
                }
            }
            return node;
        };

        const newFs = updateTree(fileSystem);
        set({ fileSystem: newFs });
        saveFileSystem(newFs);
    },

    renameItem: async (id: string, newName: string) => {
        const { fileSystem } = get();

        // Helper to find item and check if it's a system item
        const findAndCheckSystem = (node: FileSystemItem): boolean => {
            if (node.id === id) return !!node.isSystem;
            if (node.children) {
                for (const child of node.children) {
                    if (findAndCheckSystem(child)) return true;
                }
            }
            return false;
        };

        if (findAndCheckSystem(fileSystem)) {
            await get().showAlert('System Error', 'Administrator privileges are required to rename system files.');
            return;
        }


        // Helper to find parent and check for collision
        const findParentAndCheckCollision = (node: FileSystemItem): { parent: FileSystemItem | null, collision: boolean } => {
            if (!node.children) return { parent: null, collision: false };

            const targetChild = node.children.find(c => c.id === id);
            if (targetChild) {
                const collision = node.children.some(c => c.id !== id && c.name.toLowerCase() === newName.trim().toLowerCase());
                return { parent: node, collision };
            }

            for (const child of node.children) {
                const result = findParentAndCheckCollision(child);
                if (result.parent) return result;
            }

            return { parent: null, collision: false };
        };

        const { parent, collision } = findParentAndCheckCollision(fileSystem);

        if (collision) {
            await get().showAlert('Name Collision', 'A file or folder with this name already exists in this location.');
            return;
        }


        const updateTree = (node: FileSystemItem): FileSystemItem => {
            if (node.id === id) {
                return {
                    ...node,
                    name: newName.trim(),
                    modified: new Date().toISOString().split('T')[0]
                };
            }
            if (node.children) {
                let hasChanges = false;
                const newChildren = node.children.map(child => {
                    const updated = updateTree(child);
                    if (updated !== child) hasChanges = true;
                    return updated;
                });

                if (hasChanges) {
                    return {
                        ...node,
                        children: newChildren
                    };
                }
            }
            return node;
        };

        const newFs = updateTree(fileSystem);
        set({ fileSystem: newFs });
        saveFileSystem(newFs);
    },
}));
