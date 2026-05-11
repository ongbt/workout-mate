import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from '@/context/ConsentContext';
import { initGA4 } from '@/lib/analytics';
import { initPostHog } from '@/lib/posthog';

export function ConsentBanner() {
  const { t } = useTranslation();
  const { consent, grant, deny } = useConsent();

  const handleAccept = useCallback(() => {
    grant();
    initGA4();
    initPostHog();
  }, [grant]);

  return (
    <AnimatePresence>
      {consent === 'pending' && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-background fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 px-4 py-4 shadow-lg"
        >
          <p className="text-text-muted mb-3 text-sm">
            {t('components.consent.message')}{' '}
            <a href="#/privacy" className="text-primary underline">
              {t('components.consent.privacyLink')}
            </a>
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="bg-primary text-background flex-1 rounded-md px-4 py-2 text-sm font-medium"
            >
              {t('components.consent.accept')}
            </button>
            <button
              onClick={deny}
              className="text-text-muted flex-1 rounded-md border border-slate-600 px-4 py-2 text-sm font-medium"
            >
              {t('components.consent.decline')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
