import { useState, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { useTranslation } from 'react-i18next';
import { Save, X, FileText } from 'lucide-react';

interface TextEditorProps {
    fileId: string;
}

export const TextEditorApp = ({ fileId }: TextEditorProps) => {
    const { t } = useTranslation();
    const { fileSystem, updateFileContent } = useOSStore();
    const [content, setContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    // Find the file in the file system
    const findFile = (node: any): any => {
        if (node.id === fileId) return node;
        if (node.children) {
            for (const child of node.children) {
                const found = findFile(child);
                if (found) return found;
            }
        }
        return null;
    };

    const file = findFile(fileSystem);

    useEffect(() => {
        if (file) {
            setContent(file.content || '');
            setIsDirty(false);
        }
    }, [fileId]);

    const handleSave = () => {
        updateFileContent(fileId, content);
        setIsDirty(false);
    };

    if (!file) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText size={64} className="mb-4 opacity-20" />
                <p>File not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f3f3f3] text-[#333]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                        ${isDirty
                            ? 'bg-ubuntu-orange text-white hover:bg-ubuntu-orange/90'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    <Save size={16} />
                    {t('editor.save', 'Save')}
                </button>
                {isDirty && (
                    <span className="text-xs text-orange-500 font-medium ml-2 animate-pulse">
                        ● {t('editor.unsaved', 'Unsaved changes')}
                    </span>
                )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setIsDirty(true);
                    }}
                    className="flex-1 w-full p-4 font-mono text-sm bg-white border border-gray-200 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-ubuntu-orange/20 resize-none"
                    placeholder={t('editor.placeholder', 'Start typing...')}
                    spellCheck={false}
                />
            </div>

            {/* Status Bar */}
            <div className="px-4 py-1.5 bg-gray-100 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                <span>{file.name}</span>
                <div className="flex gap-4">
                    <span>{content.length} characters</span>
                    <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
            </div>
        </div>
    );
};
