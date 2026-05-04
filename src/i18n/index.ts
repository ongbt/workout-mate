import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const en = {
  common: {
    'app.title': 'Workout Mate',
    'app.tagline': 'Track your workouts with voice-guided timers',
    'actions.save': 'Save',
    'actions.delete': 'Delete',
    'actions.cancel': 'Cancel',
    'actions.backToHome': 'Back to Home',
    'actions.signOut': 'Sign out',
    'actions.signInWithGoogle': 'Sign in with Google',
    'actions.signInWithEmail': 'Sign in with Email',
    'actions.signUpWithEmail': 'Sign up with Email',
    'actions.signInAnonymously': 'Continue as Guest',
    'actions.switchToSignUp': "Don't have an account? Sign up",
    'actions.switchToSignIn': 'Already have an account? Sign in',
    'labels.email': 'Email',
    'labels.password': 'Password',
    'common.orContinueWith': 'or continue with',
    'actions.stop': 'Stop',
    'actions.pause': 'Pause',
    'actions.resume': 'Resume',
    'actions.skip': 'Skip',
    'actions.import': 'Import',
    'actions.updateNow': 'Update now',
    'actions.dismiss': 'Dismiss',
    'labels.name': 'Name',
    'labels.seconds': 'Sec',
    'labels.rounds': 'Rounds',
    'labels.exercises': 'Exercises',
    'labels.exercises_one': '{{count}} exercise',
    'labels.exercises_other': '{{count}} exercises',
    'labels.rounds_one': '{{count}} round',
    'labels.rounds_other': '{{count}} rounds',
    'navigation.goBack': 'Go back',
    'validation.valueRequired': 'Value is required',
    'validation.nameRequired': 'Name is required',
    'validation.emailRequired': 'Email is required',
    'validation.passwordRequired': 'Password is required',
    'workout.notFound': 'Workout not found',
    'workout.start': 'Start Workout',
    'workout.stop': 'Stop',
    'workout.stopConfirmTitle': 'Stop Workout?',
    'workout.stopConfirmMessage':
      'Your progress will be lost. Are you sure you want to stop?',
    'workout.continue': 'Continue Workout',
    'errors.unexpected': 'Something went wrong',
    'errors.tryAgain':
      'Please try again. If the problem persists, try reloading the app.',
    'errors.mutationFailed': 'Save Failed',
    'errors.signInFailed': 'Sign In Failed',
  },
  screens: {
    'home.createNew': 'Create New Workout',
    'home.pageTitle': 'Workout Mate',
    'home.pageDescription':
      'Create and manage your workout routines with voice-guided timers',
    'login.pageTitle': 'Sign In | Workout Mate',
    'login.pageDescription':
      'Sign in to Workout Mate to track your workouts with voice-guided timers',
    'workoutEdit.titleEdit': 'Edit Workout',
    'workoutEdit.titleNew': 'New Workout',
    'workoutEdit.pageTitleEdit': 'Edit Workout | Workout Mate',
    'workoutEdit.pageTitleNew': 'New Workout | Workout Mate',
    'workoutEdit.pageDescription':
      'Configure your workout exercises, rounds, and rest periods',
    'workoutEdit.namePlaceholder': 'e.g. Upper Body',
    'workoutEdit.restBetweenRoundsLabel': 'Rest between rounds (sec)',
    'workoutEdit.restBetweenExercisesLabel': 'Rest between exercises (sec)',
    'workoutEdit.importTemplate': 'Import template',
    'workoutEdit.addExercise': '+ Add',
    'workoutEdit.deleteConfirmTitle': 'Delete Workout?',
    'workoutEdit.deleteConfirmMessage':
      'This will permanently delete "{{name}}". This action cannot be undone.',
    'workoutEdit.importModalTitle': 'Import from Template',
    'workoutEdit.importModalDescription':
      'Select a template to pre-fill the exercises, rest times, and rounds.',
    'workoutActive.pageTitle': '{{name}} | Workout Mate',
    'workoutActive.pageDescription': 'Active workout session',
    'workoutActive.next': 'Next: {{name}}',
    'workoutActive.upNext': 'Up next: {{name}}',
    'workoutActive.exercisesLabel': 'Exercises',
    'workoutActive.restBetweenExercises': 'Rest between exercises',
    'workoutActive.restBetweenRounds': 'Rest between rounds',
    'privacy.pageTitle': 'Privacy Policy | Workout Mate',
    'privacy.pageDescription': 'Privacy Policy for Workout Mate',
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdated': 'Last updated: May 2026',
    'privacy.dataWeCollect.heading': 'Data We Collect',
    'privacy.dataWeCollect.body':
      'Workout Mate stores your workout configurations and preferences to provide the timer and voice guidance functionality. Authentication is handled via Google OAuth — we receive your name and email address from Google.',
    'privacy.howWeUseData.heading': 'How We Use Your Data',
    'privacy.howWeUseData.body':
      "Your data is used solely to deliver the app's functionality: saving and loading your workouts, and personalizing your experience. We do not sell, share, or use your data for advertising.",
    'privacy.dataStorage.heading': 'Data Storage',
    'privacy.dataStorage.body':
      'All data is stored in Convex Cloud and is encrypted in transit and at rest. Your workout data is associated with your account and is accessible only to you.',
    'privacy.accountDeletion.heading': 'Account Deletion',
    'privacy.accountDeletion.body':
      'You may delete your account at any time. This will permanently remove all your personal data and workout configurations from our systems. To request account deletion, contact us at the email address below.',
    'privacy.thirdParty.heading': 'Third-Party Services',
    'privacy.thirdParty.body':
      "This app uses Google OAuth for authentication. Google's privacy policy governs how they handle your login credentials. We also use analytics services to understand app usage — these are subject to their respective privacy policies.",
    'privacy.contact.heading': 'Contact',
    'privacy.contact.body': 'For privacy-related inquiries, contact us at ',
    'privacy.contact.email': 'privacy@workout-mate.app',
    'terms.pageTitle': 'Terms of Service | Workout Mate',
    'terms.pageDescription': 'Terms of Service for Workout Mate',
    'terms.title': 'Terms of Service',
    'terms.lastUpdated': 'Last updated: May 2026',
    'terms.acceptance.heading': 'Acceptance of Terms',
    'terms.acceptance.body':
      'By using Workout Mate, you agree to these terms. If you do not agree, do not use the service.',
    'terms.description.heading': 'Description of Service',
    'terms.description.body':
      'Workout Mate is a workout timer application that provides timed exercise routines with voice guidance. The service is provided "as is" without warranties of any kind.',
    'terms.responsibilities.heading': 'User Responsibilities',
    'terms.responsibilities.body':
      'You are responsible for maintaining the confidentiality of your account credentials. You agree not to misuse the service or attempt to access it through unauthorized means.',
    'terms.liability.heading': 'Limitation of Liability',
    'terms.liability.body':
      'Workout Mate and its creators shall not be liable for any damages arising from the use or inability to use the service. This includes but is not limited to personal injury during exercise — always consult a healthcare professional before beginning any workout program.',
    'terms.changes.heading': 'Changes to Terms',
    'terms.changes.body':
      'We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.',
    'terms.contact.heading': 'Contact',
    'terms.contact.body': 'For questions about these terms, contact ',
    'terms.contact.email': 'terms@workout-mate.app',
  },
  components: {
    'phaseIndicator.idle': 'Ready',
    'phaseIndicator.exercise': 'Exercise',
    'phaseIndicator.rest': 'Rest',
    'phaseIndicator.finished': 'Done',
    'emptyState.noWorkouts': 'No workouts yet',
    'emptyState.createFirst': 'Create your first workout set to get started',
    'finishedView.workoutComplete': 'Workout Complete!',
    'finishedView.greatJob': 'Great job! You finished your workout.',
    'progressBar.round': 'Round {{current}}/{{total}}',
    'progressBar.exercise': 'Ex {{current}}/{{total}}',
    'pwaUpdatePrompt.newVersion': 'New version available',
    'exerciseFormRow.placeholder': 'Exercise name',
    'exerciseFormRow.moveUp': 'Move up',
    'exerciseFormRow.moveDown': 'Move down',
  },
};

const withPrefix = (prefix: string, obj: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [`${prefix}.${k}`, v]),
  );

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          ...en.common,
          ...withPrefix('screens', en.screens),
          ...withPrefix('components', en.components),
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    load: 'languageOnly',
    keySeparator: false,
    interpolation: { escapeValue: false },
    returnObjects: false,
  });

export default i18n;
