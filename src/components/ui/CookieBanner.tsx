import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { Cookie, X, Check, ShieldCheck } from 'lucide-react';

export const CookieBanner = () => {
    const { cookieConsent, setCookieConsent } = useOSStore();

    if (cookieConsent !== null) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-2xl"
            >
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-ubuntu-orange/10 p-4 rounded-xl">
                        <Cookie className="text-ubuntu-orange w-8 h-8" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                            Çerez Ayarları
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                            Web sitemizde size en iyi deneyimi sunabilmek için çerezler kullanıyoruz. Çerezler, site trafiğini analiz etmemize ve sosyal medya özelliklerini sağlamamıza yardımcı olur.
                            <span className="hidden sm:inline"> Devam ederek çerez kullanımını kabul etmiş olursunuz.</span>
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setCookieConsent(false)}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-gray-200 dark:border-white/10"
                        >
                            Reddet
                        </button>
                        <button
                            onClick={() => setCookieConsent(true)}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium bg-ubuntu-orange text-white hover:bg-ubuntu-orange/90 transition-all shadow-lg shadow-ubuntu-orange/20 flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Kabul Et
                        </button>
                    </div>

                    <button
                        onClick={() => setCookieConsent(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
