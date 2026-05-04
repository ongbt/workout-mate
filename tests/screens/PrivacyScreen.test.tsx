import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PrivacyScreen } from '../../src/screens/PrivacyScreen';

const mockNavigate = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPrivacy() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <PrivacyScreen />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('PrivacyScreen', () => {
  it('renders title', () => {
    renderPrivacy();
    expect(screen.getByText('screens.privacy.title')).toBeDefined();
  });

  it('renders all section headings', () => {
    renderPrivacy();
    expect(
      screen.getByText('screens.privacy.dataWeCollect.heading'),
    ).toBeDefined();
    expect(
      screen.getByText('screens.privacy.howWeUseData.heading'),
    ).toBeDefined();
    expect(
      screen.getByText('screens.privacy.dataStorage.heading'),
    ).toBeDefined();
    expect(
      screen.getByText('screens.privacy.accountDeletion.heading'),
    ).toBeDefined();
    expect(
      screen.getByText('screens.privacy.thirdParty.heading'),
    ).toBeDefined();
    expect(screen.getByText('screens.privacy.contact.heading')).toBeDefined();
  });

  it('renders last updated', () => {
    renderPrivacy();
    expect(screen.getByText('screens.privacy.lastUpdated')).toBeDefined();
  });

  it('has a back button that navigates back', () => {
    renderPrivacy();
    const btn = screen.getByLabelText('navigation.goBack');
    btn.click();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
