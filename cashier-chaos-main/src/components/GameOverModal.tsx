export function GameOverModal({
  title,
  message,
  buttonLabel,
  onRestart,
  onBackToHome,
}: {
  title: string;
  message: string;
  buttonLabel: string;
    onRestart: () => void;
  onBackToHome?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl p-6  text-center w-80">
        <h1 className="text-3xl font-bold text-violet-700">{title}</h1>
        <p className="text-lg font-normal text-black my-4">{message}</p>

        <button
          onClick={onRestart}
          className="text-white w-64 py-3 mt-8 text-2xl font-semibold bg-gradient-to-b from-violet-400 to-violet-900 rounded-xl"
        >
          {buttonLabel}
        </button>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="text-white w-64 py-3 mt-4 text-2xl font-semibold bg-gray-600 rounded-xl"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
