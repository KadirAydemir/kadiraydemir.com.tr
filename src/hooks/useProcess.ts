import { useCallback } from 'react';
import { useOSStore } from '../store/useOSStore';

export const useProcess = () => {
    const { openWindow, toggleWindow } = useOSStore();

    const openCV = useCallback(() => openWindow('cv', 'Kadir Aydemir - CV'), [openWindow]);
    const toggleCV = useCallback(() => toggleWindow('cv', 'Kadir Aydemir - CV'), [toggleWindow]);

    const openTerminal = useCallback(() => openWindow('terminal', 'Terminal'), [openWindow]);
    const toggleTerminal = useCallback(() => toggleWindow('terminal', 'Terminal'), [toggleWindow]);

    const openSettings = useCallback(() => openWindow('settings', 'Settings'), [openWindow]);
    const toggleSettings = useCallback(() => toggleWindow('settings', 'Settings'), [toggleWindow]);

    const openBrowser = useCallback(() => openWindow('browser', 'Internet Browser'), [openWindow]);
    const toggleBrowser = useCallback(() => toggleWindow('browser', 'Internet Browser'), [toggleWindow]);

    const openMail = useCallback(() => openWindow('mail', 'Mail'), [openWindow]);
    const toggleMail = useCallback(() => toggleWindow('mail', 'Mail'), [toggleWindow]);

    const openMinesweeper = useCallback(() => openWindow('minesweeper', 'Minesweeper'), [openWindow]);
    const toggleMinesweeper = useCallback(() => toggleWindow('minesweeper', 'Minesweeper'), [toggleWindow]);

    const openSudoku = useCallback(() => openWindow('sudoku', 'Sudoku'), [openWindow]);
    const toggleSudoku = useCallback(() => toggleWindow('sudoku', 'Sudoku'), [toggleWindow]);

    const openHtop = useCallback(() => openWindow('htop', 'htop - interactive process viewer'), [openWindow]);
    const toggleHtop = useCallback(() => toggleWindow('htop', 'htop - interactive process viewer'), [toggleWindow]);

    const openAbout = useCallback(() => openWindow('about', 'About System'), [openWindow]);
    const toggleAbout = useCallback(() => toggleWindow('about', 'About System'), [toggleWindow]);

    const openExplorer = useCallback((params?: any) => openWindow('explorer', 'Files', params), [openWindow]);
    const toggleExplorer = useCallback(() => toggleWindow('explorer', 'Files'), [toggleWindow]);

    const openProjects = useCallback(() => openWindow('projects', 'GitHub Projects'), [openWindow]);
    const toggleProjects = useCallback(() => toggleWindow('projects', 'GitHub Projects'), [toggleWindow]);

    const openEditor = useCallback((title: string, params?: any) => openWindow('editor', title, params), [openWindow]);
    const toggleEditor = useCallback((title: string) => toggleWindow('editor', title), [toggleWindow]);

    return {
        openWindow,
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
        openEditor,
        toggleEditor,
    };
};
