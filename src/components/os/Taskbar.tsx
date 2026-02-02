import { Battery, WifiOff, Volume2, Power, Grid, FileText, Terminal, Globe, Mail, Settings, Bomb, Grid3x3 } from 'lucide-react';
import { useTime } from '../../hooks/useTime';
import { useProcess } from '../../hooks/useProcess';
import { useOSStore } from '../../store/useOSStore';
import { ApplicationsMenu } from './ApplicationsMenu';
import { SystemMenu } from './SystemMenu';
import { CalendarPopup } from './CalendarPopup';
import { useSystemStore } from '../../store/useSystemStore';
import { useState, useMemo } from 'react';
import { Wifi } from 'lucide-react';

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
        default:
            return <FileText className="text-white" size={28} />;
    }
};

const getAppName = (appType: string) => {
    switch (appType) {
        case 'cv': return 'CV';
        case 'terminal': return 'Terminal';
        case 'browser': return 'Browser';
        case 'mail': return 'Mail';
        case 'settings': return 'Settings';
        case 'minesweeper': return 'Minesweeper';
        case 'sudoku': return 'Sudoku';
        default: return appType;
    }
};

const TopBar = () => {
    const { formattedTime, fullDate } = useTime();
    const { windows, activeWindowId } = useOSStore();
    const { isWifiOn } = useSystemStore();
    const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const activeAppTitle = useMemo(() => {
        if (!activeWindowId) return 'KadirOS Desktop';
        const activeWindow = windows.find(w => w.id === activeWindowId);
        return activeWindow ? getAppName(activeWindow.appType) : 'KadirOS Desktop';
    }, [windows, activeWindowId]);

    return (
        <div className="h-7 bg-ubuntu-header flex items-center justify-between px-2 text-sm select-none z-50 absolute top-0 w-full shadow-md text-gray-200">
            <div className="flex items-center gap-4 pl-2">
                <span className="font-bold hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors font-ubuntu">Activities</span>
                <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors hidden sm:block font-ubuntu">
                    {activeAppTitle}
                </span>
            </div>

            <div className="flex items-center gap-3 pr-1">
                <div className="relative">
                    <div
                        className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors font-ubuntu"
                        title={fullDate}
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    >
                        <span>{formattedTime}</span>
                    </div>
                    <CalendarPopup
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                    />
                </div>

                <div
                    className="flex items-center gap-2 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
                >
                    {isWifiOn ? <Wifi size={14} /> : <WifiOff size={14} className="text-red-500" />}
                    <Volume2 size={14} />
                    <Battery size={14} />
                    <Power size={14} />
                </div>
            </div>

            <SystemMenu
                isOpen={isSystemMenuOpen}
                onClose={() => setIsSystemMenuOpen(false)}
            />
        </div>
    );
};

const DockItem = ({ icon, onClick, isOpen, name }: { icon: React.ReactNode, onClick: () => void, isOpen?: boolean, name: string }) => (
    <div className="relative group w-full aspect-square flex items-center justify-center cursor-pointer" onClick={onClick}>
        {isOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-ubuntu-orange rounded-full" />
        )}
        <div className="p-2.5 bg-gray-800/50 rounded-xl group-hover:bg-white/10 transition-colors">
            {icon}
        </div>
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {name}
        </div>
    </div>
);

export const Taskbar = () => {
    const { toggleCV, toggleTerminal, toggleBrowser, toggleMail, toggleSettings, toggleMinesweeper, toggleSudoku } = useProcess();
    const { windows } = useOSStore();
    const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);

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
            default: return () => { };
        }
    };

    // Get unique app types from open windows
    const openAppTypes = useMemo(() => Array.from(new Set(windows.map(w => w.appType))), [windows]);

    return (
        <>
            <TopBar />

            {/* Left Dock */}
            <div className="absolute left-0 top-7 bottom-0 w-16 bg-ubuntu-dock/80 backdrop-blur-md flex flex-col items-center py-2 gap-2 z-40 border-r border-white/5">
                {/* Pinned Apps - Always visible */}
                <DockItem
                    icon={<FileText className="text-orange-400" size={28} />}
                    onClick={toggleCV}
                    isOpen={isAppOpen('cv')}
                    name="CV"
                />
                <DockItem
                    icon={<Globe className="text-blue-400" size={28} />}
                    onClick={toggleBrowser}
                    isOpen={isAppOpen('browser')}
                    name="Browser"
                />

                {/* Separator - Only show if there are non-pinned apps open */}
                {openAppTypes.filter(appType => appType !== 'cv' && appType !== 'browser').length > 0 && (
                    <div className="w-10 h-px bg-white/20 my-1" />
                )}

                {/* Dynamically render icons for other open apps */}
                {openAppTypes
                    .filter(appType => appType !== 'cv' && appType !== 'browser') // Exclude pinned apps
                    .map((appType) => (
                        <DockItem
                            key={appType}
                            icon={getAppIcon(appType)}
                            onClick={getToggleFunction(appType)}
                            isOpen={isAppOpen(appType)}
                            name={getAppName(appType)}
                        />
                    ))}

                <div className="mt-auto mb-2">
                    <DockItem
                        icon={<Grid className="text-white" size={24} />}
                        onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                        name="Applications"
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
