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
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
} as const;

export function FinishedView() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
        variants={itemVariants}
      >
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
        className="px-8 py-4 rounded-xl bg-primary text-background font-bold text-lg mt-4"
        variants={itemVariants}
        whileTap={{ scale: 0.97 }}
      >
        {t('actions.backToHome')}
      </motion.button>
    </motion.div>
  );
}
