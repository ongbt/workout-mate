import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/button';

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
    <div className="bg-surface fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-lg rounded-2xl border border-white/15 p-4 backdrop-blur-xl">
      <p className="mb-3 text-sm">
        {t('components.pwaUpdatePrompt.newVersion')}
      </p>
      <Button
        onClick={() => updateServiceWorker(true)}
        className="w-full"
        size="sm"
      >
        {t('actions.updateNow')}
      </Button>
      <Button
        variant="ghost"
        onClick={() => setNeedRefresh(false)}
        className="mt-1 w-full"
        size="xs"
      >
        {t('actions.dismiss')}
      </Button>
    </div>
  );
}
