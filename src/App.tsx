import { AnimatePresence } from 'framer-motion';
import { BootScreen } from './components/os/BootScreen';
import { Desktop } from './components/os/Desktop';
import { Taskbar } from './components/os/Taskbar';
import { WindowFrame } from './components/os/WindowFrame';
import { useOSStore } from './store/useOSStore';
import { CVApp } from './components/apps/CVApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { BrowserApp } from './components/apps/BrowserApp';
import { MailApp } from './components/apps/MailApp';
import { MinesweeperGame } from './components/apps/MinesweeperGame';
import { SudokuGame } from './components/apps/SudokuGame';
import { HtopApp } from './components/apps/HtopApp';
import { AboutApp } from './components/apps/AboutApp';
import { FileExplorerApp } from './components/apps/FileExplorerApp';
import { ProjectsApp } from './components/apps/ProjectsApp';
import { TextEditorApp } from './components/apps/TextEditorApp';

import { LoginScreen } from './components/os/LoginScreen';
import { CookieBanner } from './components/ui/CookieBanner';
import { Dialog } from './components/ui/Dialog';

function App() {
    const { bootState, windows, cookieConsent } = useOSStore();

    // External scripts are now loaded on-demand by the components that need them
    // to improve initial load performance and avoid unnecessary execution.

    return (
        <div className="h-screen w-screen overflow-hidden bg-black text-white selection:bg-ubuntu-orange selection:text-white relative font-ubuntu">
            {/* OS Environment Layer */}
            <AnimatePresence mode="wait">
                {(bootState === 'off' || bootState === 'booting') && (
                    <BootScreen key="boot" />
                )}
                {bootState === 'login' && (
                    <LoginScreen key="login" />
                )}
                {bootState === 'desktop' && (
                    <Desktop key="desktop" />
                )}
            </AnimatePresence>

            {/* UI Overlay Layer */}
            {bootState === 'desktop' && (
                <>
                    <Taskbar />
                    <CookieBanner />
                    <Dialog />

                    {/* Window Manager Layer */}
                    <AnimatePresence>
                        {windows.map((win) => (
                            <WindowFrame key={win.id} window={win}>
                                {win.appType === 'cv' && <CVApp />}
                                {win.appType === 'terminal' && <TerminalApp initialPath={win.params?.path} />}

                                {win.appType === 'settings' && (
                                    <div className="p-10 flex flex-col items-center justify-center h-full text-gray-500 bg-gray-100">
                                        <h2 className="text-2xl font-bold mb-2">Settings</h2>
                                        <p>System configuration is locked by administrator.</p>
                                    </div>
                                )}

                                {win.appType === 'browser' && <BrowserApp />}

                                {win.appType === 'mail' && <MailApp />}

                                {win.appType === 'minesweeper' && <MinesweeperGame />}

                                {win.appType === 'sudoku' && <SudokuGame />}

                                {win.appType === 'htop' && <HtopApp />}

                                {win.appType === 'about' && <AboutApp />}

                                {win.appType === 'explorer' && <FileExplorerApp initialPath={win.params?.path} />}
                                {win.appType === 'projects' && <ProjectsApp />}
                                {win.appType === 'editor' && <TextEditorApp fileId={win.params?.fileId} />}
                            </WindowFrame>
                        ))}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

export default App;
