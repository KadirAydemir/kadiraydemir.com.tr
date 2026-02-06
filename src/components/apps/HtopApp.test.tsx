import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { HtopApp } from './HtopApp';

test('HtopApp renders correctly', () => {
    render(<HtopApp />);

    // Check for header stats
    expect(screen.getByText('Mem')).toBeInTheDocument();
    expect(screen.getByText('Swp')).toBeInTheDocument();
    expect(screen.getByText('Tasks:')).toBeInTheDocument();
    expect(screen.getByText('Load average:')).toBeInTheDocument();
    expect(screen.getByText('Uptime:')).toBeInTheDocument();

    // Check for process list columns
    expect(screen.getByText('PID')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
    expect(screen.getByText('Command')).toBeInTheDocument();

    // Check for footer
    expect(screen.getByText(/F10Quit/)).toBeInTheDocument();
});
