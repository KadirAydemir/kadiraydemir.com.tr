import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TerminalApp } from './TerminalApp';
import React from 'react';

// Mock scrollIntoView and confirm
window.HTMLElement.prototype.scrollIntoView = function () { };
window.confirm = () => true;

describe('TerminalApp', () => {
    it('renders initial boot logs', () => {
        render(<TerminalApp />);
        expect(screen.getByText(/Kadir OS 1.0.0 LTS/i)).toBeInTheDocument();
        expect(screen.getByText('kadir@os:')).toBeInTheDocument();
    });

    it('displays help command output', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'help{enter}');

        expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();
        expect(screen.getByText(/nano \[file\] - Edit file/i)).toBeInTheDocument();
    });

    it('displays ls command output', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'ls{enter}');

        expect(screen.getByText(/Desktop\//)).toBeInTheDocument();
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
        expect(screen.getByText('kadir@os:')).toBeInTheDocument();
    });

    it('opens nano and handles shortcuts', async () => {
        const user = userEvent.setup();
        render(<TerminalApp />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'nano test.txt{enter}');

        // Nano header should be visible
        expect(screen.getByText(/GNU nano 5.4/i)).toBeInTheDocument();
        expect(screen.getByText('test.txt')).toBeInTheDocument();

        // Type some content - focus the textarea
        const textareas = screen.getAllByRole('textbox');
        const textarea = textareas.find(t => t.tagName === 'TEXTAREA') || textareas[0];
        await user.type(textarea, 'Hello World');

        // Test Ctrl+S (Save & Exit)
        await user.keyboard('{Control>}s{/Control}');

        // Back to terminal
        expect(screen.queryByText(/GNU nano 5.4/i)).not.toBeInTheDocument();
        expect(screen.getAllByText('kadir@os:').length).toBeGreaterThan(0);
    });
});
