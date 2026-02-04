import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Taskbar } from './Taskbar';
import { useOSStore } from '../../store/useOSStore';
import { useSystemStore } from '../../store/useSystemStore';
import React from 'react';

// Mock child components to isolate Taskbar testing
vi.mock('./ApplicationsMenu', () => ({
    ApplicationsMenu: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="apps-menu">Applications Menu Content</div> : null
}));

vi.mock('./SystemMenu', () => ({
    SystemMenu: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="system-menu">System Menu Content</div> : null
}));

vi.mock('./CalendarPopup', () => ({
    CalendarPopup: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="calendar-popup">Calendar Popup Content</div> : null
}));

describe('Taskbar', () => {
    beforeEach(() => {
        useOSStore.setState({
            windows: [],
            activeWindowId: null,
            bootState: 'desktop'
        });
        useSystemStore.setState({
            isWifiOn: true,
            volume: 50,
            brightness: 100
        });
    });

    it('renders the TopBar with time and system icons', () => {
        render(<Taskbar />);

        // "Activities" button
        expect(screen.getByText('system.activities')).toBeInTheDocument();

        // Date/Time
        const dateEl = screen.getByTitle(/, \d{4}/);
        expect(dateEl).toBeInTheDocument();
    });

    it('toggles Calendar Popup', () => {
        render(<Taskbar />);

        const dateEl = screen.getByTitle(/, \d{4}/);

        fireEvent.click(dateEl);
        expect(screen.getByTestId('calendar-popup')).toBeInTheDocument();

        fireEvent.click(dateEl);
        expect(screen.queryByTestId('calendar-popup')).not.toBeInTheDocument();
    });

    it('toggles System Menu', () => {
        render(<Taskbar />);

        // Find system tray by searching for an element that contains system icons.
        // We can use the parent container of the Wifi icon (if we could find it).
        // Since we know the structure in TopBar:
        // <div className="flex items-center gap-2 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors" ...>
        // We can query selector.

        // Note: Using document.querySelector in tests is generally discouraged vs screen queries, but practical here.
        // Let's try to identify by unique classes sequence.
        // 'flex items-center gap-2 hover:bg-white/10' is used for the system tray.

        // To be safer, we can check for child SVGs.
        // But let's stick to the selector for now.
        const systemTray = screen.getByTestId('system-tray');

        fireEvent.click(systemTray);
        expect(screen.getByTestId('system-menu')).toBeInTheDocument();

        fireEvent.click(systemTray);
        expect(screen.queryByTestId('system-menu')).not.toBeInTheDocument();
    });

    it('renders Dock with pinned apps', () => {
        render(<Taskbar />);

        // CV and Browser are pinned.
        // Applications is always there.

        // Note: Use getAllByText because tooltip text might appear elsewhere (unlikely for CV/Browser unless open).
        expect(screen.getAllByText('apps.cv').length).toBeGreaterThan(0);
        expect(screen.getAllByText('apps.browser').length).toBeGreaterThan(0);
        expect(screen.getAllByText('system.applications').length).toBeGreaterThan(0);
    });

    it('opens CV app when clicking CV dock item', () => {
        render(<Taskbar />);

        const cvTooltip = screen.getAllByText('apps.cv').find(el => el.classList.contains('text-xs'));
        expect(cvTooltip).toBeTruthy();

        const dockItem = cvTooltip!.parentElement;
        fireEvent.click(dockItem!);

        const { windows } = useOSStore.getState();
        expect(windows).toHaveLength(1);
        expect(windows[0].appType).toBe('cv');
    });

    it('shows active app indicator in dock', () => {
        // Open Browser
        act(() => {
            useOSStore.getState().openWindow('browser', 'Internet Browser');
        });

        render(<Taskbar />);

        const browserTooltip = screen.getAllByText('apps.browser').find(el => el.classList.contains('text-xs'));
        expect(browserTooltip).toBeTruthy();

        const dockItem = browserTooltip!.parentElement;

        // Check for the indicator div
        // The indicator has 'bg-ubuntu-orange'
        const indicator = dockItem?.querySelector('.bg-ubuntu-orange');
        expect(indicator).toBeTruthy();
    });

    it('shows unpinned open apps in dock', () => {
        act(() => {
            useOSStore.getState().openWindow('terminal', 'Terminal');
        });

        render(<Taskbar />);

        // Terminal text appears in TopBar (text-sm) and Dock Tooltip (text-xs)
        // Also: When window is open, activeAppTitle in TopBar uses translation key `apps.${appType}` which is `apps.terminal`
        // So `apps.terminal` should be present multiple times?
        // Let's check TopBar logic: activeAppTitle = t(`apps.${activeWindow.appType}`)
        // Dock tooltip: t(`apps.${appType}`)

        const dockTooltip = screen.getAllByText('apps.terminal').find(el => el.classList.contains('text-xs'));
        expect(dockTooltip).toBeInTheDocument();

        // Close it
        act(() => {
            useOSStore.getState().closeWindow(useOSStore.getState().windows[0].id);
        });

        // Since component won't re-render automatically from outside store change if we don't use 'act' wrapping correctly around the render...
        // wait, we already rendered.
        // If we update store, the component (Taskbar) is subscribed via useOSStore hook, so it SHOULD re-render.
        // We need to wrap the update in act.

        // Now check if tooltip is gone.
        // Note: queryAllByText might return elements that were there.
        // We expect NO element with 'Terminal' AND class 'text-xs'.

        const dockTooltipAfter = screen.queryAllByText('apps.terminal').find(el => el.classList.contains('text-xs'));
        expect(dockTooltipAfter).toBeUndefined();
    });

    it('opens Applications Menu', () => {
        render(<Taskbar />);

        const appsTooltip = screen.getAllByText('system.applications').find(el => el.classList.contains('text-xs'));
        const dockItem = appsTooltip!.parentElement;

        fireEvent.click(dockItem!);
        expect(screen.getByTestId('apps-menu')).toBeInTheDocument();

        fireEvent.click(dockItem!);
        expect(screen.queryByTestId('apps-menu')).not.toBeInTheDocument();
    });
});
