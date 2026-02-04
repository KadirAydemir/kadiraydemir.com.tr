import { Battery, WifiOff, Volume2, Power } from 'lucide-react';
import { useTime } from '../../hooks/useTime';
import { useOSStore } from '../../store/useOSStore';
import { SystemMenu } from './SystemMenu';
import { CalendarPopup } from './CalendarPopup';
import { LanguageSelector } from './LanguageSelector';
import { useSystemStore } from '../../store/useSystemStore';
import { useState, useMemo } from 'react';
import { Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TopBar = () => {
    const { formattedTime, fullDate } = useTime();
    const { windows, activeWindowId } = useOSStore();
    const { isWifiOn } = useSystemStore();
    const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { t } = useTranslation();

    const activeAppTitle = useMemo(() => {
        if (!activeWindowId) return t('system.desktop');
        const activeWindow = windows.find(w => w.id === activeWindowId);
        return activeWindow ? t(`apps.${activeWindow.appType}`) : t('system.desktop');
    }, [windows, activeWindowId, t]);

    return (
        <div className="h-7 bg-ubuntu-header flex items-center justify-between px-2 text-sm select-none z-50 absolute top-0 w-full shadow-md text-gray-200">
            <div className="flex items-center gap-4 pl-2">
                <span className="font-bold hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors font-ubuntu">{t('system.activities')}</span>
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

                <LanguageSelector />

                <div
                    data-testid="system-tray"
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
