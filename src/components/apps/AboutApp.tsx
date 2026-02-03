import { Cpu, MemoryStick, HardDrive, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AboutApp = () => {
    const { t } = useTranslation();
    return (
        <div className="h-full w-full bg-ubuntu-warm-grey text-white p-8 overflow-y-auto font-ubuntu select-none flex flex-col items-center justify-center">

            <div className="bg-gradient-to-br from-ubuntu-orange to-red-600 rounded-full p-6 shadow-2xl mb-6">
                <Info size={64} className="text-white" />
            </div>

            <h1 className="text-4xl font-bold mb-2 tracking-tight">{t('aboutApp.title')}</h1>
            <p className="text-ubuntu-cool-grey text-lg mb-8">{t('aboutApp.version')}</p>

            <div className="w-full max-w-md bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 shadow-lg">
                <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">{t('aboutApp.hardwareInfo')}</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-300">
                            <MemoryStick size={20} />
                            <span>{t('aboutApp.memory')}</span>
                        </div>
                        <span className="font-mono text-ubuntu-orange">16.0 GiB</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-300">
                            <Cpu size={20} />
                            <span>{t('aboutApp.processor')}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-mono text-ubuntu-orange block">AMD Ryzen™ 7 5800H</span>
                            <span className="text-xs text-gray-500">{t('aboutApp.graphics')}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-300">
                            <HardDrive size={20} />
                            <span>{t('aboutApp.diskCapacity')}</span>
                        </div>
                        <span className="font-mono text-ubuntu-orange">1.0 TB</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-300">
                            <Info size={20} />
                            <span>{t('aboutApp.osType')}</span>
                        </div>
                        <span className="font-mono text-ubuntu-orange">64-bit</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-gray-400 text-sm">
                <p className="mb-2">{t('aboutApp.copyright')}</p>
                <p className="max-w-md mx-auto text-xs leading-relaxed opacity-70">
                    {t('aboutApp.description')}
                    {t('aboutApp.license')}
                    {t('aboutApp.concept')}
                </p>
            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={() => window.open('https://kadiraydemir.com.tr', '_blank')}
                    className="px-6 py-2 bg-ubuntu-orange hover:bg-orange-600 transition-colors rounded-full text-sm font-bold shadow-lg"
                >
                    {t('aboutApp.website')}
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 transition-colors rounded-full text-sm font-bold shadow-lg"
                >
                    {t('aboutApp.restart')}
                </button>
            </div>
        </div>
    );
};
