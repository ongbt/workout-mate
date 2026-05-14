import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserSettings } from '../hooks/useUserSettings';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function RapidApiKeyInput() {
  const { t } = useTranslation();
  const { hasRapidApiKey, setRapidApiKey, removeRapidApiKey } =
    useUserSettings();
  const [keyValue, setKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (!keyValue.trim()) return;
    setSaving(true);
    try {
      await setRapidApiKey(keyValue);
      setSaved(true);
      setKeyValue('');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error already handled by useUserSettings
    } finally {
      setSaving(false);
    }
  }, [keyValue, setRapidApiKey]);

  const handleRemove = useCallback(async () => {
    setSaving(true);
    try {
      await removeRapidApiKey();
    } catch {
      // Error already handled by useUserSettings
    } finally {
      setSaving(false);
    }
  }, [removeRapidApiKey]);

  if (hasRapidApiKey) {
    return (
      <div className="bg-surface/50 flex items-center justify-between gap-2 rounded-xl p-3">
        <span className="text-text-muted text-sm">RapidAPI key configured</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleRemove}
          disabled={saving}
          className="text-destructive"
        >
          {t('components.exerciseSearch.removeKey')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-muted text-sm">
        {t('components.exerciseSearch.keyPrompt')}
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          value={keyValue}
          onChange={(e) => setKeyValue(e.target.value)}
          placeholder={t('components.exerciseSearch.keyPlaceholder')}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
        <Button
          onClick={handleSave}
          disabled={saving || !keyValue.trim() || saved}
          size="sm"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            (t('components.exerciseSearch.saved') ?? 'Saved')
          ) : (
            t('actions.save')
          )}
        </Button>
      </div>
    </div>
  );
}
