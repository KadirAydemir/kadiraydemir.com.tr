import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TerminalApp } from './TerminalApp';
import React from 'react';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

describe('TerminalApp', () => {
    it('renders initial boot logs', () => {
        render(<TerminalApp />);
        expect(screen.getByText(/Kadir OS 1.0.0 LTS/i)).toBeInTheDocument();
        expect(screen.getByText(/kadir@os:~\$/i)).toBeInTheDocument();
    });

    it('displays help command output', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'help{enter}');

        expect(screen.getByText(/Available commands: help, ls, cat/i)).toBeInTheDocument();
    });

    it('displays ls command output', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'ls{enter}');

        expect(screen.getByText('Desktop/')).toBeInTheDocument();
        expect(screen.getByText('cv.json')).toBeInTheDocument();
    });

    it('handles unknown commands', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'foobar{enter}');

        expect(screen.getByText('foobar: command not found')).toBeInTheDocument();
    });

    it('clears the screen', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'clear{enter}');

        // Boot logs should be gone
        expect(screen.queryByText(/Kadir OS 1.0.0 LTS/i)).not.toBeInTheDocument();
        // But prompt should be there
        expect(screen.getByText(/kadir@os:~\$/i)).toBeInTheDocument();
    });
});
