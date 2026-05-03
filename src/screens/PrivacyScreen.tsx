import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Layout } from '../components/Layout';

export function PrivacyScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout>
      <Helmet>
        <title>{t('screens.privacy.pageTitle')}</title>
        <meta name="description" content={t('screens.privacy.pageDescription')} />
      </Helmet>
      <header className="py-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-text-muted hover:text-text"
          aria-label={t('navigation.goBack')}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{t('screens.privacy.title')}</h1>
      </header>

      <div className="prose prose-invert prose-sm max-w-none pb-8">
        <h2>{t('screens.privacy.dataWeCollect.heading')}</h2>
        <p>{t('screens.privacy.dataWeCollect.body')}</p>

        <h2>{t('screens.privacy.howWeUseData.heading')}</h2>
        <p>{t('screens.privacy.howWeUseData.body')}</p>

        <h2>{t('screens.privacy.dataStorage.heading')}</h2>
        <p>{t('screens.privacy.dataStorage.body')}</p>

        <h2>{t('screens.privacy.accountDeletion.heading')}</h2>
        <p>{t('screens.privacy.accountDeletion.body')}</p>

        <h2>{t('screens.privacy.thirdParty.heading')}</h2>
        <p>{t('screens.privacy.thirdParty.body')}</p>

        <h2>{t('screens.privacy.contact.heading')}</h2>
        <p>
          {t('screens.privacy.contact.body')}
          <a href={`mailto:${t('screens.privacy.contact.email')}`} className="text-primary underline">
            {t('screens.privacy.contact.email')}
          </a>.
        </p>

        <p className="text-text-muted text-sm mt-8">
          {t('screens.privacy.lastUpdated')}
        </p>
      </div>
    </Layout>
  );
}
