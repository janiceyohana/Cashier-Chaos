import { useGameService } from "gamez";
import { useEffect, useState } from "react";

export function ScoreBoard() {
  const { score } = useGameService().useGameState();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300); // stop after pulse
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="absolute top-16 right-0 z-10 w-28 px-3 py-1 font-bold text-white rounded-xl bg-zinc-800/50 mr-2 flex flex-col items-center justify-center text-center">
      <p className="text-xl">Score:</p>
      <p
        className={`text-3xl text-yellow-300 ${animate ? "score-pulse" : ""}`}
        style={{
          animationDuration: "0.3s",
        }}
      >
        {score}
      </p>
    </div>
  );
}
