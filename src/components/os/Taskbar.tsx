import { Grid, FileText, Terminal, Globe, Mail, Settings, Bomb, Grid3x3, Folder } from 'lucide-react';
import { useProcess } from '../../hooks/useProcess';
import { useOSStore } from '../../store/useOSStore';
import { ApplicationsMenu } from './ApplicationsMenu';
import { TopBar } from './TopBar';
import { DockItem } from './DockItem';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// App icon mapping
const getAppIcon = (appType: string) => {
    switch (appType) {
        case 'cv':
            return <FileText className="text-orange-400" size={28} />;
        case 'terminal':
            return <Terminal className="text-gray-300" size={28} />;
        case 'browser':
            return <Globe className="text-blue-400" size={28} />;
        case 'mail':
            return <Mail className="text-blue-300" size={28} />;
        case 'settings':
            return <Settings className="text-gray-400" size={28} />;
        case 'minesweeper':
            return <Bomb className="text-red-400" size={28} />;
        case 'sudoku':
            return <Grid3x3 className="text-purple-400" size={28} />;
        case 'explorer':
            return <Folder className="text-orange-300" size={28} />;
        default:
            return <FileText className="text-white" size={28} />;
    }
};

export const Taskbar = () => {
    const { toggleCV, toggleTerminal, toggleBrowser, toggleMail, toggleSettings, toggleMinesweeper, toggleSudoku, toggleExplorer } = useProcess();
    const { windows } = useOSStore();
    const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
    const { t } = useTranslation();

    const isAppOpen = (type: string) => windows.some(w => w.appType === type);

    const getToggleFunction = (appType: string) => {
        switch (appType) {
            case 'cv': return toggleCV;
            case 'terminal': return toggleTerminal;
            case 'browser': return toggleBrowser;
            case 'mail': return toggleMail;
            case 'settings': return toggleSettings;
            case 'minesweeper': return toggleMinesweeper;
            case 'sudoku': return toggleSudoku;
            case 'explorer': return toggleExplorer;
            default: return () => { };
        }
    };

    // Get unique app types from open windows
    const openAppTypes = useMemo(() => Array.from(new Set(windows.map(w => w.appType))), [windows]);

    return (
        <>
            <TopBar />

            {/* Dock (Left on Desktop, Bottom on Mobile) */}
            <div className="absolute bottom-0 left-0 right-0 md:top-7 md:bottom-0 md:w-16 md:right-auto h-16 md:h-auto bg-ubuntu-dock/80 backdrop-blur-md flex flex-row md:flex-col items-center px-4 md:px-0 md:py-2 gap-2 z-40 border-t md:border-t-0 md:border-r border-white/5">
                {/* Pinned Apps - Always visible */}
                <DockItem
                    icon={<Folder className="text-orange-300" size={28} />}
                    onClick={toggleExplorer}
                    isOpen={isAppOpen('explorer')}
                    name={t('apps.explorer')}
                />
                <DockItem
                    icon={<Globe className="text-blue-400" size={28} />}
                    onClick={toggleBrowser}
                    isOpen={isAppOpen('browser')}
                    name={t('apps.browser')}
                />
                <DockItem
                    icon={<FileText className="text-orange-400" size={28} />}
                    onClick={toggleCV}
                    isOpen={isAppOpen('cv')}
                    name={t('apps.cv')}
                />

                {/* Separator - Only show if there are non-pinned apps open */}
                {openAppTypes.filter(appType => appType !== 'cv' && appType !== 'browser' && appType !== 'explorer').length > 0 && (
                    <div className="w-10 h-px bg-white/20 my-1" />
                )}

                {/* Dynamically render icons for other open apps */}
                {openAppTypes
                    .filter(appType => appType !== 'cv' && appType !== 'browser' && appType !== 'explorer') // Exclude pinned apps
                    .map((appType) => (
                        <DockItem
                            key={appType}
                            icon={getAppIcon(appType)}
                            onClick={getToggleFunction(appType)}
                            isOpen={isAppOpen(appType)}
                            name={t(`apps.${appType}`)}
                        />
                    ))}

                <div className="ml-auto md:ml-0 md:mt-auto md:mb-2">
                    <DockItem
                        icon={<Grid className="text-white" size={24} />}
                        onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                        name={t('system.applications')}
                    />
                </div>
            </div>

            {/* Applications Menu */}
            <ApplicationsMenu
                isOpen={isAppsMenuOpen}
                onClose={() => setIsAppsMenuOpen(false)}
            />
        </>
    );
};
