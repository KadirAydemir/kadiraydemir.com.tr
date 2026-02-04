import { useRef, useEffect, useState } from 'react';
import { AlertCircle, HelpCircle, Info, X } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { useTranslation } from 'react-i18next';

export const Dialog = () => {
    const { dialog, closeDialog } = useOSStore();
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState(dialog?.defaultValue || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (dialog?.type === 'prompt') {
            setInputValue(dialog.defaultValue || '');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [dialog]);

    if (!dialog) return null;

    const handleConfirm = () => {
        if (dialog.type === 'prompt') {
            closeDialog(inputValue);
        } else {
            closeDialog(true);
        }
    };

    const handleCancel = () => {
        if (dialog.type === 'prompt') {
            closeDialog(null);
        } else {
            closeDialog(false);
        }
    };

    const getIcon = () => {
        switch (dialog.type) {
            case 'alert':
                return <AlertCircle className="text-red-500" size={24} />;
            case 'confirm':
                return <HelpCircle className="text-ubuntu-orange" size={24} />;
            case 'prompt':
                return <Info className="text-blue-500" size={24} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/50">
                    <div className="flex items-center gap-2">
                        {getIcon()}
                        <h3 className="font-semibold text-gray-800 text-sm">{dialog.title}</h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {dialog.message}
                    </p>

                    {dialog.type === 'prompt' && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirm();
                                if (e.key === 'Escape') handleCancel();
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ubuntu-orange focus:border-transparent outline-none transition-all"
                            autoFocus
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                    {(dialog.type === 'confirm' || dialog.type === 'prompt') && (
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                        >
                            {dialog.cancelLabel || t('common.cancel', 'Cancel')}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-ubuntu-orange text-white rounded-lg text-sm font-medium hover:bg-ubuntu-orange/90 shadow-sm transition-all focus:ring-2 focus:ring-ubuntu-orange/50 focus:outline-none"
                    >
                        {dialog.confirmLabel || (dialog.type === 'alert' ? t('common.ok', 'OK') : t('common.confirm', 'Confirm'))}
                    </button>
                </div>
            </div>
        </div>
    );
};
