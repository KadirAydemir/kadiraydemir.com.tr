import React, { useEffect, useState } from 'react';
import { Linkedin, MapPin, ExternalLink, Briefcase } from 'lucide-react';

interface LinkedInBadgeProps {
    refreshKey: number;
}

export const LinkedInBadge: React.FC<LinkedInBadgeProps> = ({ refreshKey }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        let retries = 0;
        const maxRetries = 20;

        // Clean up LInGlobal to force a fresh parse if it exists from a previous render
        // This is kept from the original logic to ensure a fresh state for LInGlobal
        if ((window as any).LInGlobal) {
            delete (window as any).LInGlobal;
        }

        const tryParse = () => {
            const badgeElement = document.querySelector('.LI-profile-badge');
            const global = (window as any).LInGlobal;

            if (global?.parseBadges && badgeElement) {
                global.parseBadges();
                // We check if the iframe was actually created to mark it as loaded
                // Give it a small delay to ensure the iframe has rendered
                setTimeout(() => {
                    const iframe = badgeElement.querySelector('iframe');
                    if (iframe) {
                        setIsLoaded(true);
                    } else if (retries < maxRetries) { // If parseBadges was called but no iframe, retry
                        retries++;
                        setTimeout(tryParse, 200);
                    }
                }, 100);
            } else if (retries < maxRetries) {
                retries++;
                setTimeout(tryParse, 200);
            }
        };

        // Initial attempt to parse
        tryParse();

        // Safety timeout: if after 3 seconds it still hasn't loaded, show a premium fallback
        const fallbackTimeout = setTimeout(() => {
            const iframe = document.querySelector('.LI-profile-badge iframe');
            if (!iframe && !isLoaded) { // Only show fallback if not loaded and no iframe
                setShowFallback(true);
            }
        }, 3000);

        return () => {
            clearTimeout(fallbackTimeout);
            // Clean up LInGlobal on unmount to prevent issues if component is re-mounted
            if ((window as any).LInGlobal) {
                delete (window as any).LInGlobal;
            }
        };
    }, [refreshKey, isLoaded]); // Added isLoaded to dependencies to re-evaluate fallbackTimeout if badge loads

    if (showFallback) {
        return (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full py-4 px-4">
                <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-xl overflow-hidden border border-gray-100 font-sans">
                    <div className="h-20 bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-end">
                        <Linkedin className="text-white/20 w-12 h-12" />
                    </div>
                    <div className="px-6 pb-6 relative">
                        <div className="absolute -top-10 left-6">
                            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                                <img
                                    src="https://media.licdn.com/dms/image/v2/D4D03AQGsR65sXw8Z4Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1715504825651?e=1743638400&v=beta&t=9xVnC1v_lY-o7e9Ue2ZlM0m_u1yv_L9kZ7n3Q1q9Z9M"
                                    alt="Kadir Aydemir"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-gray-900">Kadir Aydemir</h3>
                            <p className="text-sm text-gray-600 font-medium">Senior Full Stack Developer | Technical Lead</p>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Briefcase size={14} className="text-gray-400" />
                                    <span>Akbank · Senior Software Developer</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>Ankara, Türkiye</span>
                                </div>
                            </div>

                            <a
                                href="https://tr.linkedin.com/in/kadir-aydemir-3a1a55148"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-[#0a66c2] text-white rounded-full text-sm font-bold hover:bg-[#004182] transition-colors shadow-md shadow-blue-200"
                            >
                                Profili Görüntüle
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">LinkedIn Cached View</p>
            </div>
        );
    }

    return (
        <div key={refreshKey} className="flex flex-col items-center animate-in fade-in duration-700 w-full py-4">
            <div className={`bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-80'}`}>
                <div
                    className="badge-base LI-profile-badge"
                    data-locale="tr_TR"
                    data-size="large"
                    data-theme="light"
                    data-type="HORIZONTAL"
                    data-vanity="kadir-aydemir-3a1a55148"
                    data-version="v1"
                >
                    <a
                        className="badge-base__link LI-simple-link"
                        href="https://tr.linkedin.com/in/kadir-aydemir-3a1a55148?trk=profile-badge"
                    >
                        {!isLoaded && "Profil Yükleniyor..."}
                    </a>
                </div>
            </div>

            <div className="mt-8 text-center max-w-xs">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">LinkedIn Official Profile</p>
                <p className="text-[10px] text-gray-400">Veriler doğrudan LinkedIn üzerinden güncellenmektedir.</p>
            </div>
        </div>
    );
};
