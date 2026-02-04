import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { FileSystemItem } from '../../types/os';

interface CommandHistory {
    command: string;
    output: React.ReactNode;
    path?: string;
}

interface TerminalAppProps {
    initialPath?: string[];
}

const BOOT_LOGS = [
    "Kadir OS 1.0.0 LTS kadir-virtual-machine tty1",
    "",
    "Login incorrect? No, you're already logged in as root.",
    `Welcome to Kadir OS 1.0.0 (GNU/Linux 5.15.0-generic x86_64)`,
    "",
    " * Documentation:  https://github.com/KadirAydemir/kadiraydemir.com.tr",
    " * Portfolio:      https://kadiraydemir.com.tr",
    " * Contact:        mail@kadiraydemir.com.tr",
    "",
    "Last login: Mon Feb 13 10:00:22 2026 from 192.168.1.5",
];

export const TerminalApp = ({ initialPath = ['home'] }: TerminalAppProps) => {
    const { fileSystem, createItem, updateFileContent, deleteItem, renameItem, showConfirm } = useOSStore();
    const [history, setHistory] = useState<CommandHistory[]>([]);
    const [input, setInput] = useState('');
    const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
    const [editingFile, setEditingFile] = useState<{ id: string; name: string; content: string } | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [isModified, setIsModified] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const lastInitialPathRef = useRef<string | null>(null);

    // Sync path if initialPath changes (e.g. opening another terminal location)
    useEffect(() => {
        const pathKey = initialPath?.join('/');
        if (initialPath && pathKey !== lastInitialPathRef.current) {
            setCurrentPath(initialPath);
            lastInitialPathRef.current = pathKey || null;
        }
    }, [initialPath]);

    // Initial greeting
    useEffect(() => {
        setHistory([{
            command: undefined as any, // Don't show prompt for boot logs
            output: (
                <div className="text-gray-400">
                    {BOOT_LOGS.map((line, i) => <div key={i}>{line}</div>)}
                </div>
            ),
            path: getPathDisplay()
        }]);
    }, []);

    // Scroll to bottom on history change
    useEffect(() => {
        if (!editingFile) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, editingFile]);

    // Focus input on click
    const handleContainerClick = () => {
        if (editingFile) {
            editorRef.current?.focus();
        } else {
            inputRef.current?.focus();
        }
    };

    const resolveNode = (currentFs: FileSystemItem, pathArr: string[]): FileSystemItem | null => {
        let current = currentFs;
        if (pathArr.length === 0) return null;
        if (pathArr[0] !== current.id) return null;

        for (let i = 1; i < pathArr.length; i++) {
            const nextId = pathArr[i];
            const found = current.children?.find(c => c.id === nextId);
            if (found) current = found;
            else return null;
        }
        return current;
    };

    const getCurrentDirectory = () => resolveNode(fileSystem, currentPath);

    const getPathDisplay = () => {
        let currentNode = fileSystem;
        const resolvedNames: string[] = [];

        if (currentPath.length > 0 && currentPath[0] === fileSystem.id) {
            resolvedNames.push('home');
        } else {
            resolvedNames.push('?');
        }

        for (let i = 1; i < currentPath.length; i++) {
            const nextId = currentPath[i];
            const child = currentNode.children?.find(c => c.id === nextId);
            if (child) {
                resolvedNames.push(child.name);
                currentNode = child;
            } else {
                resolvedNames.push(nextId);
            }
        }

        let pathStr = '/' + resolvedNames.join('/');
        return pathStr.replace('/home', '/home/kadir');
    };

    const handleCommand = () => {
        const cmd = input.trim();
        const pathAtExecution = getPathDisplay();

        if (!cmd) {
            setHistory(prev => [...prev, { command: '', output: null, path: pathAtExecution }]);
            setInput('');
            return;
        }

        let output: React.ReactNode;
        const args = cmd.split(' ');
        const commandName = args[0].toLowerCase();
        const currentDir = getCurrentDirectory();

        switch (commandName) {
            case 'help':
                output = (
                    <div>
                        Available commands:
                        <ul className="list-disc pl-5 mt-1">
                            <li>help - Show this help message</li>
                            <li>ls - List directory contents</li>
                            <li>cd [dir] - Change directory</li>
                            <li>pwd - Print working directory</li>
                            <li>cat [file] - View file content</li>
                            <li>nano [file] - Edit file</li>
                            <li>mkdir [name] - Create directory</li>
                            <li>touch [name] - Create empty file</li>
                            <li>rm [name] - Remove file or directory</li>
                            <li>clear - Clear terminal</li>
                            <li>whoami - Display current user</li>
                        </ul>
                    </div>
                );
                break;
            case 'ls':
                if (currentDir && currentDir.children) {
                    output = (
                        <div className="flex flex-wrap gap-4">
                            {currentDir.children.map(child => (
                                <span key={child.id} className={child.type === 'folder' ? "text-blue-400 font-bold" : "text-white"}>
                                    {child.name}{child.type === 'folder' ? '/' : ''}
                                </span>
                            ))}
                        </div>
                    );
                } else {
                    output = "Directory is empty or invalid.";
                }
                break;
            case 'pwd':
                output = getPathDisplay();
                break;
            case 'cd':
                if (!args[1] || args[1] === '~') {
                    setCurrentPath(['home']);
                } else if (args[1] === '..') {
                    if (currentPath.length > 1) {
                        setCurrentPath(prev => prev.slice(0, -1));
                    }
                } else if (args[1] === '/') {
                    setCurrentPath(['home']);
                } else {
                    // Search for folder in current directory
                    const target = currentDir?.children?.find(c => c.name === args[1] || c.id === args[1]);
                    if (target && target.type === 'folder') {
                        setCurrentPath(prev => [...prev, target.id]);
                        // Wait, handling folder rename/id mismatches? 
                        // The resolveNode uses IDs. But user types Names.
                        // I should find by Name first, then push ID.
                        // If I push ID, path remains valid.
                    } else if (target && target.type !== 'folder') {
                        output = `bash: cd: ${args[1]}: Not a directory`;
                    } else {
                        output = `bash: cd: ${args[1]}: No such file or directory`;
                    }
                }
                break;
            case 'cat':
                if (!args[1]) {
                    output = "Usage: cat [filename]";
                } else if (args[1] === '>' && args[2]) {
                    // Handle cat > filename (create/overwrite)
                    // But simplistic one-line support or multiline? 
                    // Let's defer "cat >" and just suggest nano.
                    output = "Interactive redirection not supported. Use 'nano " + args[2] + "' to create/edit files.";
                } else {
                    const file = currentDir?.children?.find(c => c.name === args[1] || c.id === args[1]);
                    if (file && file.type === 'file') {
                        output = (
                            <div className="whitespace-pre-wrap">
                                {file.content || ''}
                                <div className="mt-2 text-gray-500 text-xs italic">[End of file. Run 'nano {args[1]}' to edit]</div>
                            </div>
                        );
                    } else if (file && file.type === 'folder') {
                        output = `cat: ${args[1]}: Is a directory`;
                    } else {
                        output = `cat: ${args[1]}: No such file or directory`;
                    }
                }
                break;
            case 'nano':
            case 'edit':
                if (!args[1]) {
                    output = "Usage: nano [filename]";
                } else {
                    const fileName = args[1];
                    const existingFile = currentDir?.children?.find(c => c.name === fileName || c.id === fileName);

                    if (existingFile && existingFile.type === 'folder') {
                        output = `nano: ${fileName}: Is a directory`;
                    } else if (existingFile) {
                        // Open existing
                        setEditingFile({ id: existingFile.id, name: existingFile.name, content: existingFile.content || '' });
                        setEditorContent(existingFile.content || '');
                        // We don't return here, we set state. The render will change.
                        // But we also need to clear input/history or just switch view?
                        // Let's clear input.
                        // We can leave history as is, so when they exit, they see where they were.
                    } else {
                        // Create new file
                        // We'll create it on save.
                        // For now, mockup an ID? No, we need to know it's new.
                        setEditingFile({ id: 'NEW_FILE', name: fileName, content: '' });
                        setEditorContent('');
                    }
                }
                break;
            case 'mkdir':
                if (!args[1]) {
                    output = "Usage: mkdir [directory_name]";
                } else {
                    createItem(currentDir!.id, { name: args[1], type: 'folder' });
                    output = "";
                }
                break;
            case 'touch':
                if (!args[1]) {
                    output = "Usage: touch [filename]";
                } else {
                    createItem(currentDir!.id, { name: args[1], type: 'file', extension: 'txt', content: '' });
                    output = "";
                }
                break;
            case 'rm':
                if (!args[1]) {
                    output = "Usage: rm [filename]";
                } else {
                    const target = currentDir?.children?.find(c => c.name === args[1] || c.id === args[1]);
                    if (target) {
                        if (target.isSystem) {
                            output = `rm: cannot remove '${args[1]}': Permission denied`;
                        } else {
                            deleteItem(target.id);
                            output = "";
                        }
                    } else {
                        output = `rm: cannot remove '${args[1]}': No such file or directory`;
                    }
                }
                break;
            case 'whoami':
                output = "kadir";
                break;
            case 'clear':
                setHistory([]);
                setInput('');
                return;
            case 'exit':
                output = "Use the window controls to close this terminal.";
                break;
            case 'sudo':
                output = "kadir is not in the sudoers file. This incident will be reported.";
                break;
            default:
                output = `${commandName}: command not found`;
        }

        if (!editingFile) {
            setHistory(prev => [...prev, { command: cmd, output, path: pathAtExecution }]);
        }
        setInput('');
    };

    const handleSave = () => {
        if (!editingFile || !getCurrentDirectory()) return;

        if (editingFile.id === 'NEW_FILE') {
            createItem(getCurrentDirectory()!.id, {
                name: editingFile.name,
                type: 'file',
                extension: editingFile.name.split('.').pop() || 'txt',
                content: editorContent
            });
        } else {
            updateFileContent(editingFile.id, editorContent);
        }

        setHistory(prev => [...prev, {
            command: `nano ${editingFile.name}`,
            output: `Wrote ${editorContent.trim() === '' ? 0 : editorContent.split('\n').length} lines to ${editingFile.name}`,
            path: getPathDisplay()
        }]);

        setIsModified(false);
        setEditingFile(null);
        setEditorContent('');
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
        setEditingFile(null);
        setEditorContent('');
        setIsModified(false);
    };

    if (editingFile) {
        return (
            <div className="w-full h-full bg-[#300a24] text-white font-mono flex flex-col" onClick={handleContainerClick}>
                <div className="bg-gray-800 text-white px-2 py-1 text-sm flex justify-between items-center">
                    <span>GNU nano 5.4</span>
                    <span>{editingFile.name}</span>
                    <span className={isModified ? "text-yellow-400 font-bold" : ""}>
                        {isModified ? '[Modified]' : ''}
                    </span>
                </div>
                <textarea
                    ref={editorRef}
                    value={editorContent}
                    onChange={(e) => {
                        setEditorContent(e.target.value);
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
    }

    return (
        <div
            className="w-full h-full bg-[#300a24] text-white font-mono p-2 overflow-y-auto text-sm"
            onClick={handleContainerClick}
        >
            {history.map((item, idx) => (
                <div key={idx} className="mb-1">
                    {item.command !== undefined && (
                        <div className="flex gap-2">
                            <span className="text-green-500 font-bold">kadir@os:</span>
                            <span className="text-blue-400 font-bold">{item.path}</span>
                            <span className="text-white">$</span>
                            <span>{item.command}</span>
                        </div>
                    )}
                    <div>{item.output}</div>
                </div>
            ))}

            <div className="flex gap-2">
                <span className="text-green-500 font-bold">kadir@os:</span>
                <span className="text-blue-400 font-bold">{getPathDisplay()}</span>
                <span className="text-white">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCommand();
                        }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0"
                    autoFocus
                    autoComplete="off"
                />
            </div>
            <div ref={bottomRef} />
        </div>
    );
};
