import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setInterval(async () => {
          if (r.installing || r.waiting) return;
          await r.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-surface border border-primary/30 rounded-xl p-4 shadow-lg z-50 max-w-lg mx-auto">
      <p className="text-sm mb-3">New version available</p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="w-full py-3 rounded-lg bg-primary text-background font-bold text-sm"
      >
        Update now
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="w-full py-2 rounded-lg text-text-muted text-xs mt-1"
      >
        Dismiss
      </button>
    </div>
  );
}
