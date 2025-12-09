import { useGameService } from "gamez";
import { ASSETS } from "../constants";

export function LandingPage({ onNext }: { onNext: () => void }) {
  const gs = useGameService();

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${ASSETS.background})` }}
    >
      <div className="text-center bg-white/70 p-6 rounded-2xl w-80">
        <h1 className="text-3xl font-bold text-violet-700 ">Cashier Chaos</h1>
        <p className="text-lg font-normal text-black my-4">
          Test your speed and accuracy in giving customers correct change!
        </p>

        <button
          onClick={onNext}
          className="text-white w-64 py-3 mt-8 text-2xl font-semibold bg-gradient-to-b from-violet-400 to-violet-900 rounded-xl animate-bounce transition duration-300"
        >
          Play
        </button>
      </div>
    </div>
  );
}
