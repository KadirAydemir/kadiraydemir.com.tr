import { Folder, File, ChevronRight, Home, HardDrive, Monitor, Image, FileText, Code, Music, Video, FolderOpen, ArrowLeft, ArrowRight, RotateCcw, Github } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProcess } from '../../hooks/useProcess';
import { useIsMobile } from '../../hooks/useIsMobile';

interface FileSystemItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    icon?: React.ReactNode;
    extension?: string;
    size?: string;
    modified?: string;
    children?: FileSystemItem[];
    url?: string;
}

// ... (keep getFileIcon lines 17-46) - wait, I'm replacing lines 6-146, so I need to include getFileIcon and mockFileSystem.

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

const mockFileSystem: FileSystemItem = {
    id: 'home',
    name: 'Home',
    type: 'folder',
    children: [
        {
            id: 'desktop',
            name: 'Desktop',
            type: 'folder',
            children: [
                { id: 'cv-pdf', name: 'Kadir_CV.pdf', type: 'file', extension: 'pdf', size: '245 KB', modified: '2026-01-15' },
                { id: 'projects', name: 'Projects', type: 'folder', children: [] } // This will be handled by the special case for projects
            ]
        },
        {
            id: 'documents',
            name: 'Documents',
            type: 'folder',
            children: [
                { id: 'notes', name: 'notes.txt', type: 'file', extension: 'txt', size: '12 KB', modified: '2026-01-10' },
            ]
        },
        {
            id: 'projects',
            name: 'Projects',
            type: 'folder',
            children: [
                {
                    id: 'web-os-portfolio', name: 'web-os-portfolio', type: 'folder', children: [
                        {
                            id: 'src', name: 'src', type: 'folder', children: [
                                { id: 'app-tsx', name: 'App.tsx', type: 'file', extension: 'tsx', size: '3 KB', modified: '2026-02-04' },
                                { id: 'main-tsx', name: 'main.tsx', type: 'file', extension: 'tsx', size: '1 KB', modified: '2026-02-04' },
                            ]
                        },
                        { id: 'package-json', name: 'package.json', type: 'file', extension: 'json', size: '2 KB', modified: '2026-02-04' },
                    ]
                },
            ]
        },
        {
            id: 'downloads',
            name: 'Downloads',
            type: 'folder',
            children: [
                { id: 'installer', name: 'vscode-installer.deb', type: 'file', extension: 'deb', size: '89 MB', modified: '2026-01-25' },
                { id: 'wallpaper', name: 'ubuntu-wallpaper.png', type: 'file', extension: 'png', size: '5 MB', modified: '2026-01-22' },
            ]
        },
        {
            id: 'music',
            name: 'Music',
            type: 'folder',
            children: [
                { id: 'song1', name: 'ambient-coding.mp3', type: 'file', extension: 'mp3', size: '8 MB', modified: '2025-12-15' },
            ]
        },
        {
            id: 'pictures',
            name: 'Pictures',
            type: 'folder',
            children: [
                {
                    id: 'screenshots', name: 'Screenshots', type: 'folder', children: [
                        { id: 'ss1', name: 'screenshot-2026-01-01.png', type: 'file', extension: 'png', size: '2 MB', modified: '2026-01-01' },
                    ]
                },
                { id: 'profile', name: 'profile.jpg', type: 'file', extension: 'jpg', size: '1 MB', modified: '2025-11-20' },
            ]
        },
        {
            id: 'videos',
            name: 'Videos',
            type: 'folder',
            children: [
                { id: 'demo', name: 'portfolio-demo.mp4', type: 'file', extension: 'mp4', size: '150 MB', modified: '2026-02-01' },
            ]
        }
    ]
};

const quickAccess = [
    { id: 'home', name: 'Home', icon: <Home size={18} /> },
    { id: 'desktop', name: 'Desktop', icon: <Monitor size={18} /> },
    { id: 'documents', name: 'Documents', icon: <Folder size={18} /> },
    { id: 'projects', name: 'Projects', icon: <Folder size={18} /> },
    { id: 'downloads', name: 'Downloads', icon: <Folder size={18} /> },
];

const drives = [
    { id: 'root', name: 'Computer', icon: <HardDrive size={18} />, size: '256 GB' },
];

interface FileExplorerProps {
    initialPath?: string[];
}

