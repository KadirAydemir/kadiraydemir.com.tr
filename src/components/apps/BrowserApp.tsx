import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, RefreshCw, AlertCircle, WifiOff, RotateCcw, ShieldAlert, Cookie } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { LinkedInBadge } from '../ui/LinkedInBadge';

interface BrowserAppProps {
    defaultUrl?: string;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({
    defaultUrl = "https://www.linkedin.com/in/kadir-aydemir-3a1a55148/"
}) => {
    const { cookieConsent } = useOSStore();
    const [url, setUrl] = useState(defaultUrl);
    const [inputValue, setInputValue] = useState(defaultUrl);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isError, setIsError] = useState(false);
    const { t } = useTranslation();

    const handleNavigation = (newUrl: string) => {
        // Simple logic: if navigation is attempted to a different domain or unknown address, show error
        // For this portfolio, we only "cache" the LinkedIn profile
        if (newUrl !== defaultUrl && !newUrl.includes('linkedin.com/in/kadir-aydemir')) {
            setIsError(true);
        } else {
            setIsError(false);
            setUrl(newUrl);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let newUrl = inputValue;
            if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                newUrl = 'https://' + newUrl;
            }
            handleNavigation(newUrl);
            setInputValue(newUrl);
        }
    };

    return (
        <div className="w-full h-full bg-white flex flex-col font-sans">
            {/* Browser Toolbar */}
            <div className="p-2 border-b flex gap-2 bg-gray-100 items-center shrink-0">
                <div className="flex gap-1 px-2">
                    <button
                        onClick={() => {
                            setIsError(false);
                            setUrl(defaultUrl);
                            setInputValue(defaultUrl);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-ubuntu-orange"
                        title={t('browserApp.home')}
                    >
                        <Globe size={18} />
                    </button>
                    <button
                        onClick={() => {
                            setIsError(false);
                            setRefreshKey(prev => prev + 1);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        title={t('browserApp.refresh')}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-white border rounded-full px-4 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-ubuntu-orange border-gray-300 shadow-sm"
                    placeholder={t('browserApp.searchPlaceholder')}
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#f3f2ef] flex flex-col items-center justify-center">
                {isError ? (
                    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                        <div className="bg-red-50 p-6 rounded-full mb-6">
                            <WifiOff size={64} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('browserApp.errorTitle')}</h2>
                        <p className="text-gray-500 text-center max-w-sm mb-8">
                            {t('browserApp.errorMessage')}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => { /* Do nothing as requested */ }}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-400 text-white rounded-full cursor-not-allowed font-medium"
                            >
                                <RotateCcw size={18} />
                                {t('browserApp.retry')}
                            </button>
                            <button
                                onClick={() => {
                                    setIsError(false);
                                    setUrl(defaultUrl);
                                    setInputValue(defaultUrl);
                                    setRefreshKey(prev => prev + 1);
                                }}
                                className="flex items-center gap-2 px-6 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors font-medium"
                            >
                                {t('browserApp.returnHome')}
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-2 text-gray-400 text-sm">
                            <AlertCircle size={16} />
                            <span>{t('browserApp.errorDetail')}</span>
                        </div>
                    </div>
                ) : url.includes('linkedin.com') ? (
                    cookieConsent === true ? (
                        <LinkedInBadge refreshKey={refreshKey} />
                    ) : (
                        <div className="w-full h-full bg-zinc-50 flex flex-col items-center justify-center p-8 text-center">
                            <div className="bg-zinc-100 p-6 rounded-3xl mb-6 shadow-sm border border-zinc-200">
                                <ShieldAlert size={48} className="text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-800 mb-2">{t('browserApp.cookieTitle')}</h3>
                            <p className="text-zinc-500 max-w-sm mb-8">
                                {t('browserApp.cookieMessage')}
                            </p>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('cookie-consent');
                                    window.location.reload();
                                }}
                                className="bg-ubuntu-orange text-white px-8 py-3 rounded-full font-medium hover:bg-ubuntu-orange/90 transition-all shadow-lg shadow-ubuntu-orange/20 flex items-center gap-2"
                            >
                                <Cookie size={18} />
                                {t('browserApp.resetCookies')}
                            </button>
                        </div>
                    )
                ) : (
                    <div className="w-full h-full bg-white relative">
                        <iframe
                            src={url}
                            className="w-full h-full border-none"
                            title="Web Browser"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

