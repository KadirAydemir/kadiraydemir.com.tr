import { Terminal, Settings, Globe, Mail, Bomb, Grid3x3, Search, Activity, Info, Folder, Github } from 'lucide-react';
import { useProcess } from '../../hooks/useProcess';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ApplicationsMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

interface App {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    frequent?: boolean;
}

interface AppItemProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const AppItem = ({ label, icon, onClick }: AppItemProps) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-all group"
    >
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <div className="text-white">
                {icon}
            </div>
        </div>
        <span className="text-white text-xs font-ubuntu text-center line-clamp-2 max-w-[80px]">
            {label}
        </span>
    </button>
);

export const ApplicationsMenu = ({ isOpen, onClose }: ApplicationsMenuProps) => {
    const { openTerminal, openSettings, openBrowser, openMail, openMinesweeper, openSudoku, openHtop, openAbout, openExplorer, openProjects } = useProcess();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'frequent' | 'all'>('frequent');
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 10;
    const { t } = useTranslation();

    // Reset page when tab changes
    if (activeTab !== 'frequent' && currentPage !== 0 && activeTab === 'all') {
        // We handle reset in click handlers usually, but to be safe:
        // Actually, let's keep it simple and handle inside handlers.
    }

    const apps: App[] = [
        {
            id: 'terminal',
            label: t('apps.terminal'),
            icon: <Terminal size={28} />,
            onClick: openTerminal,
            frequent: true
        },
        {
            id: 'browser',
            label: t('apps.browser'),
            icon: <Globe size={28} />,
            onClick: openBrowser,
            frequent: true
        },
        {
            id: 'explorer',
            label: t('apps.explorer'),
            icon: <Folder size={28} />,
            onClick: openExplorer,
            frequent: true
        },
        {
            id: 'mail',
            label: t('apps.mail'),
            icon: <Mail size={28} />,
            onClick: openMail,
            frequent: true
        },
        {
            id: 'minesweeper',
            label: t('apps.minesweeper'),
            icon: <Bomb size={28} />,
            onClick: openMinesweeper,
            frequent: false
        },
        {
            id: 'sudoku',
            label: t('apps.sudoku'),
            icon: <Grid3x3 size={28} />,
            onClick: openSudoku,
            frequent: false
        },
        {
            id: 'settings',
            label: t('apps.settings'),
            icon: <Settings size={28} />,
            onClick: openSettings,
            frequent: false
        },
        {
            id: 'htop',
            label: t('apps.htop'),
            icon: <Activity size={28} />,
            onClick: openHtop,
            frequent: false
        },
        {
            id: 'about',
            label: t('apps.about'),
            icon: <Info size={28} />,
            onClick: openAbout,
            frequent: false
        },
        {
            id: 'projects',
            label: t('apps.projects'),
            icon: <Github size={28} />,
            onClick: openProjects,
            frequent: true
        }
    ];

    const handleAppClick = (openFn: () => void) => {
        openFn();
        onClose();
    };

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || app.frequent;
        return matchesSearch && matchesTab;
    });

    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApps.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handlePageChange = (pageIndex: number) => {
        setCurrentPage(pageIndex);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%" }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed bottom-20 md:bottom-48 left-1/2 w-[90vw] md:w-[720px] bg-gradient-to-br from-gray-900/98 to-gray-800/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
                    >
                        {/* Search Bar */}
                        <div className="p-6 pb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('applicationsMenu.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/30 text-white placeholder-white/40 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-ubuntu-orange/50 transition-all font-ubuntu"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 flex gap-6 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('frequent')}
                                className={`pb-3 font-ubuntu text-sm transition-all relative ${activeTab === 'frequent'
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                {t('applicationsMenu.frequent')}
                                {activeTab === 'frequent' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-ubuntu-orange"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`pb-3 font-ubuntu text-sm transition-all relative ${activeTab === 'all'
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                {t('applicationsMenu.allApplications')}
                                {activeTab === 'all' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-ubuntu-orange"
                                    />
                                )}
                            </button>
                        </div>

                        {/* Apps Grid Container with Pagination Animation */}
                        <div className="relative h-[280px] overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPage + activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 absolute inset-0 content-start"
                                >
                                    {paginatedApps.length > 0 ? (
                                        paginatedApps.map((app) => (
                                            <AppItem
                                                key={app.id}
                                                label={app.label}
                                                icon={app.icon}
                                                onClick={() => handleAppClick(app.onClick)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-5 text-center py-12 text-white/40 font-ubuntu">
                                            {t('applicationsMenu.notFound')}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Dynamic Pagination Dots */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 pb-6">
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${currentPage === index
                                            ? 'bg-ubuntu-orange scale-125'
                                            : 'bg-white/20 hover:bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
