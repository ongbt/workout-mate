import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';

export function PrivacyScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout>
      <Helmet>
        <title>{t('screens.privacy.pageTitle')}</title>
        <meta
          name="description"
          content={t('screens.privacy.pageDescription')}
        />
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
          <a
            href={`mailto:${t('screens.privacy.contact.email')}`}
            className="text-primary underline"
          >
            {t('screens.privacy.contact.email')}
          </a>
          .
        </p>

        <p className="text-text-muted mt-8 text-sm">
          {t('screens.privacy.lastUpdated')}
        </p>
      </div>
    </Layout>
  );
}
