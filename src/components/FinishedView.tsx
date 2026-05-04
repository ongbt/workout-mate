import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
} as const;

export function FinishedView() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full"
        variants={itemVariants}
      >
        <svg
          className="text-primary h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
      <motion.h2 className="text-3xl font-bold" variants={itemVariants}>
        {t('components.finishedView.workoutComplete')}
      </motion.h2>
      <motion.p className="text-text-muted" variants={itemVariants}>
        {t('components.finishedView.greatJob')}
      </motion.p>
      <motion.button
        type="button"
        onClick={() => navigate('/')}
        className="bg-primary text-background mt-4 rounded-xl px-8 py-4 text-lg font-bold"
        variants={itemVariants}
        whileTap={{ scale: 0.97 }}
      >
        {t('actions.backToHome')}
      </motion.button>
    </motion.div>
  );
}
