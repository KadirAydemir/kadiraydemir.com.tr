# Kadir Aydemir Web OS

A personal portfolio website built as a web-based operating system simulation, heavily inspired by Ubuntu Linux. This project showcases web development skills using React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Desktop Environment**: Ubuntu-themed desktop interface with a taskbar, start menu (Applications), and system tray.
- **Window Management**: Draggable, resizable, and minimizable windows using `react-draggable`.
- **Boot Sequence**: Realistic boot screen and login simulation.
- **Applications**:
  - **CV / Resume**: View the interactive resume.
  - **Terminal**: A functional terminal emulator.
  - **Browser**: An iframe-based browser simulation.
  - **Mail**: Contact form/email interface.
  - **Games**: Minesweeper and Sudoku.
  - **Htop**: System resource monitor simulation.
  - **About**: Project information.
- **Animations**: Smooth transitions and effects powered by `framer-motion`.
- **State Management**: Global state management for windows and OS status using `zustand`.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kadiraydemir/kadiraydemir-web-os.git
   cd kadiraydemir-web-os
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🔨 Build

To build the project for production:

```bash
npm run build
```

This will generate the static files in the `dist` directory.

## 📄 License

This project is a personal portfolio.
