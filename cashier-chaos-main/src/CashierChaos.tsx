import { motion } from "framer-motion";
import { getRandomNum, useGameService } from "gamez";
import { useResult } from "gamez/src/hooks/useResult";
import { useEffect, useMemo, useRef, useState } from "react";
import { Highlight } from "./components/Highlight";
import { TopBar } from "./components/TopBar";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import "./styles/game.css";
import { ScoreBoard } from "./components/ScoreBoard";

const HUNDREDS = [20, 10, 5, 2];
const CENTS = [1, 0.5, 0.2, 0.1];

function getAmount(multiple: number) {
  let hundreds = getRandomNum(100, 1);

  if (multiple >= 1) {
    return {
      hundreds: hundreds - (hundreds % multiple),
      cents: 0,
    };
  }

  return {
    hundreds,
    cents: (Math.round(Math.random() * 100) * 10) % 100,
  };
}

//Mapping image to path, encode space
function mapCustomerKeyToPublicPath(key: string) {
  const match = key.match(/^person(\d+)_(\d+)$/);
  if (!match) return "";

  const [, personNum, variant] = match;

  const folder = `person (${personNum})`;
  const encodedFolder = encodeURIComponent(folder); // becomes person%20(1)

  return `/images/customers/${encodedFolder}/(${variant}).png`;
}

export function emptyCash() {
  return {
    ...Object.fromEntries(HUNDREDS.map((x) => [x, 0])),
    ...Object.fromEntries(CENTS.map((x) => [x, 0])),
  };
}

/**
 * YourGame is a React component that represents a game.
 * This a sample game component
 */
