# Cashier Chaos

Cashier Chaos is an interactive React-based game where players take on the role of a cashier. The objective is to correctly calculate and provide change to customers based on the total bill and the amount received.

## 🎮 Game Overview

In Cashier Chaos, you are presented with a series of customers. For each customer:

- You are shown the **Total** amount due.
- You are shown the amount **Received** from the customer (usually $100.00).
- You must calculate the correct **Change** to return.

The game tracks your progress through multiple customers and levels. Be careful, as incorrect calculations can cost you lives!

## ✨ Features

- **Cashier Simulation:** Realistic change calculation scenarios.
- **Dynamic Difficulty:** Handles both dollar and cent amounts.
- **Progression System:** Advance through multiple customers to complete a session.
- **Lives System:** Limited lives add a layer of challenge.
- **Interactive UI:** Built with React and Framer Motion for smooth animations.
- **Responsive Design:** Styled with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (via `gamez` library)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd cashier-chaos
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Game

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal) to play the game.

### Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist` directory.

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components (Highlight, Instructions, TopBar)
├── styles/            # Global and game-specific CSS
├── App.tsx            # Main application component
├── CashierChaos.tsx   # Core game logic and UI
├── Game.tsx           # Game wrapper handling assets and session state
├── index.ts           # Entry point exporting the GameComponent
└── constants.ts       # Game constants
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
