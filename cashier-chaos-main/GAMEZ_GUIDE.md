# Gamez Library Guide

This guide documents the usage of the `gamez` library. `gamez` is a custom library for managing game state, assets, and sessions in React-based games.

## Core Concepts

The library revolves around the `GameService` class, which acts as the central controller for the game. It handles:

- Asset loading
- Game state management (using Zustand under the hood)
- Session lifecycle (start, end, reset)
- Level progression
- Data reporting

## Setup & Initialization

### 1. Initialize GameService

Create an instance of `GameService` in your entry file (e.g., `App.tsx`).

```typescript
import { GameService, ComponentRefresh } from "gamez";
import { ASSETS, LEVELS } from "./constants";

// Initialize with game ID, level configuration, and asset map
const gs = new GameService("game-id", LEVELS, ASSETS);

// Render the app wrapped in ComponentRefresh for restart capabilities
root.render(
  <ComponentRefresh>
    <GameComponent gs={gs} />
  </ComponentRefresh>
);
```

### 2. Game Component Structure

Your main `GameComponent` should accept `gs` as a prop and handle the session lifecycle.

```typescript
import { GameServiceProps, GameServiceWrapper, CenterLoading } from "gamez";

function GameComponent({ gs }: GameServiceProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Preload Assets
    gs.preloadAssets().then(() => {
      // 2. Start Session
      gs.startSession();

      // 3. Initialize State
      gs.initState({
        // Define your initial game state here
        score: 0,
        // Example: lives: gs.getCurrLevelDetails().lives,
      });

      // 4. Listen for Session End
      gs.addSessionEndListner((result) => {
        const report = gs.collectReport({ level: gs.getCurrLevel(), result });
        gs.saveReport(report);
        // Handle end of session (e.g., show game over screen)
        // Example: gs.nextLevel();
      });

      setIsReady(true);
    });

    return () => gs.resetSession();
  }, []);

  if (!isReady) return <CenterLoading />;

  // Wrap your game logic in GameServiceWrapper to provide context
  return (
    <GameServiceWrapper gs={gs}>
      <YourGameLogic />
    </GameServiceWrapper>
  );
}
```

## GameService API (`gs`)

The `gs` object exposes several methods to control the game.

### State Management

- **`gs.initState(state: object)`**: Sets the initial state for the game session.
- **`gs.updateState(partialState: object)`**: Updates the game state. Merges with existing state.
- **`gs.useGameState()`**: A hook that returns the current reactive game state. Use this inside components to subscribe to state changes.

### Session & Levels

- **`gs.startSession()`**: Marks the beginning of a game session.
- **`gs.endSession(result: string)`**: Ends the session. `result` is usually "success", "error", or "timeout".
- **`gs.resetSession()`**: Cleans up the current session.
- **`gs.getCurrLevel()`**: Returns the current level index.
- **`gs.getCurrLevelDetails()`**: Returns the configuration object for the current level (from the `LEVELS` constant).
- **`gs.nextLevel()`**: Advances the game to the next level.
- **`gs.isGameComplete()`**: Returns `true` if all levels are finished.
- **`gs.isSessionEnded()`**: Returns `true` if the session has ended.

### Assets & Reporting

- **`gs.assets`**: An object containing loaded assets (images, sounds, etc.). Access them by key (e.g., `gs.assets.background`).
- **`gs.preloadAssets()`**: Returns a Promise that resolves when all assets are loaded.
- **`gs.collectReport(data: object)`**: Generates a report object including game data.
- **`gs.saveReport(report: object)`**: Saves the generated report (likely sends it to a backend or parent window).

## Hooks

### `useGameService()`

Returns the `GameService` instance. Must be used within `GameServiceWrapper`.

```typescript
import { useGameService } from "gamez";

const MyComponent = () => {
  const gs = useGameService();
  // ...
};
```

### `useResult()`

Manages the immediate result state of a game action (e.g., showing a correct/incorrect animation).

```typescript
import { useResult } from "gamez/src/hooks/useResult";

const { result, setResult, resetResult } = useResult();

// Usage
setResult("success"); // or "error"
// result is now "success"
resetResult(); // result is now null
```

### `useComponentRefresh()`

Returns a function that, when called, triggers a full reload of the component tree wrapped in `<ComponentRefresh>`. Useful for restarting the game.

```typescript
import { useComponentRefresh } from "gamez";

const refresh = useComponentRefresh();
// Call refresh() to restart
```

## Components

### `<GameServiceWrapper gs={gs}>`

Provider component that makes the `GameService` available to child components via `useGameService`.

### `<ComponentRefresh>`

Wrapper component that enables full game resets.

## Utilities

- **`getRandomNum(max, min)`**: Returns a random integer between `min` and `max`.
- **`formatTime(seconds)`**: Formats seconds into a `MM:SS` string.

## Example Usage Pattern

```typescript
// In a game component
const gs = useGameService();
const { score, ...otherState } = gs.useGameState(); // Reactive state

const handleScore = () => {
  gs.updateState({ score: score + 10 });
};

const handleGameOver = () => {
  gs.endSession("error");
};
```
