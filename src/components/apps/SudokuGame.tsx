import { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Lightbulb, Eraser, Edit3, Trophy } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type CellValue = number | null;
type NoteSet = Set<number>;

interface Cell {
    value: CellValue;
    isFixed: boolean;
    notes: NoteSet;
    isError: boolean;
}

const GRID_SIZE = 6;
const BOX_ROWS = 2;
const BOX_COLS = 3;

const DIFFICULTIES: Record<Difficulty, number> = {
    easy: 15,
    medium: 20,
    hard: 24,
    expert: 28,
};

interface SudokuBoardProps {
    grid: Cell[][];
    selectedCell: [number, number] | null;
    onCellSelect: (row: number, col: number) => void;
}

const SudokuBoard = memo(({ grid, selectedCell, onCellSelect }: SudokuBoardProps) => {
    return (
        <div className="grid grid-cols-6 gap-0 border-4 border-gray-800">
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
                    const isHighlighted = selectedCell && (
                        selectedCell[0] === rowIndex ||
                        selectedCell[1] === colIndex ||
                        (Math.floor(selectedCell[0] / BOX_ROWS) === Math.floor(rowIndex / BOX_ROWS) &&
                            Math.floor(selectedCell[1] / BOX_COLS) === Math.floor(colIndex / BOX_COLS))
                    );
                    const isSameNumber = cell.value !== null && selectedCell &&
                        grid[selectedCell[0]][selectedCell[1]].value === cell.value;

                    return (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => onCellSelect(rowIndex, colIndex)}
                            className={`
                                w-14 h-14 flex items-center justify-center relative
                                border border-gray-300 font-bold text-lg
                                transition-colors
                                ${(colIndex + 1) % BOX_COLS === 0 && colIndex !== GRID_SIZE - 1 ? 'border-r-2 border-r-gray-800' : ''}
                                ${(rowIndex + 1) % BOX_ROWS === 0 && rowIndex !== GRID_SIZE - 1 ? 'border-b-2 border-b-gray-800' : ''}
                                ${isSelected ? 'bg-ubuntu-orange/30 ring-2 ring-ubuntu-orange' : ''}
                                ${isHighlighted && !isSelected ? 'bg-blue-100' : ''}
                                ${isSameNumber && !isSelected ? 'bg-blue-200' : ''}
                                ${!isSelected && !isHighlighted && !isSameNumber ? 'bg-white hover:bg-gray-100' : ''}
                                ${cell.isFixed ? 'text-gray-900' : 'text-ubuntu-orange'}
                                ${cell.isError ? 'bg-red-100 text-red-600' : ''}
                            `}
                        >
                            {cell.value !== null ? (
                                cell.value
                            ) : (
                                <div className="grid grid-cols-3 gap-0 text-[10px] text-gray-400 absolute inset-0 p-1">
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <div key={num} className="flex items-center justify-center">
                                            {cell.notes.has(num) ? num : ''}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })
            )}
        </div>
    );
});

