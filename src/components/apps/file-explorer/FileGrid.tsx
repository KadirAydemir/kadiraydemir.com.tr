import { Folder, File, Code, Image, FileText, Music, Video, Github, Lock, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { FileSystemItem } from '../../../types/os';

interface FileGridProps {
    items: FileSystemItem[];
    selectedItem: FileSystemItem | null;
    onSelect: (item: FileSystemItem | null) => void;
    onDoubleClick: (item: FileSystemItem) => void;
    onContextMenu: (e: React.MouseEvent, item?: FileSystemItem) => void;
    renamingId: string | null;
    renameValue: string;
    onRenameChange: (val: string) => void;
    onRenameSubmit: (id: string) => void;
    onRenameCancel: () => void;
}

export const FileGrid = ({
    items, selectedItem, onSelect, onDoubleClick,
    onContextMenu, renamingId, renameValue,
    onRenameChange, onRenameSubmit, onRenameCancel
}: FileGridProps) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    if (items.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto p-4" onContextMenu={(e) => onContextMenu(e)}>
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FolderOpen size={64} className="mb-4 opacity-20" />
                    <p className="text-lg">{t('fileExplorer.emptyFolder')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4" onContextMenu={(e) => onContextMenu(e)}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(item);
                            if (isMobile) onDoubleClick(item);
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (!isMobile) onDoubleClick(item);
                        }}
                        onContextMenu={(e) => onContextMenu(e, item)}
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
                            {renamingId === item.id ? (
                                <div className="flex flex-col items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={renameValue}
                                        onChange={(e) => onRenameChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onRenameSubmit(item.id);
                                            if (e.key === 'Escape') onRenameCancel();
                                        }}
                                        onBlur={() => onRenameSubmit(item.id)}
                                        className="text-xs text-center text-gray-800 bg-white border border-ubuntu-orange rounded px-1 w-full outline-none"
                                        autoFocus
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            ) : (
                                <span className="text-xs text-center text-gray-700 line-clamp-2 w-full break-all">
                                    {item.name}
                                </span>
                            )}
                            {item.isSystem && (
                                <div className="absolute -top-10 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                                    <Lock size={10} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                    </button>
                ))}
            </div>
        </div>
    );
};

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