export const FileExplorerApp = ({ initialPath }: FileExplorerProps) => {
    const { t } = useTranslation();
    const { openCV } = useProcess();
    const [currentPath, setCurrentPath] = useState<string[]>(initialPath || ['home']);
    const [githubFiles, setGithubFiles] = useState<FileSystemItem[]>([]);

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

    const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
    const [history, setHistory] = useState<string[][]>([['home']]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Navigate to a folder by path array
    const navigateTo = (path: string[]) => {
        setCurrentPath(path);
        setSelectedItem(null);
        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(path);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Get current folder contents based on path
    const getCurrentFolder = (): FileSystemItem | null => {
        // Special case for projects folder
        if (currentPath.length === 2 && currentPath[0] === 'home' && currentPath[1] === 'projects') {
            return {
                id: 'projects',
                name: 'Projects',
                type: 'folder',
                children: githubFiles.length > 0 ? githubFiles : [
                    { id: 'loading', name: 'Loading...', type: 'file', size: '', modified: '' }
                ]
            };
        }

        let current: FileSystemItem | null = mockFileSystem;
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
    const items = currentFolder?.children || [];

    // Navigation functions
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

    // Handle double-click on item
    const handleDoubleClick = (item: FileSystemItem) => {
        if (item.type === 'folder') {
            if (item.id === 'projects' && currentPath.includes('desktop')) {
                navigateTo(['home', 'projects']);
            } else {
                navigateTo([...currentPath, item.id]);
            }
        } else if (item.url) {
            window.open(item.url, '_blank');
        } else {
            // Open file - for now just show CV if it's the CV file
            if (item.id === 'cv-pdf') {
                openCV();
            }
        }
    };

    // Handle quick access click
    const handleQuickAccess = (id: string) => {
        if (id === 'home') {
            navigateTo(['home']);
        } else if (id === 'projects') {
            navigateTo(['home', 'projects']);
        } else if (id === 'desktop') {
            navigateTo(['home', 'desktop']);
        } else if (id === 'documents') {
            navigateTo(['home', 'documents']);
        } else if (id === 'downloads') {
            navigateTo(['home', 'downloads']);
        }
    };

    // Build breadcrumb from path
    const getBreadcrumb = () => {
        const crumbs: { id: string; name: string; path: string[] }[] = [];
        let current: FileSystemItem | null = mockFileSystem;
        for (let i = 0; i < currentPath.length; i++) {
            if (i === 0) {
                crumbs.push({ id: 'home', name: 'Home', path: ['home'] });
            } else {
                const child: FileSystemItem | undefined = current?.children?.find((c: FileSystemItem) => c.id === currentPath[i]);
                if (child) {
                    crumbs.push({ id: child.id, name: child.name, path: currentPath.slice(0, i + 1) });
                    if (child.type === 'folder') {
                        current = child;
                    }
                }
            }
        }
        return crumbs;
    };

    const breadcrumbs = getBreadcrumb();

    const isMobile = useIsMobile();
    return (
        <div className="w-full h-full bg-white text-gray-800 flex flex-col overflow-hidden">
            {/* Header - Navigation Bar */}
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

                {/* Breadcrumb */}
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
                {/* Sidebar */}
                <div className="w-52 bg-gray-50 border-r border-gray-200 p-3 overflow-y-auto flex-shrink-0">
                    {/* Quick Access */}
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            {t('fileExplorer.quickAccess')}
                        </h3>
                        <div className="space-y-0.5">
                            {quickAccess.map((item) => {
                                const hasMoreSpecificMatch = quickAccess.some(qa => qa.id !== 'home' && currentPath.includes(qa.id));
                                const isActive = item.id === 'home'
                                    ? !hasMoreSpecificMatch
                                    : currentPath.includes(item.id);

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

                    {/* Drives */}
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

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* File Grid/List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FolderOpen size={64} className="mb-4 opacity-20" />
                                <p className="text-lg">{t('fileExplorer.emptyFolder')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
                                {items.map((item) => {
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setSelectedItem(item);
                                                if (isMobile) handleDoubleClick(item);
                                            }}
                                            onDoubleClick={() => {
                                                if (!isMobile) handleDoubleClick(item);
                                            }}
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
                                            <span className="text-xs text-center text-gray-700 line-clamp-2 w-full break-all">
                                                {item.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
                        <div>
                            {items.length} {items.length === 1 ? t('fileExplorer.item') : t('fileExplorer.items')}
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
        </div>
    );
};
