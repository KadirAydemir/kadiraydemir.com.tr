import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Flag, Trophy, Bomb } from 'lucide-react';
import { MinesweeperGrid } from './MinesweeperGrid';

type Difficulty = 'easy' | 'medium' | 'hard';
type CellState = 'hidden' | 'revealed' | 'flagged';
type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

interface Cell {
    isMine: boolean;
    neighborMines: number;
    state: CellState;
}

interface DifficultyConfig {
    rows: number;
    cols: number;
    mines: number;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 },
};

export const MinesweeperGame = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    const [timer, setTimer] = useState(0);
    const [flagCount, setFlagCount] = useState(0);
    const [firstClick, setFirstClick] = useState(true);
    const { t } = useTranslation();

    const config = DIFFICULTIES[difficulty];

    // Initialize empty grid
    const initializeGrid = useCallback(() => {
        const newGrid: Cell[][] = [];
        for (let row = 0; row < config.rows; row++) {
            newGrid[row] = [];
            for (let col = 0; col < config.cols; col++) {
                newGrid[row][col] = {
                    isMine: false,
                    neighborMines: 0,
                    state: 'hidden',
                };
            }
        }
        return newGrid;
    }, [config]);

    // Place mines avoiding first click position
    const placeMines = useCallback((grid: Cell[][], firstRow: number, firstCol: number) => {
        let minesPlaced = 0;
        const newGrid = grid;

        while (minesPlaced < config.mines) {
            const row = Math.floor(Math.random() * config.rows);
            const col = Math.floor(Math.random() * config.cols);

            // Don't place mine on first click or if already has mine
            if ((row === firstRow && col === firstCol) || newGrid[row][col].isMine) {
                continue;
            }

            newGrid[row][col].isMine = true;
            minesPlaced++;
        }

        // Calculate neighbor mines
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                if (!newGrid[row][col].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (
                                newRow >= 0 &&
                                newRow < config.rows &&
                                newCol >= 0 &&
                                newCol < config.cols &&
                                newGrid[newRow][newCol].isMine
                            ) {
                                count++;
                            }
                        }
                    }
                    newGrid[row][col].neighborMines = count;
                }
            }
        }

        return newGrid;
    }, [config]);

    // Flood fill for empty cells
    const revealCell = useCallback((grid: Cell[][], row: number, col: number): Cell[][] => {
        if (
            row < 0 ||
            row >= config.rows ||
            col < 0 ||
            col >= config.cols ||
            grid[row][col].state !== 'hidden'
        ) {
            return grid;
        }

        const newGrid = grid;
        const stack = [[row, col]];

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) continue;
            const [r, c] = current;

            if (
                r < 0 ||
                r >= config.rows ||
                c < 0 ||
                c >= config.cols ||
                newGrid[r][c].state !== 'hidden'
            ) {
                continue;
            }

            newGrid[r][c].state = 'revealed';

            // If no neighbor mines, reveal neighbors iteratively
            if (newGrid[r][c].neighborMines === 0 && !newGrid[r][c].isMine) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr !== 0 || dc !== 0) {
                            stack.push([r + dr, c + dc]);
                        }
                    }
                }
            }
        }

        return newGrid;
    }, [config]);

    // Check win condition
    const checkWin = useCallback((grid: Cell[][]) => {
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const cell = grid[row][col];
                if (!cell.isMine && cell.state !== 'revealed') {
                    return false;
                }
            }
        }
        return true;
    }, [config]);

    // Handle left click
    const handleLeftClick = useCallback((row: number, col: number) => {
        if (gameStatus === 'won' || gameStatus === 'lost') return;

        setGrid(prevGrid => {
            let newGrid = prevGrid.map(r => r.map(c => ({ ...c })));

            // First click - place mines
            if (firstClick) {
                newGrid = placeMines(newGrid, row, col);
                setFirstClick(false);
                setGameStatus('playing');
            }

            const cell = newGrid[row][col];

            if (cell.state === 'flagged') return prevGrid;

            if (cell.isMine) {
                // Game over - reveal all mines
                newGrid = newGrid.map(r =>
                    r.map(c => ({
                        ...c,
                        state: c.isMine ? 'revealed' : c.state,
                    }))
                );
                setGameStatus('lost');
                return newGrid;
            }

            newGrid = revealCell(newGrid, row, col);

            // Check win
            if (checkWin(newGrid)) {
                setGameStatus('won');
            }

            return newGrid;
        });
    }, [gameStatus, firstClick, placeMines, revealCell, checkWin]);

    // Handle right click (flag)
    const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        if (gameStatus === 'won' || gameStatus === 'lost') return;

        setGrid(prevGrid => {
            const newGrid = prevGrid.map(r => r.map(c => ({ ...c })));
            const cell = newGrid[row][col];

            if (cell.state === 'revealed') return prevGrid;

            if (cell.state === 'hidden') {
                cell.state = 'flagged';
                setFlagCount(prev => prev + 1);
            } else if (cell.state === 'flagged') {
                cell.state = 'hidden';
                setFlagCount(prev => prev - 1);
            }

            return newGrid;
        });
    }, [gameStatus]);

    // Reset game
    const resetGame = useCallback(() => {
        setGrid(initializeGrid());
        setGameStatus('idle');
        setTimer(0);
        setFlagCount(0);
        setFirstClick(true);
    }, [initializeGrid]);

    // Timer
    useEffect(() => {
        if (gameStatus === 'playing') {
            const interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameStatus]);

    // Initialize on mount or difficulty change
    useEffect(() => {
        resetGame();
    }, [difficulty, resetGame]);

    return (
        <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-auto">
            <div className="flex flex-col items-center justify-center min-h-full p-4">
                {/* Header */}
                <div className="w-full max-w-2xl mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Bomb className="text-red-600" size={24} />
                            {t('minesweeperGame.title')}
                        </h1>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="px-3 py-1.5 border-2 border-gray-300 rounded-lg bg-white text-gray-800 font-semibold cursor-pointer hover:border-ubuntu-orange transition-colors text-sm"
                        >
                            <option value="easy">{t('minesweeperGame.easy')}</option>
                            <option value="medium">{t('minesweeperGame.medium')}</option>
                            <option value="hard">{t('minesweeperGame.hard')}</option>
                        </select>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-2 rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                            <Flag className="text-ubuntu-orange" size={18} />
                            <span className="text-lg font-mono font-bold">
                                {config.mines - flagCount}
                            </span>
                        </div>
                        <button
                            onClick={resetGame}
                            className="px-4 py-1.5 bg-ubuntu-orange hover:bg-orange-600 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                        >
                            <RotateCcw size={16} />
                            {t('minesweeperGame.newGame')}
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-mono font-bold">
                                {String(timer).padStart(3, '0')}
                            </span>
                            <span className="text-xs">{t('minesweeperGame.sec')}</span>
                        </div>
                    </div>
                </div>

                {/* Game Grid */}
                <div className="relative bg-white p-3 rounded-lg shadow-2xl">
                    <MinesweeperGrid
                        grid={grid}
                        difficulty={difficulty}
                        config={config}
                        onLeftClick={handleLeftClick}
                        onRightClick={handleRightClick}
                    />

                    {/* Game Over Overlay */}
                    {(gameStatus === 'won' || gameStatus === 'lost') && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
                            {gameStatus === 'won' ? (
                                <>
                                    <Trophy className="text-yellow-400 mb-4" size={64} />
                                    <h2 className="text-4xl font-bold text-white mb-2">{t('minesweeperGame.win')}</h2>
                                    <p className="text-xl text-gray-300 mb-6">{t('minesweeperGame.time', { time: timer })}</p>
                                </>
                            ) : (
                                <>
                                    <Bomb className="text-red-500 mb-4" size={64} />
                                    <h2 className="text-4xl font-bold text-white mb-2">{t('minesweeperGame.gameOver')}</h2>
                                    <p className="text-xl text-gray-300 mb-6">{t('minesweeperGame.betterLuck')}</p>
                                </>
                            )}
                            <button
                                onClick={resetGame}
                                className="px-6 py-3 bg-ubuntu-orange hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={20} />
                                {t('minesweeperGame.playAgain')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-6 text-center text-sm text-gray-600 max-w-md">
                    <p className="mb-1">{t('minesweeperGame.clickReveal')}</p>
                    <p className="mb-1">{t('minesweeperGame.clickFlag')}</p>
                    <p>{t('minesweeperGame.numbersHint')}</p>
                </div>
            </div>
        </div>
    );
};
