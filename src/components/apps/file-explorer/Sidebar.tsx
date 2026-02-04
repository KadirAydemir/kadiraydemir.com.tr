import { Home, Monitor, Folder, Trash2, HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

interface SidebarProps {
    currentPath: string[];
    onNavigate: (path: string[]) => void;
}

export const Sidebar = ({ currentPath, onNavigate }: SidebarProps) => {
    const { t } = useTranslation();

    const handleQuickAccess = (id: string) => {
        if (id === 'projects') {
            onNavigate(['home', 'desktop', 'projects']);
        } else {
            onNavigate(['home', ...(id === 'home' ? [] : [id])]);
        }
    };

    return (
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
    );
};
