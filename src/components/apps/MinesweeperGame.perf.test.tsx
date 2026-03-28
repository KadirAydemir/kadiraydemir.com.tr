import { render, screen, fireEvent, act } from '@testing-library/react';
import { MinesweeperGame } from './MinesweeperGame';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Variable must start with 'mock' for vitest hoisting
const mockGridRender = vi.fn();

vi.mock('./MinesweeperGrid', async () => {
    const React = await import('react');
    return {
        MinesweeperGrid: React.memo((props: any) => {
            mockGridRender(props);
            return (
                <button data-testid="grid-mock" onClick={() => props.onLeftClick(0, 0)}>
                    Mock Grid
                </button>
            );
        })
    };
});

describe('MinesweeperGame Performance', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockGridRender.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not re-render the grid on timer tick', () => {
        render(<MinesweeperGame />);

        // Initial render:
        // 1. Initial state (grid = [])
        // 2. useEffect -> resetGame -> setGrid (grid = populated)
        expect(mockGridRender).toHaveBeenCalledTimes(2);

        mockGridRender.mockClear();

        // Start game (first click)
        const mockGrid = screen.getByTestId('grid-mock');
        fireEvent.click(mockGrid);

        // State update (game status -> playing, grid update with mines) triggers re-render
        expect(mockGridRender).toHaveBeenCalledTimes(1);

        mockGridRender.mockClear();

        // Advance timer by 1 second
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Parent (Game) re-renders due to setTimer.
        // Child (Grid) should NOT re-render because it is memoized and props should be stable.
        expect(mockGridRender).not.toHaveBeenCalled();

        // Advance timer by another second
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Still no re-render
        expect(mockGridRender).not.toHaveBeenCalled();
    });
});
