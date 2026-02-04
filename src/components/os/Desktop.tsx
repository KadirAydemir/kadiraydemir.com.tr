import { FileText, Folder, Github } from 'lucide-react';
import { useProcess } from '../../hooks/useProcess';
import backgroundImage from '../../assets/wallpapers/ubuntu-bg.png';
import { motion } from 'framer-motion';

import { useOSStore } from '../../store/useOSStore';
import { useIsMobile } from '../../hooks/useIsMobile';

interface DesktopIconProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const DesktopIcon = ({ label, icon, onClick }: DesktopIconProps) => {
    const isMobile = useIsMobile();

    const handleAction = () => {
        onClick();
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (isMobile) handleAction();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isMobile) handleAction();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm transition-colors group w-24 text-center cursor-default"
        >
            <div className="p-3 bg-ubuntu-orange/90 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                <div className="text-white">
                    {icon}
                </div>
            </div>
            <span className="text-white text-xs font-ubuntu drop-shadow-md bg-black/30 px-2 py-0.5 rounded-full">{label}</span>
        </button>
    );
};

export const Desktop = () => {
    const { openCV, openExplorer } = useProcess();
    const { deselectAll } = useOSStore();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-0 pt-10 pl-4 pr-4 pb-20 md:pl-16 md:pb-4 flex flex-col flex-wrap content-start items-start gap-4"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            onClick={deselectAll}
        >
            <div className="absolute inset-0 bg-black/20 pointer-events-none" /> {/* Overlay for better contrast */}

            <DesktopIcon
                label="Kadir_CV.pdf"
                icon={<FileText size={32} />}
                onClick={openCV}
            />

            <DesktopIcon
                label="Projects"
                icon={<Folder size={32} />}
                onClick={() => openExplorer({ path: ['home', 'projects'] })}
            />

        </motion.div>
    );
};
