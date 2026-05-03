import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function PrivacyScreen() {
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="py-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-text-muted hover:text-text"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </header>

      <div className="prose prose-invert prose-sm max-w-none pb-8">
        <h2>Data We Collect</h2>
        <p>
          Workout Mate stores your workout configurations and preferences to
          provide the timer and voice guidance functionality. Authentication is
          handled via Google OAuth — we receive your name and email address from
          Google.
        </p>

        <h2>How We Use Your Data</h2>
        <p>
          Your data is used solely to deliver the app&apos;s functionality: saving
          and loading your workouts, and personalizing your experience. We do not
          sell, share, or use your data for advertising.
        </p>

        <h2>Data Storage</h2>
        <p>
          All data is stored in Convex Cloud and is encrypted in transit and at
          rest. Your workout data is associated with your account and is accessible
          only to you.
        </p>

        <h2>Account Deletion</h2>
        <p>
          You may delete your account at any time. This will permanently remove all
          your personal data and workout configurations from our systems. To request
          account deletion, contact us at the email address below.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          This app uses Google OAuth for authentication. Google&apos;s privacy policy
          governs how they handle your login credentials. We also use analytics
          services to understand app usage — these are subject to their respective
          privacy policies.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related inquiries, contact us at{' '}
          <a href="mailto:privacy@workout-mate.app" className="text-primary underline">
            privacy@workout-mate.app
          </a>.
        </p>

        <p className="text-text-muted text-sm mt-8">
          Last updated: May 2026
        </p>
      </div>
    </Layout>
  );
}
