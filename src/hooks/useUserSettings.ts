import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useError } from '../context/ErrorContext';
import { useTranslation } from 'react-i18next';

export function useUserSettings() {
  const settings = useQuery(api.userSettings.get);
  const setKeyMutation = useMutation(api.userSettings.setRapidApiKey);
  const removeKeyMutation = useMutation(api.userSettings.removeRapidApiKey);
  const { showError } = useError();
  const { t } = useTranslation();

  const hasRapidApiKey = Boolean(settings?.rapidApiKey);

  const setRapidApiKey = useCallback(
    async (key: string) => {
      try {
        await setKeyMutation({ key });
      } catch (e) {
        showError(
          t('errors.mutationFailed'),
          e instanceof Error ? e.message : t('errors.tryAgain'),
        );
        throw e;
      }
    },
    [setKeyMutation, showError, t],
  );

  const removeRapidApiKey = useCallback(async () => {
    try {
      await removeKeyMutation({});
    } catch (e) {
      showError(
        t('errors.mutationFailed'),
        e instanceof Error ? e.message : t('errors.tryAgain'),
      );
      throw e;
    }
  }, [removeKeyMutation, showError, t]);

  return { hasRapidApiKey, setRapidApiKey, removeRapidApiKey };
}
