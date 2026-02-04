import { FolderOpen, RotateCcw, Trash2, Edit2, Trash, FolderPlus, FilePlus, Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProcess } from '../../hooks/useProcess';
import { useOSStore } from '../../store/useOSStore';
import { FileSystemItem } from '../../types/os';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';
import { Sidebar } from './file-explorer/Sidebar';
import { FileGrid } from './file-explorer/FileGrid';
import { Navigation } from './file-explorer/Navigation';

interface FileExplorerProps {
    initialPath?: string[];
}

export const FileExplorerApp = ({ initialPath }: FileExplorerProps) => {
    const { t } = useTranslation();
    const { openCV, openWindow } = useProcess();
    const { fileSystem, createItem, deleteItem, renameItem, restoreItem, emptyTrash, showConfirm } = useOSStore();
    const [currentPath, setCurrentPath] = useState<string[]>(initialPath || ['home']);
    const [githubFiles, setGithubFiles] = useState<FileSystemItem[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean }>({ x: 0, y: 0, isOpen: false });
    const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    useEffect(() => {
        if (initialPath) {
            setCurrentPath(initialPath);
        }
    }, [initialPath]);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await fetch('https://api.github.com/users/kadiraydemir97/repos?sort=updated');
                if (response.ok) {
                    const data = await response.json();
                    const repoFiles: FileSystemItem[] = data.map((repo: any) => ({
                        id: repo.name,
                        name: repo.name,
                        type: 'file',
                        extension: 'url',
                        size: `${repo.stargazers_count} ★`,
                        modified: new Date(repo.updated_at).toISOString().split('T')[0],
                        url: repo.html_url
                    }));
                    setGithubFiles(repoFiles);
                }
            } catch (error) {
                console.error('Failed to fetch repos', error);
            }
        };
        fetchRepos();
    }, []);

    const [history, setHistory] = useState<string[][]>([['home']]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const navigateTo = (path: string[]) => {
        setCurrentPath(path);
        setSelectedItem(null);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(path);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const getCurrentFolder = (): FileSystemItem | null => {
        // Special case for projects folder - check the full path
        if (currentPath.join('/') === 'home/desktop/projects') {
            return {
                id: 'projects',
                name: 'Projects',
                type: 'folder',
                modified: new Date().toISOString().split('T')[0],
                children: githubFiles.length > 0 ? githubFiles : [
                    { id: 'loading', name: 'Loading...', type: 'file', size: '', modified: '' }
                ]
            };
        }

        let current: FileSystemItem | null = fileSystem;
        for (let i = 1; i < currentPath.length; i++) {
            const child: FileSystemItem | undefined = current?.children?.find((c: FileSystemItem) => c.id === currentPath[i]);
            if (child && child.type === 'folder') {
                current = child;
            } else {
                return null;
            }
        }
        return current;
    };

    const currentFolder = getCurrentFolder();
    const folderItems = currentFolder?.children || [];

    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCurrentPath(history[historyIndex - 1]);
            setSelectedItem(null);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCurrentPath(history[historyIndex + 1]);
            setSelectedItem(null);
        }
    };

    const handleRenameSubmit = async (id: string) => {
        if (renameValue.trim() && renameValue.trim() !== selectedItem?.name) {
            await renameItem(id, renameValue.trim());
        }
        setRenamingId(null);
    };

    const handleRenameCancel = () => {
        setRenamingId(null);
    };

    const handleDoubleClick = (item: FileSystemItem) => {
        if (item.type === 'folder') {
            navigateTo([...currentPath, item.id]);
        } else if (item.url) {
            window.open(item.url, '_blank');
        } else if (item.extension === 'pdf') {
            openCV();
        } else if (item.extension === 'txt') {
            openWindow('editor', item.name, { fileId: item.id });
        }
    };

    const getBreadcrumb = () => {
        const crumbs: { id: string; name: string; path: string[] }[] = [];
        let current: FileSystemItem | null = fileSystem;

        for (let i = 0; i < currentPath.length; i++) {
            const segment = currentPath[i];
            const path = currentPath.slice(0, i + 1);

            // Try to find the item in the filesystem tree to get its real name
            let child: FileSystemItem | undefined;
            if (i === 0) {
                child = fileSystem;
            } else if (current) {
                child = current.children?.find((c: FileSystemItem) => c.id === segment);
            }

            // Determine the name: Translation -> FileSystem Name -> Capitalized ID
            const translatedName = t(`fileExplorer.folders.${segment}`, '');
            const name = translatedName !== `fileExplorer.folders.${segment}` && translatedName !== ''
                ? translatedName
                : (child?.name || segment.charAt(0).toUpperCase() + segment.slice(1));

            crumbs.push({ id: segment, name, path });

            // Move deeper into the tree if possible
            if (child && child.type === 'folder') {
                current = child;
            } else {
                current = null;
            }
        }
        return crumbs;
    };

    const breadcrumbs = getBreadcrumb();

    const handleContextMenu = (e: React.MouseEvent, item?: FileSystemItem) => {
        e.preventDefault();
        e.stopPropagation();
        if (item) setSelectedItem(item);
        setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true });
    };

    const menuItems = (() => {
        const isInTrash = currentPath.includes('trash');
        const items: ContextMenuItem[] = [];

        if (selectedItem) {
            items.push({
                label: t('fileExplorer.open', 'Open'),
                icon: <FolderOpen size={16} />,
                onClick: () => handleDoubleClick(selectedItem)
            });

            if (selectedItem.type === 'folder') {
                items.push({
                    label: t('desktop.openTerminal', 'Open in Terminal'),
                    icon: <Terminal size={16} />,
                    onClick: () => {
                        const targetPath = [...currentPath, selectedItem.id];
                        openWindow('terminal', 'Terminal', { path: targetPath });
                    }
                });
            }

            if (isInTrash && selectedItem.originalParentId) {
                items.push({
                    label: t('fileExplorer.restore', 'Restore'),
                    icon: <RotateCcw size={16} />,
                    onClick: () => restoreItem(selectedItem.id)
                });
            }

            items.push({
                label: t('fileExplorer.rename', 'Rename'),
                icon: <Edit2 size={16} />,
                disabled: selectedItem.isSystem,
                onClick: () => {
                    if (selectedItem.isSystem) return;
                    setRenamingId(selectedItem.id);
                    setRenameValue(selectedItem.name);
                }
            });


            items.push({
                label: isInTrash ? t('fileExplorer.deletePermanently', 'Delete Permanently') : t('fileExplorer.delete', 'Delete'),
                icon: <Trash size={16} />,
                divider: true,
                danger: !selectedItem.isSystem,
                disabled: selectedItem.isSystem,
                onClick: async () => {
                    if (selectedItem.isSystem) return;
                    if (isInTrash) {
                        const confirmed = await showConfirm(
                            t('fileExplorer.deletePermanently', 'Delete Permanently'),
                            t('fileExplorer.confirmPermanentDelete', 'Are you sure you want to permanently delete this item?'),
                            t('fileExplorer.deletePermanently', 'Delete Permanently')
                        );
                        if (!confirmed) return;
                    }
                    deleteItem(selectedItem.id);
                }
            });

            if (selectedItem.id === 'trash') {
                items.push({
                    label: t('fileExplorer.emptyTrash', 'Empty Trash'),
                    icon: <Trash2 size={16} />,
                    danger: true,
                    onClick: async () => {
                        const confirmed = await showConfirm(
                            t('fileExplorer.emptyTrash', 'Empty Trash'),
                            t('fileExplorer.confirmEmptyTrash', 'Are you sure you want to empty the trash?')
                        );
                        if (confirmed) {
                            emptyTrash();
                        }
                    }
                });
            }
        } else {
            items.push({
                label: t('desktop.newFolder', 'New Folder'),
                icon: <FolderPlus size={16} />,
                onClick: () => {
                    const parentId = currentPath[currentPath.length - 1];
                    createItem(parentId, { name: 'New Folder', type: 'folder' });
                }
            });
            items.push({
                label: t('desktop.newTextFile', 'New Text Document'),
                icon: <FilePlus size={16} />,
                onClick: () => {
                    const parentId = currentPath[currentPath.length - 1];
                    createItem(parentId, { name: 'document.txt', type: 'file', extension: 'txt' });
                }
            });
            items.push({
                label: t('desktop.openTerminal', 'Open in Terminal'),
                icon: <Terminal size={16} />,
                onClick: () => {
                    openWindow('terminal', 'Terminal', { path: currentPath });
                }
            });

            if (isInTrash) {
                items.push({
                    label: t('fileExplorer.emptyTrash', 'Empty Trash'),
                    icon: <Trash2 size={16} />,
                    danger: true,
                    onClick: async () => {
                        const confirmed = await showConfirm(
                            t('fileExplorer.emptyTrash', 'Empty Trash'),
                            t('fileExplorer.confirmEmptyTrash', 'Are you sure you want to empty the trash?')
                        );
                        if (confirmed) {
                            emptyTrash();
                        }
                    }
                });
            }

            items.push({
                label: t('fileExplorer.refresh', 'Refresh'),
                icon: <RotateCcw size={16} />,
                divider: true,
                onClick: () => { }
            });
        }

        return items;
    })();

    return (
        <div className="w-full h-full bg-white text-gray-800 flex flex-col overflow-hidden"
            onClick={() => setSelectedItem(null)}
            onContextMenu={(e) => handleContextMenu(e)}>

            <Navigation
                canGoBack={historyIndex > 0}
                canGoForward={historyIndex < history.length - 1}
                onGoBack={goBack}
                onGoForward={goForward}
                breadcrumbs={breadcrumbs}
                onNavigate={navigateTo}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    currentPath={currentPath}
                    onNavigate={navigateTo}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <FileGrid
                        items={folderItems}
                        selectedItem={selectedItem}
                        onSelect={setSelectedItem}
                        onDoubleClick={handleDoubleClick}
                        onContextMenu={handleContextMenu}
                        renamingId={renamingId}
                        renameValue={renameValue}
                        onRenameChange={setRenameValue}
                        onRenameSubmit={handleRenameSubmit}
                        onRenameCancel={handleRenameCancel}
                    />

                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
                        <div>
                            {folderItems.length} {folderItems.length === 1 ? t('fileExplorer.item') : t('fileExplorer.items')}
                        </div>
                        {selectedItem && (
                            <div className="flex items-center gap-4">
                                <span>{selectedItem.name}</span>
                                {selectedItem.type === 'file' && selectedItem.size && (
                                    <span>{selectedItem.size}</span>
                                )}
                                {selectedItem.modified && (
                                    <span>{t('fileExplorer.modified')}: {selectedItem.modified}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ContextMenu
                isOpen={contextMenu.isOpen}
                x={contextMenu.x}
                y={contextMenu.y}
                items={menuItems}
                onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
            />
        </div>
    );
};
