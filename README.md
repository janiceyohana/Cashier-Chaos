# Cashier Chaos - Technical Assessment

This repository contains implementation and fixes for the **Cashier Chaos** game using the `gamez` framework.


## Challenges

- Juggling multiple commitments, not working full-time on this.
- Understanding existing code style and structure required adjustment.
- Desire to add extra features while keeping core functionality working.


## Ideas / Future Enhancements

- Implement ranking system with user accounts to compare scores.
- Make the game fully responsive for all screen sizes.
- Record and show best scores per user.
- Add penalties for wrong answers.
- Enhance timer with warnings when only a few seconds remain.


## What Was Broken

1. **Game Initialization**
   - `GameService` was not properly initialized with a unique game ID.
   - UI did not re-render after state changes.

2. **Game Logic & Session Handling**
   - Core game logic not wrapped in `GameServiceWrapper`.
   - Assets were not preloaded, causing delays or errors.
   - Session results, level progression, and score handling were broken.

3. **Gameplay Issues**
   - Submit button did not validate player input.
   - Customer images did not load due to incorrect paths.
   - Cash register was disabled in later levels.
   - Background images repeated instead of covering the screen.
   - No animations or sound effects for correct/wrong answers.
   - Timer and level reset issues.


## What I Fixed / Implemented

1. **Initialization**
   - Added unique game ID.
   - Wrapped app in `ComponentRefresh` for UI refresh.
   - Initialized game state including `score: 0` and `remainingLives`.

2. **Game Logic**
   - Wrapped core logic with `GameServiceWrapper`.
   - Added `addSessionEndListener` to save reports, progress levels, and refresh UI.
   - Fixed customer image mapping with correct path encoding.
   - Initialized customer index and random sprites correctly.
   - Enabled cash register for all levels.

3. **Gameplay & UI**
   - Implemented SUBMIT button logic to calculate player input and compare to correct change.
   - Added Lottie animations for correct/wrong results with adjustable speed.
   - Added sound effects for actions: note/coin clicks, correct/wrong answers, level completion, game over.
   - Implemented ScoreBoard component to display current score under lives.
   - Added landing page and back icon navigation.
   - Implemented game over modal showing final score.
   - Added confetti lottie for game completion.
   - Added button animations.

4. **Timers**
   - Reset level timer on new levels while keeping score accumulation.
   - Fixed timer reset when advancing to next level.


## Trade-offs & Assumptions

- Instructions show only once per session (`isInstructionsShownAlready`).
- Randomized customer sprites use `useMemo` to avoid mid-round changes.
- Result popup includes 500ms delay for animation feedback.
- Some features like dynamic ranking, cross-device responsiveness, and “Level Completed!” popup are not implemented due to time constraints.
- Minor hook errors remain (e.g., `Invalid hook call`) due to complex useEffect and useMemo setup.


## Todo / Future Work

- Fix infinite loading when restarting after finishing all levels.
- Currently, the game works best on iPhone screens (based on my testing). Need to make it fully responsive for all device sizes.
- Tidy code, consolidate constants and effects.
- Add features like ranking, penalties, and enhanced timer warnings.
- Test thoroughly across scenarios and edge cases.
