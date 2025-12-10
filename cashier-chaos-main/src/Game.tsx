import { CenterLoading, GameServiceProps, GameServiceWrapper, useComponentRefresh } from "gamez";
import { useEffect, useRef, useState } from "react";
import { CashierChaos, emptyCash } from "./CashierChaos";
import { Instructions } from "./components/Instructions";
import { LandingPage } from "./components/LandingPage";
import { GameOverModal } from "./components/GameOverModal";

let isInstructionsShownAlready = false;

function GameComponent({ gs }: GameServiceProps) {
  const [isGameReady, setIsGameReady] = useState(false);
  const [showInstructions, setShowInstruction] = useState(!isInstructionsShownAlready);
  const refresh = useComponentRefresh();
  const [showLanding, setShowLanding] = useState(() => !isInstructionsShownAlready);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [storedScore, setStoredScore] = useState(0);
  const scoreRef = useRef(0);

  //Import audio for gameover
  const gameOverSfx = useRef(new Audio("/sounds/game_over.mp3"));

  //Track score changes
  useEffect(() => {
    if (isGameReady && !gs.isSessionEnded()) {
      try {
        const gameState = gs.getState();
        if (gameState?.score !== undefined) {
          scoreRef.current = gameState.score;
        }
      } catch (e) {
        // Handle error silently
      }
    }
  }, [isGameReady, gs]);

  const handleRestart = () => {
    setShowGameOverModal(false);
    gs.resetSession();
    const firstLevelDetails = gs.getCurrLevelDetails();
    const initialLives = firstLevelDetails?.lives ?? 3;
    gs.initState({
      cash: emptyCash(),
      customer: 1,
      remainingLives: initialLives,
      score: 0,
    });
    setStoredScore(0);
    refresh();

    setIsGameReady(true);
    console.log(isGameReady, "isgameready");
  };

  const handleBackToHome = () => {
    setShowGameOverModal(false);
    gs.resetSession();
    setStoredScore(0);
    setShowLanding(true);
    isInstructionsShownAlready = false;
    setShowInstruction(false);
    setIsGameReady(false);

    console.log(isGameReady, "isgameready");
    refresh();
  };

  useEffect(() => {
    console.log("showGameOverModal changed:", showGameOverModal);
  }, [showGameOverModal]);

  useEffect(() => {
    // wait for assets to be loaded
    gs.preloadAssets()
      .then(() => {
        // initialize state
        gs.initState({
          cash: emptyCash(),
          score: 0,
          customer: 1,
          remainingLives: gs.getCurrLevelDetails().lives,
        });

        gs.addSessionEndListner((result) => {
          const gameState = gs.getState();
          const finalScore = gameState?.score || 0;
          setStoredScore(finalScore);

          const report = gs.collectReport({
            level: gs.getCurrLevel(),
            result,
          });
          gs.saveReport(report);

          // Handle game over
          if (result === "error") {
            gameOverSfx.current.play();
            setGameOverMessage("You ran out of lives!");
            setShowGameOverModal(true); // modal will show on re-render
          } else if (result === "timeout") {
            gameOverSfx.current.play();
            setGameOverMessage("You ran out of time!");
            setShowGameOverModal(true); // modal will show on re-render
          }
          // Handle game completion
          else if (result === "success") {
            if (gs.isGameComplete()) {
              setGameOverMessage("You completed all levels, well done!");
              setShowGameOverModal(true);
            } else {
              // optional: show "level completed" message
              setGameOverMessage("Level completed!");
            }
          }
        });

        setIsGameReady(true);
      })
      .catch(() => {
        // handle asset loading error if needed
      });

    return () => {
      gs.resetSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Landing Page First
  if (showLanding) {
    return (
      <LandingPage
        onNext={() => {
          setShowLanding(false);
          setShowInstruction(true);
        }}
      />
    );
  }

  if (showInstructions) {
    return (
      <Instructions
        onStart={() => (setShowInstruction(false), (isInstructionsShownAlready = true))}
        onBack={() => {
          setShowInstruction(false);
          setShowLanding(true);
        }}
      />
    );
  } else if (!isGameReady) {
    return <CenterLoading />;
  }

  //Wrapping the game logic into GameServiceWrapper
  return (
    <>
      {isGameReady && (
        <GameServiceWrapper gs={gs}>
          <CashierChaos />
        </GameServiceWrapper>
      )}

      {/* Render Game Over modal */}
      {showGameOverModal && (
        <>
          <GameOverModal
            title="Game Over"
            message={gameOverMessage}
            buttonLabel="Restart"
            onRestart={handleRestart}
            onBackToHome={handleBackToHome}
            score={storedScore}
          />
        </>
      )}
    </>
  );
}

// whatever you do just make sure you export this
export default GameComponent;
