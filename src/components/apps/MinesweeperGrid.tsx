import { memo, MouseEvent } from 'react';
import { Flag, Bomb } from 'lucide-react';

type CellState = 'hidden' | 'revealed' | 'flagged';

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

interface MinesweeperGridProps {
    grid: Cell[][];
    difficulty: 'easy' | 'medium' | 'hard';
    config: DifficultyConfig;
    onLeftClick: (row: number, col: number) => void;
    onRightClick: (e: MouseEvent, row: number, col: number) => void;
}

const NUMBER_COLORS = [
    '',
    'text-blue-600',
    'text-green-600',
    'text-red-600',
    'text-purple-600',
    'text-yellow-700',
    'text-pink-600',
    'text-gray-800',
    'text-gray-900',
];

export const MinesweeperGrid = memo(({ grid, difficulty, config, onLeftClick, onRightClick }: MinesweeperGridProps) => {
    const cellSize = difficulty === 'hard' ? 'w-5 h-5 text-xs' : 'w-7 h-7 text-sm';

    return (
        <div
            className="grid gap-[1px] bg-gray-400 border-4 border-gray-600"
            style={{
                gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            }}
        >
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => onLeftClick(rowIndex, colIndex)}
                        onContextMenu={(e) => onRightClick(e, rowIndex, colIndex)}
                        className={`
                        ${cellSize}
                        flex items-center justify-center font-bold
                        transition-all
                        ${cell.state === 'hidden'
                                ? 'bg-gray-500 hover:bg-gray-400 shadow-inner'
                                : cell.state === 'flagged'
                                    ? 'bg-gray-500'
                                    : cell.isMine
                                        ? 'bg-red-500'
                                        : 'bg-gray-200'
                            }
                    `}
                    >
                        {cell.state === 'flagged' && (
                            <Flag className="text-ubuntu-orange" size={difficulty === 'hard' ? 12 : 16} />
                        )}
                        {cell.state === 'revealed' && cell.isMine && (
                            <Bomb className="text-white" size={difficulty === 'hard' ? 12 : 16} />
                        )}
                        {cell.state === 'revealed' && !cell.isMine && cell.neighborMines > 0 && (
                            <span className={NUMBER_COLORS[cell.neighborMines]}>
                                {cell.neighborMines}
                            </span>
                        )}
                    </button>
                ))
            )}
        </div>
    );
});
