import { useOSStore } from '../store/useOSStore';

export const useProcess = () => {
    const { openWindow, toggleWindow } = useOSStore();

    const openCV = () => openWindow('cv', 'Kadir Aydemir - CV');
    const toggleCV = () => toggleWindow('cv', 'Kadir Aydemir - CV');

    const openTerminal = () => openWindow('terminal', 'Terminal');
    const toggleTerminal = () => toggleWindow('terminal', 'Terminal');

    const openSettings = () => openWindow('settings', 'Settings');
    const toggleSettings = () => toggleWindow('settings', 'Settings');

    const openBrowser = () => openWindow('browser', 'Internet Browser');
    const toggleBrowser = () => toggleWindow('browser', 'Internet Browser');

    const openMail = () => openWindow('mail', 'Mail');
    const toggleMail = () => toggleWindow('mail', 'Mail');

    const openMinesweeper = () => openWindow('minesweeper', 'Minesweeper');
    const toggleMinesweeper = () => toggleWindow('minesweeper', 'Minesweeper');

    const openSudoku = () => openWindow('sudoku', 'Sudoku');
    const toggleSudoku = () => toggleWindow('sudoku', 'Sudoku');

    const openHtop = () => openWindow('htop', 'htop - interactive process viewer');
    const toggleHtop = () => toggleWindow('htop', 'htop - interactive process viewer');

    const openAbout = () => openWindow('about', 'About System');
    const toggleAbout = () => toggleWindow('about', 'About System');

    const openExplorer = (params?: any) => openWindow('explorer', 'Files', params);
    const toggleExplorer = () => toggleWindow('explorer', 'Files');

    const openProjects = () => openWindow('projects', 'GitHub Projects');
    const toggleProjects = () => toggleWindow('projects', 'GitHub Projects');

    return {
        openCV,
        toggleCV,
        openTerminal,
        toggleTerminal,
        openSettings,
        toggleSettings,
        openBrowser,
        toggleBrowser,
        openMail,
        toggleMail,
        openMinesweeper,
        toggleMinesweeper,
        openSudoku,
        toggleSudoku,
        openHtop,
        toggleHtop,
        openAbout,
        toggleAbout,
        openExplorer,
        toggleExplorer,
        openProjects,
        toggleProjects,
    };
};
