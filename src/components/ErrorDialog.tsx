import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface ErrorDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({
  open,
  title,
  message,
  onClose,
}: ErrorDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-surface flex w-full max-w-sm flex-col gap-4 rounded-xl p-6',
          'animate-scale-in',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-text-muted text-sm">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="bg-primary text-background rounded-xl py-3 font-semibold"
        >
          {t('actions.dismiss')}
        </button>
      </div>
    </div>
  );
}
