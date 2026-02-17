import { FileText, Folder, Lock } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { FileSystemItem } from '../../types/os';
import React, { memo } from 'react';

export interface DesktopIconProps {
    item: FileSystemItem;
    onIconClick: (item: FileSystemItem) => void;
    onIconContextMenu?: (e: React.MouseEvent, item: FileSystemItem) => void;
    isRenaming?: boolean;
    renameValue?: string;
    onRenameChange?: (value: string) => void;
    onRenameSubmit?: () => void;
    onRenameCancel?: () => void;
}

const DesktopIconComponent = ({ item, onIconClick, onIconContextMenu, isRenaming, renameValue, onRenameChange, onRenameSubmit, onRenameCancel }: DesktopIconProps) => {
    const isMobile = useIsMobile();

    const handleAction = () => {
        if (isRenaming) return;
        onIconClick(item);
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
                if (onIconContextMenu) {
                    e.preventDefault();
                    e.stopPropagation();
                    onIconContextMenu(e, item);
                }
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors group w-24 text-center cursor-default ${isRenaming ? '' : 'hover:bg-white/10 hover:backdrop-blur-sm'}`}
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
            {isRenaming ? (
                <div className="w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => onRenameChange?.(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onRenameSubmit?.();
                            if (e.key === 'Escape') onRenameCancel?.();
                        }}
                        onBlur={onRenameSubmit}
                        className="text-xs text-center text-white bg-ubuntu-orange/80 border border-white/50 rounded-lg px-2 py-0.5 w-full outline-none focus:ring-1 focus:ring-white shadow-lg"
                        autoFocus
                        onFocus={(e) => e.target.select()}
                    />
                </div>
            ) : (
                <span className="text-white text-xs font-ubuntu drop-shadow-md bg-black/30 px-2 py-0.5 rounded-lg break-words line-clamp-2 w-full">{item.name}</span>
            )}
        </button>
    );
};

export const DesktopIcon = memo(DesktopIconComponent);
