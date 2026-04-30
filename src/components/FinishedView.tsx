import { useNavigate } from 'react-router-dom';

export function FinishedView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6">
      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold">Workout Complete!</h2>
      <p className="text-text-muted">Great job! You finished your workout.</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="px-8 py-4 rounded-xl bg-primary text-background font-bold text-lg mt-4"
      >
        Back to Home
      </button>
    </div>
  );
}
