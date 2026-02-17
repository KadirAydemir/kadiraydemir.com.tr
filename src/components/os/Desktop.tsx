import { Github, Trash2, Plus, FilePlus, FolderPlus, FolderOpen, Edit2, Trash, RotateCcw } from 'lucide-react';
import { useProcess } from '../../hooks/useProcess';
import { useTranslation } from 'react-i18next';
import backgroundImage from '../../assets/wallpapers/ubuntu-bg.png';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

import { useOSStore } from '../../store/useOSStore';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';
import { FileSystemItem } from '../../types/os';
import { DesktopIcon } from './DesktopIcon';

const CV_ITEM: FileSystemItem = { id: 'cv-pdf', name: 'Kadir_CV.pdf', type: 'file', extension: 'pdf', modified: '', isSystem: true };
const PROJECTS_ITEM: FileSystemItem = { id: 'projects', name: 'Projects', type: 'folder', modified: '', isSystem: true };

export const Desktop = () => {
    const { openCV, openExplorer, openWindow } = useProcess();
    const { deselectAll, fileSystem, createItem, deleteItem, renameItem, restoreItem, emptyTrash, showConfirm, showPrompt } = useOSStore();
    const { t } = useTranslation();
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean }>({ x: 0, y: 0, isOpen: false });
    const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');


    const desktopFolder = fileSystem.children?.find(item => item.id === 'desktop');
    const desktopItems = desktopFolder?.children || [];

    const handleContextMenu = useCallback((e: React.MouseEvent, item?: FileSystemItem) => {
        e.preventDefault();
        e.stopPropagation();
        if (item) setSelectedItem(item);
        else setSelectedItem(null);
        setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true });
    }, []);

    const handleItemClick = useCallback((item: FileSystemItem) => {
        if (renamingId) return;
        if (item.type === 'folder') {
            openExplorer({ path: ['home', 'desktop', item.id] });
        } else if (item.extension === 'pdf') {
            openCV();
        } else if (item.extension === 'txt') {
            openWindow('editor', item.name, { fileId: item.id });
        }
    }, [renamingId, openExplorer, openCV, openWindow]);

    const handleRenameSubmit = useCallback(async () => {
        if (selectedItem && renameValue.trim()) {
            let newName = renameValue.trim();

            if (selectedItem.extension === 'txt' && !newName.toLowerCase().endsWith('.txt')) {
                newName += '.txt';
            }

            if (newName !== selectedItem.name) {
                await renameItem(selectedItem.id, newName);
            }
        }
        setRenamingId(null);
    }, [selectedItem, renameValue, renameItem]);

    const handleRenameCancel = useCallback(() => {
        setRenamingId(null);
    }, []);


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
                        setRenamingId(selectedItem.id);
                        setRenameValue(selectedItem.name);
                    }
                });


                items.push({
                    label: selectedItem.originalParentId ? t('fileExplorer.deletePermanently', 'Delete Permanently') : t('fileExplorer.delete', 'Delete'),
                    icon: <Trash size={16} />,
                    divider: true,
                    danger: !selectedItem.isSystem,
                    disabled: selectedItem.isSystem,
                    onClick: async () => {
                        if (selectedItem.isSystem) return;
                        if (selectedItem.originalParentId) {
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
                item={CV_ITEM}
                onIconClick={handleItemClick}
                onIconContextMenu={handleContextMenu}
                isRenaming={renamingId === 'cv-pdf'}
                renameValue={renamingId === 'cv-pdf' ? renameValue : undefined}
                onRenameChange={renamingId === 'cv-pdf' ? setRenameValue : undefined}
                onRenameSubmit={renamingId === 'cv-pdf' ? handleRenameSubmit : undefined}
                onRenameCancel={renamingId === 'cv-pdf' ? handleRenameCancel : undefined}
            />

            <DesktopIcon
                item={PROJECTS_ITEM}
                onIconClick={handleItemClick}
                onIconContextMenu={handleContextMenu}
                isRenaming={renamingId === 'projects'}
                renameValue={renamingId === 'projects' ? renameValue : undefined}
                onRenameChange={renamingId === 'projects' ? setRenameValue : undefined}
                onRenameSubmit={renamingId === 'projects' ? handleRenameSubmit : undefined}
                onRenameCancel={renamingId === 'projects' ? handleRenameCancel : undefined}
            />


            {/* Dynamic Items from File System */}
            {desktopItems
                .filter(item => item.id !== 'cv-pdf' && item.id !== 'projects')
                .map(item => (
                    <DesktopIcon
                        key={item.id}
                        item={item}
                        onIconClick={handleItemClick}
                        onIconContextMenu={handleContextMenu}
                        isRenaming={renamingId === item.id}
                        renameValue={renamingId === item.id ? renameValue : undefined}
                        onRenameChange={renamingId === item.id ? setRenameValue : undefined}
                        onRenameSubmit={renamingId === item.id ? handleRenameSubmit : undefined}
                        onRenameCancel={renamingId === item.id ? handleRenameCancel : undefined}
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
