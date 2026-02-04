import { FileText, Folder, Github, Trash2, Plus, FilePlus, FolderPlus, Lock, FolderOpen, Edit2, Trash, RotateCcw } from 'lucide-react';
import { useProcess } from '../../hooks/useProcess';
import { useTranslation } from 'react-i18next';
import backgroundImage from '../../assets/wallpapers/ubuntu-bg.png';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

import { useOSStore } from '../../store/useOSStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';
import { FileSystemItem } from '../../types/os';

interface DesktopIconProps {
    item: FileSystemItem;
    onClick: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

const DesktopIcon = ({ item, onClick, onContextMenu }: DesktopIconProps) => {
    const isMobile = useIsMobile();

    const handleAction = () => {
        onClick();
    };

    const getIcon = () => {
        if (item.type === 'folder') return <Folder size={32} />;
        if (item.extension === 'pdf') return <FileText size={32} />;
        if (item.extension === 'txt') return <FileText size={32} />;
        return <FileText size={32} />;
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (isMobile) handleAction();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isMobile) handleAction();
            }}
            onContextMenu={(e) => {
                if (onContextMenu) {
                    e.preventDefault();
                    e.stopPropagation();
                    onContextMenu(e);
                }
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm transition-colors group w-24 text-center cursor-default"
        >
            <div className={`p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform relative ${item.type === 'folder' ? 'bg-ubuntu-orange/90' : 'bg-gray-600/90'}`}>
                <div className="text-white">
                    {getIcon()}
                </div>
                {item.isSystem && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                        <Lock size={10} className="text-gray-400" />
                    </div>
                )}
            </div>
            <span className="text-white text-xs font-ubuntu drop-shadow-md bg-black/30 px-2 py-0.5 rounded-lg break-words line-clamp-2 w-full">{item.name}</span>
        </button>
    );
};

export const Desktop = () => {
    const { openCV, openExplorer, openWindow } = useProcess();
    const { deselectAll, fileSystem, createItem, deleteItem, renameItem, restoreItem, emptyTrash } = useOSStore();
    const { t } = useTranslation();
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean }>({ x: 0, y: 0, isOpen: false });
    const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);

    const desktopFolder = fileSystem.children?.find(item => item.id === 'desktop');
    const desktopItems = desktopFolder?.children || [];

    const handleContextMenu = (e: React.MouseEvent, item?: FileSystemItem) => {
        e.preventDefault();
        e.stopPropagation();
        if (item) setSelectedItem(item);
        else setSelectedItem(null);
        setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true });
    };

    const handleItemClick = (item: FileSystemItem) => {
        if (item.type === 'folder') {
            openExplorer({ path: ['home', 'desktop', item.id] });
        } else if (item.extension === 'pdf') {
            openCV();
        } else if (item.extension === 'txt') {
            openWindow('editor', item.name, { fileId: item.id });
        }
    };

    const menuItems: ContextMenuItem[] = (() => {
        const items: ContextMenuItem[] = [];

        if (selectedItem) {
            items.push({
                label: t('fileExplorer.open', 'Open'),
                icon: <FolderOpen size={16} />,
                onClick: () => handleItemClick(selectedItem)
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
            } else {
                if (selectedItem.originalParentId) {
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
                    label: selectedItem.originalParentId ? t('fileExplorer.deletePermanently', 'Delete Permanently') : t('fileExplorer.delete', 'Delete'),
                    icon: <Trash size={16} />,
                    divider: true,
                    danger: !selectedItem.isSystem,
                    disabled: selectedItem.isSystem,
                    onClick: () => {
                        if (selectedItem.isSystem) return;
                        if (selectedItem.originalParentId && !confirm(t('fileExplorer.confirmPermanentDelete', 'Are you sure you want to permanently delete this item?'))) return;
                        deleteItem(selectedItem.id);
                    }
                });
            }
        } else {
            items.push({
                label: t('desktop.newFolder', 'New Folder'),
                icon: <FolderPlus size={16} />,
                onClick: () => createItem('desktop', { name: 'New Folder', type: 'folder' })
            });
            items.push({
                label: t('desktop.newTextFile', 'New Text Document'),
                icon: <FilePlus size={16} />,
                onClick: () => createItem('desktop', { name: 'document.txt', type: 'file', extension: 'txt' })
            });
            items.push({
                label: t('desktop.openTerminal', 'Open in Terminal'),
                icon: <Plus size={16} />,
                divider: true,
                onClick: () => openWindow('terminal', 'Terminal', { path: ['home', 'desktop'] })
            });
        }
        return items;
    })();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-0 pt-10 pl-4 pr-4 pb-20 md:pl-16 md:pb-4 flex flex-col flex-wrap content-start items-start gap-4"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            onClick={deselectAll}
            onContextMenu={handleContextMenu}
        >
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* System / Canonical Icons - Always visible regardless of localStorage */}
            <DesktopIcon
                item={{ id: 'cv-pdf', name: 'Kadir_CV.pdf', type: 'file', extension: 'pdf', modified: '', isSystem: true }}
                onClick={openCV}
                onContextMenu={(e) => handleContextMenu(e, { id: 'cv-pdf', name: 'Kadir_CV.pdf', type: 'file', extension: 'pdf', modified: '', isSystem: true })}
            />

            <DesktopIcon
                item={{ id: 'projects', name: 'Projects', type: 'folder', modified: '', isSystem: true }}
                onClick={() => openExplorer({ path: ['home', 'desktop', 'projects'] })}
                onContextMenu={(e) => handleContextMenu(e, { id: 'projects', name: 'Projects', type: 'folder', modified: '', isSystem: true })}
            />

            {/* Dynamic Items from File System */}
            {desktopItems
                .filter(item => item.id !== 'cv-pdf' && item.id !== 'projects')
                .map(item => (
                    <DesktopIcon
                        key={item.id}
                        item={item}
                        onClick={() => handleItemClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                    />
                ))}

            {/* Trash icon - Positioned at the bottom right */}
            <div className="absolute bottom-24 right-4 md:bottom-10 md:right-10">
                <button
                    onClick={(e) => { e.stopPropagation(); openExplorer({ path: ['home', 'trash'] }); }}
                    onContextMenu={(e) => handleContextMenu(e, { id: 'trash', name: t('apps.trash'), type: 'folder', modified: '', isSystem: true })}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm transition-colors group w-24 text-center cursor-default"
                >
                    <div className="p-3 bg-gray-500/80 rounded-xl shadow-lg group-hover:scale-105 transition-transform text-white">
                        <Trash2 size={32} />
                    </div>
                    <span className="text-white text-xs font-ubuntu drop-shadow-md bg-black/30 px-2 py-0.5 rounded-lg break-words line-clamp-2 w-full">{t('apps.trash')}</span>
                </button>
            </div>

            <ContextMenu
                isOpen={contextMenu.isOpen}
                x={contextMenu.x}
                y={contextMenu.y}
                items={menuItems}
                onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
            />
        </motion.div>
    );
};
