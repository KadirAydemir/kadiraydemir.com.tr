import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

interface NavigationProps {
    canGoBack: boolean;
    canGoForward: boolean;
    onGoBack: () => void;
    onGoForward: () => void;
    breadcrumbs: { id: string; name: string; path: string[] }[];
    onNavigate: (path: string[]) => void;
}

export const Navigation = ({
    canGoBack, canGoForward, onGoBack, onGoForward,
    breadcrumbs, onNavigate
}: NavigationProps) => {
    return (
        <div className="bg-gray-100 border-b border-gray-200 p-2 flex items-center gap-2">
            <button
                onClick={onGoBack}
                disabled={!canGoBack}
                className={`p-2 rounded-lg transition-colors ${!canGoBack ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}
            >
                <ArrowLeft size={18} />
            </button>
            <button
                onClick={onGoForward}
                disabled={!canGoForward}
                className={`p-2 rounded-lg transition-colors ${!canGoForward ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600'}`}
            >
                <ArrowRight size={18} />
            </button>

            <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1.5 border border-gray-200 min-w-0">
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.id} className="flex items-center min-w-0">
                        {index > 0 && <ChevronRight size={14} className="text-gray-400 mx-1 flex-shrink-0" />}
                        <button
                            onClick={() => onNavigate(crumb.path)}
                            className="hover:bg-gray-100 px-2 py-0.5 rounded text-sm font-medium text-gray-700 hover:text-ubuntu-orange transition-colors truncate"
                        >
                            {crumb.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
