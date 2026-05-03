import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function TermsScreen() {
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
        <h1 className="text-2xl font-bold">Terms of Service</h1>
      </header>

      <div className="prose prose-invert prose-sm max-w-none pb-8">
        <h2>Acceptance of Terms</h2>
        <p>
          By using Workout Mate, you agree to these terms. If you do not agree,
          do not use the service.
        </p>

        <h2>Description of Service</h2>
        <p>
          Workout Mate is a workout timer application that provides timed exercise
          routines with voice guidance. The service is provided &quot;as is&quot;
          without warranties of any kind.
        </p>

        <h2>User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials. You agree not to misuse the service or attempt to access it
          through unauthorized means.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Workout Mate and its creators shall not be liable for any damages arising
          from the use or inability to use the service. This includes but is not
          limited to personal injury during exercise — always consult a healthcare
          professional before beginning any workout program.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use of
          the service after changes constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, contact{' '}
          <a href="mailto:terms@workout-mate.app" className="text-primary underline">
            terms@workout-mate.app
          </a>.
        </p>

        <p className="text-text-muted text-sm mt-8">
          Last updated: May 2026
        </p>
      </div>
    </Layout>
  );
}
