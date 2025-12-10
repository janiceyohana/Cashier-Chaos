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
    gs.initState({
      cash: emptyCash(),
      customer: 1,
      remainingLives: gs.getCurrLevelDetails().lives,
      score: 0,
    });
    setStoredScore(0);
    refresh();
  };

  const handleBackToHome = () => {
    setShowGameOverModal(false);
    gs.resetSession();
    setStoredScore(0);
    setShowLanding(true);
    isInstructionsShownAlready = false;
    refresh();
  };

  useEffect(() => {
    // wait for assets to be loaded
    gs.preloadAssets()
      .then(() => {
        // initialState
        gs.initState({
          cash: emptyCash(),
          score: 0,
          customer: 1,
          remainingLives: gs.getCurrLevelDetails().lives,
        });

        gs.addSessionEndListner((result) => {
          // do something when the session ends (e.g., display results, save data)

          const gameState = gs.getState();
          const finalScore = gameState?.score || 0;
          setStoredScore(finalScore);
          console.log("Storing score:", finalScore);

          const report = gs.collectReport({
            level: gs.getCurrLevel(),
            result,
          });

          gs.saveReport(report);

          if (result === "error") {
            gameOverSfx.current.play();
            setGameOverMessage("You ran out of lives!");
            setShowGameOverModal(true);
          } else if (result === "success") {
            if (gs.isGameComplete()) {
              //Finished all levels
              gameOverSfx.current.play();
              setGameOverMessage("You completed all levels, well done!");
              setShowGameOverModal(true);
              refresh();
            }
          }
        });

        setIsGameReady(true);
      })
      .catch(() => {
        // handle asset loading error
        // alert("error");
      });

    return () => {
      // reset the game when component unmounts
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
      {!gs.isGameComplete() && (
        <GameServiceWrapper gs={gs}>
          <CashierChaos />
        </GameServiceWrapper>
      )}

      {/* Render Game Over modal */}
      {(showGameOverModal || gs.isGameComplete()) && (
        <GameOverModal
          title="Game Over"
          message={gameOverMessage}
          buttonLabel="Restart"
          onRestart={handleRestart}
          onBackToHome={handleBackToHome}
          score={storedScore}
        />
      )}
    </>
  );
}

// whatever you do just make sure you export this
export default GameComponent;
