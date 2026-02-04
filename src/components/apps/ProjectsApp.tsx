import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Github, ExternalLink, Star, GitFork, BookOpen, Search, Loader2 } from 'lucide-react';

interface GithubRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    updated_at: string;
}

export const ProjectsApp = () => {
    const { t } = useTranslation();
    const [repos, setRepos] = useState<GithubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await fetch('https://api.github.com/users/kadiraydemir97/repos?sort=updated');
                if (!response.ok) {
                    throw new Error('Failed to fetch repositories');
                }
                const data = await response.json();
                setRepos(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (repo.language && repo.language.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-lg animate-pulse">{t('projects.loading', 'Loading GitHub projects...')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center text-red-500 p-8 text-center">
                <Github size={64} className="mb-4 opacity-20 text-gray-400" />
                <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">{t('projects.errorTitle', 'Connection Error')}</h2>
                <p className="mb-4 opacity-80">{error}</p>
                <button
                    onClick={() => { setLoading(true); window.location.reload(); }}
                    className="px-6 py-2 bg-ubuntu-orange text-white rounded-full hover:bg-ubuntu-orange/90 transition-all font-medium shadow-md"
                >
                    {t('projects.retry', 'Try Again')}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#f7f7f7] text-gray-800 flex flex-col overflow-hidden font-ubuntu">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-black text-white p-2 rounded-lg shadow-inner">
                        <Github size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none mb-1">kadiraydemir97</h1>
                        <p className="text-xs text-gray-500 font-medium">GitHub Repositories</p>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ubuntu-orange transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder={t('projects.search', 'Search projects...')}
                        className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ubuntu-orange/50 w-full md:w-64 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Repos Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRepos.map((repo) => (
                        <a
                            key={repo.id}
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-ubuntu-orange hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <BookOpen size={20} className="text-ubuntu-orange opacity-40 group-hover:opacity-100 transition-opacity" />
                                <ExternalLink size={16} className="text-gray-300 group-hover:text-ubuntu-orange transition-colors" />
                            </div>

                            <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-ubuntu-orange transition-colors truncate">
                                {repo.name}
                            </h3>

                            <p className="text-xs text-gray-600 mb-4 line-clamp-3 flex-1 font-ubuntu leading-relaxed">
                                {repo.description || 'No description available for this project.'}
                            </p>

                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-auto pt-4 border-t border-gray-50">
                                {repo.language && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-ubuntu-orange/60" />
                                        <span>{repo.language}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 hover:text-yellow-500 transition-colors">
                                    <Star size={12} />
                                    <span>{repo.stargazers_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                    <GitFork size={12} />
                                    <span>{repo.forks_count}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {filteredRepos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-ubuntu">{t('projects.noResults', 'No matching projects found.')}</p>
                    </div>
                )}
            </div>

            {/* Sticky Footer Info */}
            <div className="bg-white border-t border-gray-200 px-6 py-3 text-[10px] font-bold text-gray-400 flex items-center justify-between uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>{repos.length} {t('projects.repoCount', 'Repositories Total')}</span>
                </div>
                <span>GitHub API v3</span>
            </div>
        </div>
    );
};
