import React, { useEffect, useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Linkedin, MapPin, ExternalLink, Briefcase } from 'lucide-react';
import profileImage from '../../assets/profile.jpg';

interface LinkedInBadgeProps {
    refreshKey: number;
}

export const LinkedInBadge: React.FC<LinkedInBadgeProps> = ({ refreshKey }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    const { cookieConsent } = useOSStore(); // Determine consent from store

    useEffect(() => {
        // Dynamic Script Loading for Performance
        if (cookieConsent && !document.getElementById('linkedin-profile-badge-script')) {
            const script = document.createElement('script');
            script.id = 'linkedin-profile-badge-script';
            script.src = "https://platform.linkedin.com/badges/js/profile.js";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

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

        // If script is already loaded or just added, we need to wait for it to be ready
        // If it was already there, tryParse will likely work immediately or after short retry
        // If we just added it, retries will handle the network delay
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
    }, [refreshKey, isLoaded, cookieConsent]); // Added cookieConsent to deps

    if (showFallback) {
        return (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full py-4 px-4">
                <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 font-sans flex flex-col">
                    {/* Header Banner */}
                    <div className="h-24 bg-gradient-to-r from-blue-700 to-blue-900 relative shrink-0">
                        <Linkedin className="absolute top-4 right-4 text-white/20 w-10 h-10" />
                    </div>

                    {/* Content Area */}
                    <div className="px-6 pb-8 flex flex-col items-start relative bg-white">
                        {/* Avatar - Positioned to overlap banner */}
                        <div className="relative -mt-12 mb-4 z-20">
                            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <img
                                    src={profileImage}
                                    alt="Kadir Aydemir"
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Kadir+Aydemir&background=0a66c2&color=fff&size=200`;
                                    }}
                                />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="space-y-1 w-full">
                            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">Kadir Aydemir</h3>
                            <p className="text-sm text-blue-700 font-bold uppercase tracking-wider">Senior Full Stack Developer</p>
                        </div>

                        {/* Details List */}
                        <div className="mt-6 space-y-3 w-full border-t border-gray-50 pt-6">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <Briefcase size={16} className="text-gray-500" />
                                </div>
                                <span className="font-medium">Akbank · Senior Developer</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <MapPin size={16} className="text-gray-500" />
                                </div>
                                <span className="font-medium">Ankara, Türkiye</span>
                            </div>
                        </div>

                        {/* Button */}
                        <a
                            href="https://tr.linkedin.com/in/kadir-aydemir-3a1a55148"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-[#0a66c2] text-white rounded-xl text-sm font-bold hover:bg-[#004182] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
                        >
                            Linkedin Profiline Git
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
                <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold opacity-60">LinkedIn Offline View</p>
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
