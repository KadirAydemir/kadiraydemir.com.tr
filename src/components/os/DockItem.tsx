import React from 'react';

export const DockItem = ({ icon, onClick, isOpen, name }: { icon: React.ReactNode, onClick: () => void, isOpen?: boolean, name: string }) => (
    <div className="relative group w-12 h-12 md:w-full md:h-auto md:aspect-square flex items-center justify-center cursor-pointer" onClick={onClick}>
        {isOpen && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 md:left-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:bottom-auto bg-ubuntu-orange rounded-full" />
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
