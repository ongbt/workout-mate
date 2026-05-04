import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface ErrorDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({ open, title, message, onClose }: ErrorDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-surface rounded-xl p-6 w-full max-w-sm flex flex-col gap-4',
          'animate-scale-in',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-text-muted">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="py-3 rounded-xl bg-primary text-background font-semibold"
        >
          {t('actions.dismiss')}
        </button>
      </div>
    </div>
  );
}
