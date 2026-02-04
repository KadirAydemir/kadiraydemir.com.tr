import { useState, useRef } from 'react';
import { useOSStore } from '../../../store/useOSStore';

interface NanoEditorProps {
    fileName: string;
    initialContent: string;
    onSave: (content: string) => void;
    onExit: () => void;
}

export const NanoEditor = ({ fileName, initialContent, onSave, onExit }: NanoEditorProps) => {
    const { showConfirm } = useOSStore();
    const [content, setContent] = useState(initialContent);
    const [isModified, setIsModified] = useState(false);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = () => {
        onSave(content);
        setIsModified(false);
    };

    const handleCancel = async () => {
        if (isModified) {
            const confirmed = await showConfirm(
                'GNU nano',
                'Discard unsaved changes?',
                'Discard',
                'Cancel'
            );
            if (!confirmed) return;
        }
        onExit();
    };

    return (
        <div className="w-full h-full bg-[#300a24] text-white font-mono flex flex-col" onClick={() => editorRef.current?.focus()}>
            <div className="bg-gray-800 text-white px-2 py-1 text-sm flex justify-between items-center">
                <span>GNU nano 5.4</span>
                <span>{fileName}</span>
                <span className={isModified ? "text-yellow-400 font-bold" : ""}>
                    {isModified ? '[Modified]' : ''}
                </span>
            </div>
            <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    setIsModified(true);
                }}
                onKeyDown={(e) => {
                    // Handle Ctrl+X (Exit)
                    if (e.ctrlKey && e.key.toLowerCase() === 'x') {
                        e.preventDefault();
                        handleCancel();
                    }
                    // Handle Ctrl+S (Save and exit)
                    if (e.ctrlKey && e.key.toLowerCase() === 's') {
                        e.preventDefault();
                        handleSave();
                    }
                }}
                className="flex-1 bg-[#300a24] text-white p-2 border-none outline-none resize-none font-mono text-sm"
                autoFocus
            />
            <div className="bg-gray-800 text-white px-2 py-1 text-xs flex gap-4">
                <button
                    onClick={handleSave}
                    className="hover:bg-gray-700 px-2 rounded flex items-center gap-1"
                    title="Ctrl+S (Save & Exit)"
                >
                    <span className="bg-white text-gray-800 px-1 rounded-sm font-bold">^S</span> Save & Exit
                </button>
                <button
                    onClick={handleCancel}
                    className="hover:bg-gray-700 px-2 rounded flex items-center gap-1"
                    title="Ctrl+X (Exit)"
                >
                    <span className="bg-white text-gray-800 px-1 rounded-sm font-bold">^X</span> Exit
                </button>
            </div>
        </div>
    );
};
