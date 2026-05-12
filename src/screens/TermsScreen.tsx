import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';

export function TermsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout>
      <Helmet>
        <title>{t('screens.terms.pageTitle')}</title>
        <meta name="description" content={t('screens.terms.pageDescription')} />
      </Helmet>
      <header className="flex items-center gap-3 py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label={t('navigation.goBack')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t('screens.terms.title')}</h1>
      </header>

      <div className="prose prose-invert prose-sm max-w-none pb-8">
        <h2>{t('screens.terms.acceptance.heading')}</h2>
        <p>{t('screens.terms.acceptance.body')}</p>

        <h2>{t('screens.terms.description.heading')}</h2>
        <p>{t('screens.terms.description.body')}</p>

        <h2>{t('screens.terms.responsibilities.heading')}</h2>
        <p>{t('screens.terms.responsibilities.body')}</p>

        <h2>{t('screens.terms.liability.heading')}</h2>
        <p>{t('screens.terms.liability.body')}</p>

        <h2>{t('screens.terms.changes.heading')}</h2>
        <p>{t('screens.terms.changes.body')}</p>

        <h2>{t('screens.terms.contact.heading')}</h2>
        <p>
          {t('screens.terms.contact.body')}
          <a
            href={`mailto:${t('screens.terms.contact.email')}`}
            className="text-primary underline"
          >
            {t('screens.terms.contact.email')}
          </a>
          .
        </p>

        <p className="text-text-muted mt-8 text-sm">
          {t('screens.terms.lastUpdated')}
        </p>
      </div>
    </Layout>
  );
}
