import { useRef, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { WindowState } from '../../types/os';
import { motion, AnimatePresence } from 'framer-motion';

interface WindowFrameProps {
    window: WindowState;
    children: React.ReactNode;
}

export const WindowFrame = ({ window, children }: WindowFrameProps) => {
    const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, updateWindowPosition, activeWindowId } = useOSStore();
    const { id, title, zIndex, isMinimized, isMaximized, position, size } = window;
    const nodeRef = useRef<HTMLDivElement>(null);
    const [dragPosition, setDragPosition] = useState(position);
    const isActive = activeWindowId === id;

    useEffect(() => {
        setDragPosition(position);
    }, [position]);

    if (isMinimized) return null;

    const handleDrag = (_e: any, data: { x: number; y: number }) => {
        setDragPosition({ x: data.x, y: data.y });
    };

    const handleStop = (_e: any, data: { x: number; y: number }) => {
        updateWindowPosition(id, { x: data.x, y: data.y });
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".window-header"
            position={isMaximized ? { x: 0, y: 0 } : dragPosition}
            onDrag={handleDrag}
            onStop={handleStop}
            onStart={() => focusWindow(id)}
            disabled={isMaximized}
            bounds="parent"
        >
            <div
                ref={nodeRef}
                onMouseDownCapture={() => focusWindow(id)}
                className={`absolute flex flex-col bg-ubuntu-cool-grey shadow-2xl overflow-hidden border border-black/50 transition-all duration-200 ease-in-out ${isMaximized ? 'rounded-none' : 'rounded-lg'} ${isActive ? 'ring-1 ring-white/20' : ''}`}
                style={{
                    width: isMaximized ? 'calc(100vw - 64px)' : size.width,
                    height: isMaximized ? 'calc(100vh - 28px)' : size.height,
                    zIndex: zIndex,
                    top: isMaximized ? '28px' : 0,
                    left: isMaximized ? '64px' : 0,
                    pointerEvents: 'auto',
                }}
            >
                {/* Header Bar */}
                <div
                    data-testid="window-header"
                    className="window-header h-9 bg-ubuntu-header flex items-center justify-between px-3 cursor-default select-none group shrink-0"
                    onDoubleClick={() => isMaximized ? restoreWindow(id) : maximizeWindow(id)}
                >
                    <div className="flex-1 text-center text-sm font-bold text-gray-300 pointer-events-none">
                        {title}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            data-testid="window-minimize"
                            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
                            className="w-5 h-5 rounded-full bg-ubuntu-warm-grey/20 hover:bg-ubuntu-warm-grey/50 flex items-center justify-center text-white transition-colors"
                        >
                            <Minus size={12} />
                        </button>
                        <button
                            data-testid="window-maximize"
                            onClick={(e) => {
                                e.stopPropagation();
                                isMaximized ? restoreWindow(id) : maximizeWindow(id);
                            }}
                            className="w-5 h-5 rounded-full bg-ubuntu-warm-grey/20 hover:bg-ubuntu-warm-grey/50 flex items-center justify-center text-white transition-colors"
                        >
                            {isMaximized ? <Maximize2 size={10} /> : <Square size={10} />}
                        </button>
                        <button
                            data-testid="window-close"
                            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
                            className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div
                    className="flex-1 overflow-auto bg-ubuntu-light-grey relative"
                >
                    {/* Invisible overlay to catch clicks on inactive windows (especially for iframes) */}
                    {!isActive && (
                        <div
                            className="absolute inset-0 z-[9999] cursor-default"
                            onMouseDown={(e) => {
                                focusWindow(id);
                                // We don't stop propagation here so onMouseDownCapture on parent also fires,
                                // but more importantly, we catch the event before it hits an iframe.
                            }}
                        />
                    )}
                    {children}
                </div>
            </div>
        </Draggable >
    );
};