export function CashierChaos() {
  const gs = useGameService();
  const { cash, customer, remainingLives, score } = gs.useGameState();
  const { result, setResult, resetResult } = useResult();

  const { multiple, cashRegisterWorking } = gs.getCurrLevelDetails();
  const [timeLeft, setTimeLeft] = useState(gs.getCurrLevelDetails().time);
  const [timerActive, setTimerActive] = useState(true);
  const [levelKey, setLevelKey] = useState(0); //Add levelKey state for timer needs

  useEffect(() => {
    // Reset timer whenever the level changes
    setTimeLeft(gs.getCurrLevelDetails().time);
  }, [gs.getCurrLevelDetails().multiple]);

  useEffect(() => {
    // Reset timer on new level
    setTimeLeft(gs.getCurrLevelDetails().time);
    setTimerActive(true); //Start timer
  }, [levelKey]);

  useEffect(() => {
    if (!timerActive) return; //Stop if game over
    if (gs.isSessionEnded()) return; //Stop is session ended
    if (timeLeft <= 0) {
      setTimerActive(false); //Stop timer
      gameOverSfx.current.play();
      gs.endSession("error");
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev:number) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeft, timerActive, gs]);

  //Add Lottie for correct and wrong answers
  const [animations, setAnimations] = useState<{ correct: any; wrong: any } | null>(null);

  //Import sound effects
  const correctSfx = useRef(new Audio("/sounds/correct.mp3"));
  const wrongSfx = useRef(new Audio("/sounds/wrong.mp3"));
  const levelCompletedSfx = useRef(new Audio("/sounds/level_completed_3.mp3"));
  const plop1Sfx = useRef(new Audio("/sounds/plop1.mp3"));
  const plop2Sfx = useRef(new Audio("/sounds/plop2.mp3"));
  // const tickSfx = useRef(new Audio("/sounds/tick.mp3"));
  const gameOverSfx = useRef(new Audio("/sounds/game_over.mp3"));

  useEffect(() => {
    const fetchAnimations = async () => {
      const correct = await fetch("/lotties/correct.json").then((res) => res.json());
      const wrong = await fetch("/lotties/wrong.json").then((res) => res.json());
      setAnimations({ correct, wrong });
    };
    fetchAnimations();
  }, []);

  useEffect(() => {
    if (!result) return;

    setTimeout(() => {
      if (result === "success") {
        if (customer === 4) {
          levelCompletedSfx.current.play(); //Play next level sound effect
          gs.updateState({ cash: emptyCash(), customer: 1 });
          gs.nextLevel();

          //For timer
          setLevelKey((k) => k + 1);

          //Store score and update to state
          const prevScore = gs.useGameState().score;
          gs.updateState({ score: prevScore });

          return ;
        }

        gs.updateState({ customer: customer + 1, cash: emptyCash() });
      } else if (result === "error") {
        if (remainingLives <= 1) {
          gameOverSfx.current.play(); //Play game over sound effect
          gs.updateState({ remainingLives: 0 })
          resetResult();
          return gs.endSession("error");
        }

        gs.updateState({ remainingLives: remainingLives - 1 });

      }

      resetResult();
    }, 500);
  }, [result]);

  //For setting the speed for longer animation
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(4);
    }
  }, []);

  const customerSrc = useMemo(() => {
    const key = `person${getRandomNum(8, 1)}_${getRandomNum(4, 1)}`;
    return mapCustomerKeyToPublicPath(key);
  }, [customer]);

  const { hundreds, cents } = useMemo(() => getAmount(multiple), [customer, multiple]);
  const borrow = cents > 0 ? 1 : 0;

  return (
    <div className="relative flex flex-col w-full h-full overflow-y-auto">
      {result && (
        <img
          className="absolute top-0 bottom-0 left-0 right-0 z-20 mx-auto my-auto size-40 md:scale-125 lg:scale-150"
          src={result === "success" ? gs.assets.right : gs.assets.wrong}
        />
      )}

      {/* Rendering Lottie */}
      {result && animations && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
          <Lottie
            animationData={result === "success" ? animations.correct : animations.wrong}
            style={{
              width: result === "success" ? 825 : 400,
              height: result === "success" ? 825 : 400,
            }}
            loop={false}
            onComplete={() => resetResult()}
            lottieRef={lottieRef}
          />
        </div>
      )}

      {/* To make it re-run from initial time */}
      <div key={levelKey}>
        <TopBar />
      </div>

      <ScoreBoard />

      <div
        className="relative flex flex-col items-center justify-center flex-grow overflow-hidden bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url(${gs.assets.background})`,
        }}
      >
        <img src={customerSrc} className="absolute right-[5%] h-1/2 bottom-[10%]" />

        <div className="absolute bottom-0 left-0 w-1/2">
          <img src={gs.assets.cashRegister} className="-mb-1" />

          <div className="absolute top-[12%] left-[12%] text-lg text-white font-medium">
            <p>Received: </p>
            <p>Total: </p>
            <p className={cashRegisterWorking ? "text-yellow-500" : "text-red-400"}>Change: </p>
          </div>
          <div className="absolute top-[12%] right-[12%] text-right text-lg text-white font-medium">
            <p>$100.00</p>
            <p>
              ${100 - hundreds - borrow}.{borrow * 100 - cents}
            </p>
            <p className={cashRegisterWorking ? "text-yellow-500" : "text-red-400"}>
              {cashRegisterWorking ? `$${hundreds}.${cents}` : "ERROR!"}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-1/2">
          <img src={gs.assets.whiteTray} className="scale-[1.4]" />

          <div id="gs-money-counter" className="absolute inset-y-0 z-10 flex h-5 gap-1 p-1 md:gap-4 lg:gap-6">
            {HUNDREDS.map((x) => (
              <button
                key={x}
                className="relative w-10 md:w-24 lg:w-28"
                onClick={() => {
                  gs.updateState({ cash: { ...cash, [x]: cash[x] - 1 } });
                  //Play plop1 sound
                  if (HUNDREDS.includes(x)) plop1Sfx.current.play();
                }}
                style={{ display: cash[x] ? undefined : "none" }}
              >
                <img
                  className="absolute"
                  src={gs.assets["dollar_" + x]}
                  style={{ display: cash[x] - 1 ? undefined : "none" }}
                />
                <Highlight num={cash[x]} />
                <motion.img key={`${x}-${cash[x]}`} layoutId={`${x}-${cash[x]}`} src={gs.assets["dollar_" + x]} />
              </button>
            ))}

            <div className="flex flex-col items-center ml-auto justify-evenly">
              {CENTS.map((x) => (
                <button
                  key={x}
                  className="relative"
                  onClick={() => {
                    gs.updateState({ cash: { ...cash, [x]: cash[x] - 1 } });
                    //Play plop2 sound
                    if (CENTS.includes(x)) plop2Sfx.current.play();
                  }}
                  style={{ display: cash[x] ? undefined : "none" }}
                >
                  <img
                    className="absolute"
                    src={gs.assets["cent_" + x * 100]}
                    style={{
                      height: (x * 100) / 20 + 25,
                      display: cash[x] - 1 ? undefined : "none",
                    }}
                  />
                  <Highlight num={cash[x]} />
                  <motion.img
                    key={`${x}-${cash[x]}`}
                    layoutId={`${x}-${cash[x]}`}
                    src={gs.assets["cent_" + x * 100]}
                    style={{ height: (x * 100) / 20 + 25 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-4 bg-sky-800 md:py-6 lg:py-10">
        <div className="grid grid-cols-4 gap-2 px-4 py-2 mx-auto mb-2 tall:py-4 w-fit">
          {HUNDREDS.map((x) => (
            <button
              key={x}
              className="bg-[#303A43] pt-2 px-1 w-20 h-[185px] md:h-56 md:w-24 lg:w-28 lg:h-64 relative"
              onClick={() => {
                gs.updateState({ cash: { ...cash, [x]: cash[x] + 1 } });
                //Play plop1 sound
                if (HUNDREDS.includes(x)) plop1Sfx.current.play();
              }}
            >
              <img src={gs.assets["dollar_" + x]} className="absolute w-[72px] md:w-[88px] lg:w-[104px]" />
              <motion.img key={`${x}-${cash[x] + 1}`} layoutId={`${x}-${cash[x] + 1}`} src={gs.assets["dollar_" + x]} />
            </button>
          ))}

          {CENTS.map((x) => (
            <button
              key={x}
              className="bg-[#303A43] size-20 flex justify-center items-center pt-2 relative md:size-24 lg:size-28"
              onClick={() => {
                gs.updateState({ cash: { ...cash, [x]: cash[x] + 1 } });
                //Play plop2 sound
                if (CENTS.includes(x)) plop2Sfx.current.play();
              }}
            >
              <img src={gs.assets["cent_" + x * 100]} className="absolute size-16 md:size-20 lg:size-24" />
              <motion.img
                key={`${x}-${cash[x] + 1}`}
                layoutId={`${x}-${cash[x] + 1}`}
                className="relative size-16 md:size-20 lg:size-24"
                src={gs.assets["cent_" + x * 100]}
              />
            </button>
          ))}
        </div>

        <button
          className="block pt-1 pb-2 mx-auto text-xl font-bold text-white bg-green-600 shadow-xl rounded-xl w-80 md:scale-125 lg:scale-150"
          onClick={() =>
          {

            //Calculate the user inputs
            const a_hundreds = [20, 10, 5, 2, 1].map((x) => cash[x] * x).reduce((a, b) => a + b);
            const a_cents = [0.5, 0.2, 0.1].map((x) => Math.round(cash[x] * x * 100)).reduce((a, b) => a + b);

            //Convert the cents to real value
            const playerTotal = a_hundreds + a_cents / 100;

            //Calculate correct change (target)
            const correctTotal = hundreds + cents / 100;

            const isCorrect = playerTotal === correctTotal;
            setResult(isCorrect ? "success" : "error");

            //Add sound effects for correct/wrong answer
            if (isCorrect) {
              correctSfx.current.play();
            } else {
              wrongSfx.current.play();
            }

            //Scoring logic (add +10 points)
            if (isCorrect) {
              gs.updateState({ score: score + 10 });
            }
          }}
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
