import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    divider?: boolean;
    danger?: boolean;
    disabled?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
    isOpen: boolean;
}

export const ContextMenu = ({ x, y, items, onClose, isOpen }: ContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Adjust position if menu goes off screen
    const menuWidth = 220;
    const menuHeight = items.length * 36 + (items.filter(i => i.divider).length * 10);

    let adjustedX = x; // Removed the +2 offset
    let adjustedY = y;

    if (typeof window !== 'undefined') {
        if (adjustedX + menuWidth > window.innerWidth) {
            adjustedX = x - menuWidth;
        }
        if (adjustedY + menuHeight > window.innerHeight) {
            adjustedY = window.innerHeight - menuHeight - 10; // Keep 10px from bottom
        }
    }

    const menuContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="fixed z-[9999] bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-xl overflow-hidden py-1 min-w-[200px]"
                    style={{ left: adjustedX, top: adjustedY }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map((item, index) => (
                        <div key={index}>
                            {item.divider && <div className="h-px bg-black my-1 mx-2" />}
                            <button
                                onClick={() => {
                                    if (item.disabled) return;
                                    item.onClick();
                                    onClose();
                                }}
                                disabled={item.disabled}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left
                                    ${item.disabled ? 'opacity-50 cursor-not-allowed' :
                                        item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-ubuntu-orange hover:text-white'}
                                `}
                            >
                                <span className={`flex-shrink-0 ${item.disabled ? 'opacity-40' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
                                <span className="flex-1 font-medium">{item.label}</span>
                            </button>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(menuContent, document.body);
};