export const SudokuGame = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [noteMode, setNoteMode] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const { t } = useTranslation();

    // Generate a solved 6x6 Sudoku grid
    const generateSolvedGrid = useCallback((): number[][] => {
        const grid: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

        const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
            // Check row
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[row][x] === num) return false;
            }

            // Check column
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[x][col] === num) return false;
            }

            // Check 2x3 box
            const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS;
            const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS;
            for (let i = 0; i < BOX_ROWS; i++) {
                for (let j = 0; j < BOX_COLS; j++) {
                    if (grid[boxRow + i][boxCol + j] === num) return false;
                }
            }

            return true;
        };

        const solve = (grid: number[][]): boolean => {
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (grid[row][col] === 0) {
                        const numbers = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
                        for (const num of numbers) {
                            if (isValid(grid, row, col, num)) {
                                grid[row][col] = num;
                                if (solve(grid)) return true;
                                grid[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        solve(grid);
        return grid;
    }, []);

    // Create puzzle by removing numbers
    const createPuzzle = useCallback((solvedGrid: number[][], cellsToRemove: number): Cell[][] => {
        const puzzle: Cell[][] = solvedGrid.map(row =>
            row.map(value => ({
                value,
                isFixed: true,
                notes: new Set<number>(),
                isError: false,
            }))
        );

        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (puzzle[row][col].value !== null) {
                puzzle[row][col].value = null;
                puzzle[row][col].isFixed = false;
                removed++;
            }
        }

        return puzzle;
    }, []);

    // Initialize new game
    const newGame = useCallback(() => {
        const solvedGrid = generateSolvedGrid();
        const puzzle = createPuzzle(solvedGrid, DIFFICULTIES[difficulty]);

        setSolution(solvedGrid);
        setGrid(puzzle);
        setSelectedCell(null);
        setNoteMode(false);
        setTimer(0);
        setIsComplete(false);
        setHintsUsed(0);
    }, [difficulty, generateSolvedGrid, createPuzzle]);

    // Check if number placement is valid
    const isValidPlacement = useCallback((grid: Cell[][], row: number, col: number, num: number): boolean => {
        // Check row
        for (let x = 0; x < GRID_SIZE; x++) {
            if (x !== col && grid[row][x].value === num) return false;
        }

        // Check column
        for (let x = 0; x < GRID_SIZE; x++) {
            if (x !== row && grid[x][col].value === num) return false;
        }

        // Check 2x3 box
        const boxRow = Math.floor(row / BOX_ROWS) * BOX_ROWS;
        const boxCol = Math.floor(col / BOX_COLS) * BOX_COLS;
        for (let i = 0; i < BOX_ROWS; i++) {
            for (let j = 0; j < BOX_COLS; j++) {
                const r = boxRow + i;
                const c = boxCol + j;
                if ((r !== row || c !== col) && grid[r][c].value === num) {
                    return false;
                }
            }
        }

        return true;
    }, []);

    // Handle number input
    const handleNumberInput = useCallback((num: number) => {
        if (!selectedCell || isComplete) return;
        const [row, col] = selectedCell;

        setGrid(prevGrid => {
            if (prevGrid[row][col].isFixed) return prevGrid;

            const newGrid = [...prevGrid];
            newGrid[row] = [...newGrid[row]];

            if (noteMode) {
                newGrid[row][col] = { ...newGrid[row][col], notes: new Set(newGrid[row][col].notes) };
                // Toggle note
                if (newGrid[row][col].notes.has(num)) {
                    newGrid[row][col].notes.delete(num);
                } else {
                    newGrid[row][col].notes.add(num);
                }
            } else {
                newGrid[row][col] = { ...newGrid[row][col], notes: new Set() };
                // Set value
                newGrid[row][col].value = num;
                newGrid[row][col].isError = !isValidPlacement(newGrid, row, col, num);

                // Check if puzzle is complete
                const isFilled = newGrid.every(row => row.every(cell => cell.value !== null));
                const isCorrect = newGrid.every(row => row.every(cell => !cell.isError));

                if (isFilled && isCorrect) {
                    setIsComplete(true);
                }
            }

            return newGrid;
        });
    }, [selectedCell, noteMode, isComplete, isValidPlacement]);

    // Handle erase
    const handleErase = useCallback(() => {
        if (!selectedCell || isComplete) return;
        const [row, col] = selectedCell;

        setGrid(prevGrid => {
            if (prevGrid[row][col].isFixed) return prevGrid;

            const newGrid = [...prevGrid];
            newGrid[row] = [...newGrid[row]];
            newGrid[row][col] = { ...newGrid[row][col], notes: new Set() };

            newGrid[row][col].value = null;
            newGrid[row][col].isError = false;

            return newGrid;
        });
    }, [selectedCell, isComplete]);

    // Handle hint
    const handleHint = useCallback(() => {
        if (!selectedCell || isComplete) return;
        const [row, col] = selectedCell;

        setGrid(prevGrid => {
            if (prevGrid[row][col].isFixed || prevGrid[row][col].value !== null) return prevGrid;

            const newGrid = [...prevGrid];
            newGrid[row] = [...newGrid[row]];
            newGrid[row][col] = { ...newGrid[row][col], notes: new Set() };

            newGrid[row][col].value = solution[row][col];
            newGrid[row][col].isFixed = true;
            newGrid[row][col].isError = false;
            setHintsUsed(prev => prev + 1);

            return newGrid;
        });
    }, [selectedCell, solution, isComplete]);

    const handleCellSelect = useCallback((row: number, col: number) => {
        setSelectedCell([row, col]);
    }, []);

    // Timer
    useEffect(() => {
        if (!isComplete) {
            const interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isComplete]);

    // Initialize on mount or difficulty change
    useEffect(() => {
        newGame();
    }, [difficulty, newGame]);

    // Keyboard input
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key >= '1' && e.key <= '6') {
                handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleErase();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleNumberInput, handleErase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
            <div className="flex flex-col items-center justify-center min-h-full p-4">
                {/* Header */}
                <div className="w-full max-w-lg mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            🔢 {t('sudokuGame.title')}
                        </h1>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="px-3 py-1.5 border-2 border-gray-300 rounded-lg bg-white text-gray-800 font-semibold cursor-pointer hover:border-ubuntu-orange transition-colors text-sm"
                        >
                            <option value="easy">{t('sudokuGame.easy')}</option>
                            <option value="medium">{t('sudokuGame.medium')}</option>
                            <option value="hard">{t('sudokuGame.hard')}</option>
                            <option value="expert">{t('sudokuGame.expert')}</option>
                        </select>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-2 rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-mono font-bold">{formatTime(timer)}</span>
                        </div>
                        <button
                            onClick={newGame}
                            className="px-4 py-1.5 bg-ubuntu-orange hover:bg-orange-600 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                        >
                            <RotateCcw size={16} />
                            {t('sudokuGame.newGame')}
                        </button>
                        <div className="flex items-center gap-2">
                            <Lightbulb size={16} className="text-yellow-400" />
                            <span className="text-sm">{t('sudokuGame.hints', { count: hintsUsed })}</span>
                        </div>
                    </div>
                </div>

                {/* Game Grid */}
                <div className="relative bg-white p-3 rounded-lg shadow-2xl mb-2">
                    <SudokuBoard
                        grid={grid}
                        selectedCell={selectedCell}
                        onCellSelect={handleCellSelect}
                    />

                    {/* Win Overlay */}
                    {isComplete && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
                            <Trophy className="text-yellow-400 mb-4" size={64} />
                            <h2 className="text-4xl font-bold text-white mb-2">{t('sudokuGame.win')}</h2>
                            <p className="text-xl text-gray-300 mb-2">{t('sudokuGame.time', { time: formatTime(timer) })}</p>
                            <p className="text-lg text-gray-400 mb-6">{t('sudokuGame.hintsUsed', { count: hintsUsed })}</p>
                            <button
                                onClick={newGame}
                                className="px-6 py-3 bg-ubuntu-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={20} />
                                {t('sudokuGame.playAgain')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="w-full max-w-lg">
                    {/* Number Buttons */}
                    <div className="grid grid-cols-6 gap-2 mb-2">
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumberInput(num)}
                                className="h-12 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-lg transition-colors"
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setNoteMode(!noteMode)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm ${noteMode
                                ? 'bg-ubuntu-orange text-white'
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                                }`}
                        >
                            <Edit3 size={16} />
                            {noteMode ? t('sudokuGame.notesOn') : t('sudokuGame.notesOff')}
                        </button>
                        <button
                            onClick={handleErase}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Eraser size={16} />
                            {t('sudokuGame.erase')}
                        </button>
                        <button
                            onClick={handleHint}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Lightbulb size={16} />
                            {t('sudokuGame.hint')}
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center text-sm text-gray-600 max-w-md">
                    <p className="mb-1">{t('sudokuGame.clickSelect')}</p>
                    <p className="mb-1">{t('sudokuGame.keyboard')}</p>
                    <p>{t('sudokuGame.notesHint')}</p>
                </div>
            </div>
        </div>
    );
};
