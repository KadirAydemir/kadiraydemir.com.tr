import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SudokuGame } from './SudokuGame';
import React from 'react';

describe('SudokuGame', () => {
    it('renders correctly with default settings', () => {
        render(<SudokuGame />);

        expect(screen.getByText(/sudokuGame.title/)).toBeInTheDocument();
        expect(screen.getByText('sudokuGame.newGame')).toBeInTheDocument();

        // Difficulty selector
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('medium'); // Default is medium

        // Grid should be present (6x6 = 36 cells)
        const cells = screen.getAllByRole('button').filter(b =>
            // Filter grid cells by checking if they contain text (numbers) or are empty
            // The controls also use buttons, so we need to filter carefully.
            // Grid cells have 'w-14 h-14' class.
            b.className.includes('w-14 h-14')
        );
        expect(cells).toHaveLength(36);
    });

    it('changes difficulty', () => {
        render(<SudokuGame />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'hard' } });

        expect(select).toHaveValue('hard');
        // We could check if the board reset, but that's harder to observe without state access.
    });

    it('selects a cell and enters a number', () => {
        render(<SudokuGame />);

        const cells = screen.getAllByRole('button').filter(b => b.className.includes('w-14 h-14'));

        // Find an empty cell (non-fixed)
        // Fixed cells have text-gray-900, mutable have text-ubuntu-orange (or are empty)
        // Let's find one that is empty first (might be hard if random)
        // OR we can just click one and try to type. If it's fixed, it won't change.
        // But we want to test that it DOES change.

        // We can look for a cell with no text content.
        const emptyCell = cells.find(c => !c.textContent);

        if (emptyCell) {
            fireEvent.click(emptyCell);

            // Check if selected style applied (bg-ubuntu-orange/30)
            expect(emptyCell.className).toContain('bg-ubuntu-orange/30');

            // Press '1'
            fireEvent.keyDown(window, { key: '1' });

            // Should now contain '1'
            expect(emptyCell).toHaveTextContent('1');
        } else {
            // Should theoretically be empty cells in a new game
            throw new Error('No empty cells found in new game');
        }
    });

    it('toggles note mode and adds notes', () => {
        render(<SudokuGame />);

        // Click Note button
        const noteBtn = screen.getByText('sudokuGame.notesOff');
        fireEvent.click(noteBtn);

        // Should now say "Notes On" (key: sudokuGame.notesOn)
        expect(screen.getByText('sudokuGame.notesOn')).toBeInTheDocument();

        const cells = screen.getAllByRole('button').filter(b => b.className.includes('w-14 h-14'));
        const emptyCell = cells.find(c => !c.textContent);

        if (emptyCell) {
            fireEvent.click(emptyCell);

            // Add note '1'
            fireEvent.keyDown(window, { key: '1' });

            // Should contain '1' but in note style (small text)
            // The component renders notes in a grid of divs
            expect(emptyCell).toHaveTextContent('1'); // The note text is inside

            // Add note '2'
            fireEvent.keyDown(window, { key: '2' });
             expect(emptyCell).toHaveTextContent('1');
             expect(emptyCell).toHaveTextContent('2');
        }
    });

    it('erases a number', () => {
        render(<SudokuGame />);

        const cells = screen.getAllByRole('button').filter(b => b.className.includes('w-14 h-14'));
        const emptyCell = cells.find(c => !c.textContent);

        if (emptyCell) {
            fireEvent.click(emptyCell);
            fireEvent.keyDown(window, { key: '1' });
            expect(emptyCell).toHaveTextContent('1');

            // Click erase button
            const eraseBtn = screen.getByText('sudokuGame.erase');
            fireEvent.click(eraseBtn);

            expect(emptyCell).not.toHaveTextContent('1');

            // OR use Backspace
            fireEvent.keyDown(window, { key: '1' });
            expect(emptyCell).toHaveTextContent('1');
            fireEvent.keyDown(window, { key: 'Backspace' });
            expect(emptyCell).not.toHaveTextContent('1');
        }
    });

    it('uses a hint', () => {
        render(<SudokuGame />);

        const cells = screen.getAllByRole('button').filter(b => b.className.includes('w-14 h-14'));
        const emptyCell = cells.find(c => !c.textContent);

        if (emptyCell) {
            fireEvent.click(emptyCell);

            const hintBtn = screen.getByText('sudokuGame.hint');
            fireEvent.click(hintBtn);

            // Should now be filled (with correct number) and fixed
            expect(emptyCell.textContent).toBeTruthy();

            // Hints used count should increase
            // Text is `sudokuGame.hints` with count.
            // Since we mocked t(key) -> key, `t('sudokuGame.hints', { count: 1 })` might return just key if mock doesn't handle interpolation?
            // Wait, my mock: `t: (key: string) => key`. It ignores second arg.
            // So text will be just `sudokuGame.hints`.
            // But initially it was also `sudokuGame.hints`.
            // So we can't observe the change in text if it's just the key.

            // However, the component renders:
            // <span className="text-sm">{t('sudokuGame.hints', { count: hintsUsed })}</span>

            // If I want to test this, I might need a smarter mock or check something else.
            // But checking the cell is filled is enough for functionality.
        }
    });
});
