import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>{t('actions.dismiss')}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
