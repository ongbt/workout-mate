import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from '@/context/ConsentContext';
import { initGA4 } from '@/lib/analytics';
import { initPostHog } from '@/lib/posthog';
import { Button } from '@/components/ui/button';

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
          className="bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t border-white/10 px-4 py-4 backdrop-blur-xl"
        >
          <p className="text-text-muted mb-3 text-sm">
            {t('components.consent.message')}{' '}
            <a href="#/privacy" className="text-primary underline">
              {t('components.consent.privacyLink')}
            </a>
          </p>
          <div className="flex gap-3">
            <Button onClick={handleAccept} className="flex-1" size="sm">
              {t('components.consent.accept')}
            </Button>
            <Button
              variant="outline"
              onClick={deny}
              className="flex-1"
              size="sm"
            >
              {t('components.consent.decline')}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
