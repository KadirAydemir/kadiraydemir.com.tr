import { Folder, File, ChevronRight, Home, HardDrive, Monitor, Image, FileText, Code, Music, Video, FolderOpen, ArrowLeft, ArrowRight, RotateCcw, Github, Trash2, FilePlus, FolderPlus, Plus, Edit2, Trash, Lock, Terminal } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProcess } from '../../hooks/useProcess';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useOSStore } from '../../store/useOSStore';
import { FileSystemItem } from '../../types/os';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';

const getFileIcon = (extension?: string) => {
    switch (extension) {
        case 'url':
            return <Github size={20} className="text-gray-900" />;
        case 'pdf':
            return <FileText size={20} className="text-red-500" />;
        case 'txt':
        case 'md':
            return <FileText size={20} className="text-gray-500" />;
        case 'ts':
        case 'tsx':
        case 'js':
        case 'jsx':
        case 'json':
            return <Code size={20} className="text-blue-500" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return <Image size={20} className="text-purple-500" />;
        case 'mp3':
        case 'wav':
            return <Music size={20} className="text-green-500" />;
        case 'mp4':
        case 'avi':
        case 'mkv':
            return <Video size={20} className="text-pink-500" />;
        default:
            return <File size={20} className="text-gray-400" />;
    }
};

const quickAccess = [
    { id: 'home', name: 'Home', icon: <Home size={18} /> },
    { id: 'desktop', name: 'Desktop', icon: <Monitor size={18} /> },
    { id: 'documents', name: 'Documents', icon: <Folder size={18} /> },
    { id: 'projects', name: 'Projects', icon: <Folder size={18} /> },
    { id: 'downloads', name: 'Downloads', icon: <Folder size={18} /> },
    { id: 'trash', name: 'Trash', icon: <Trash2 size={18} /> },
];

const drives = [
    { id: 'root', name: 'Computer', icon: <HardDrive size={18} />, size: '256 GB' },
];

interface FileExplorerProps {
    initialPath?: string[];
}

export const FileExplorerApp = ({ initialPath }: FileExplorerProps) => {
    const { t } = useTranslation();
    const { openCV, openWindow } = useProcess();
    const { fileSystem, createItem, deleteItem, renameItem, restoreItem, emptyTrash } = useOSStore();
    const [currentPath, setCurrentPath] = useState<string[]>(initialPath || ['home']);
    const [githubFiles, setGithubFiles] = useState<FileSystemItem[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean }>({ x: 0, y: 0, isOpen: false });
    const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);

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

    const goUp = () => {
        if (currentPath.length > 1) {
            navigateTo(currentPath.slice(0, -1));
        }
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

    const handleQuickAccess = (id: string) => {
        if (id === 'projects') {
            navigateTo(['home', 'desktop', 'projects']);
        } else {
            navigateTo(['home', ...(id === 'home' ? [] : [id])]);
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
    const isMobile = useIsMobile();

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
                    const newName = prompt('Enter new name:', selectedItem.name);
                    if (newName) renameItem(selectedItem.id, newName);
                }
            });

            items.push({
                label: isInTrash ? t('fileExplorer.deletePermanently', 'Delete Permanently') : t('fileExplorer.delete', 'Delete'),
                icon: <Trash size={16} />,
                divider: true,
                danger: !selectedItem.isSystem,
                disabled: selectedItem.isSystem,
                onClick: () => {
                    if (selectedItem.isSystem) return;
                    if (isInTrash && !confirm(t('fileExplorer.confirmPermanentDelete', 'Are you sure you want to permanently delete this item?'))) return;
                    deleteItem(selectedItem.id);
                }
            });

            if (selectedItem.id === 'trash') {
                items.push({
                    label: t('fileExplorer.emptyTrash', 'Empty Trash'),
                    icon: <Trash2 size={16} />,
                    danger: true,
                    onClick: () => {
                        if (confirm(t('fileExplorer.confirmEmptyTrash', 'Are you sure you want to empty the trash?'))) {
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
                    onClick: () => {
                        if (confirm(t('fileExplorer.confirmEmptyTrash', 'Are you sure you want to empty the trash?'))) {
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
            <div className="bg-gray-100 border-b border-gray-200 p-2 flex items-center gap-2">
                <button
                    onClick={goBack}
                    disabled={historyIndex === 0}
                    className={`p-2 rounded-lg transition-colors ${historyIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                    <ArrowLeft size={18} />
                </button>
                <button
                    onClick={goForward}
                    disabled={historyIndex === history.length - 1}
                    className={`p-2 rounded-lg transition-colors ${historyIndex === history.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                    <ArrowRight size={18} />
                </button>

                <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1.5 border border-gray-200 min-w-0">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className="flex items-center min-w-0">
                            {index > 0 && <ChevronRight size={14} className="text-gray-400 mx-1 flex-shrink-0" />}
                            <button
                                onClick={() => navigateTo(crumb.path)}
                                className="hover:bg-gray-100 px-2 py-0.5 rounded text-sm font-medium text-gray-700 hover:text-ubuntu-orange transition-colors truncate"
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-52 bg-gray-50 border-r border-gray-200 p-3 overflow-y-auto flex-shrink-0">
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            {t('fileExplorer.quickAccess')}
                        </h3>
                        <div className="space-y-0.5">
                            {quickAccess.map((item) => {
                                const isActive = currentPath[currentPath.length - 1] === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleQuickAccess(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors text-sm ${isActive ? 'bg-ubuntu-orange/10 text-ubuntu-orange font-medium' : ''
                                            }`}
                                    >
                                        <span className="flex-shrink-0">{item.icon}</span>
                                        <span className="truncate">{t(`fileExplorer.folders.${item.id}`, item.name)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            {t('fileExplorer.devices')}
                        </h3>
                        <div className="space-y-0.5">
                            {drives.map((drive) => (
                                <button
                                    key={drive.id}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                                >
                                    <span className="flex-shrink-0">{drive.icon}</span>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="truncate">{drive.name}</div>
                                        <div className="text-xs text-gray-500">{drive.size}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4" onContextMenu={(e) => handleContextMenu(e)}>
                        {folderItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FolderOpen size={64} className="mb-4 opacity-20" />
                                <p className="text-lg">{t('fileExplorer.emptyFolder')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
                                {folderItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem(item);
                                            if (isMobile) handleDoubleClick(item);
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (!isMobile) handleDoubleClick(item);
                                        }}
                                        onContextMenu={(e) => handleContextMenu(e, item)}
                                        className={`flex flex-col items-center p-3 rounded-lg transition-all cursor-default hover:bg-gray-100 ${selectedItem?.id === item.id ? 'bg-ubuntu-orange/10 ring-1 ring-ubuntu-orange' : ''
                                            }`}
                                    >
                                        <div className="mb-2">
                                            {item.type === 'folder' ? (
                                                <Folder size={48} className="text-ubuntu-orange fill-ubuntu-orange/20" />
                                            ) : (
                                                <div className="w-12 h-12 flex items-center justify-center">
                                                    {getFileIcon(item.extension)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative w-full flex flex-col items-center">
                                            <span className="text-xs text-center text-gray-700 line-clamp-2 w-full break-all">
                                                {item.name}
                                            </span>
                                            {item.isSystem && (
                                                <div className="absolute -top-10 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                                                    <Lock size={10} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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
