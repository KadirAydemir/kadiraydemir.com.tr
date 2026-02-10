import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TerminalApp } from './TerminalApp';
import * as TerminalUtils from './terminal-utils';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function () { };

describe('TerminalApp Performance', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('memoizes path display during typing', async () => {
        const calculateSpy = vi.spyOn(TerminalUtils, 'calculatePathDisplay');
        const user = userEvent.setup();

        render(<TerminalApp />);

        // Initial render calls it
        const initialCalls = calculateSpy.mock.calls.length;

        const input = screen.getByRole('textbox');
        const textToType = 'echo hello';
        await user.type(input, textToType);

        const afterTypingCalls = calculateSpy.mock.calls.length;
        const diff = afterTypingCalls - initialCalls;

        console.log(`Initial calls: ${initialCalls}`);
        console.log(`Calls after typing '${textToType}': ${afterTypingCalls}`);
        console.log(`Difference: ${diff}`);

        // With memoization, typing shouldn't trigger recalculation
        expect(diff).toBe(0);
    });
});
