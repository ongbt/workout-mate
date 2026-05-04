import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setInterval(
          async () => {
            if (r.installing || r.waiting) return;
            await r.update();
          },
          60 * 60 * 1000,
        );
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="bg-surface border-primary/30 fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-lg rounded-xl border p-4 shadow-lg">
      <p className="mb-3 text-sm">
        {t('components.pwaUpdatePrompt.newVersion')}
      </p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="bg-primary text-background w-full rounded-lg py-3 text-sm font-bold"
      >
        {t('actions.updateNow')}
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="text-text-muted mt-1 w-full rounded-lg py-2 text-xs"
      >
        {t('actions.dismiss')}
      </button>
    </div>
  );
}
