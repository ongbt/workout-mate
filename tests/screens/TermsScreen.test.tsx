import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TermsScreen } from '../../src/screens/TermsScreen';

const mockNavigate = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderTerms() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <TermsScreen />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('TermsScreen', () => {
  it('renders title', () => {
    renderTerms();
    expect(screen.getByText('screens.terms.title')).toBeDefined();
  });

  it('renders all section headings', () => {
    renderTerms();
    expect(screen.getByText('screens.terms.acceptance.heading')).toBeDefined();
    expect(screen.getByText('screens.terms.description.heading')).toBeDefined();
    expect(
      screen.getByText('screens.terms.responsibilities.heading'),
    ).toBeDefined();
    expect(screen.getByText('screens.terms.liability.heading')).toBeDefined();
    expect(screen.getByText('screens.terms.changes.heading')).toBeDefined();
    expect(screen.getByText('screens.terms.contact.heading')).toBeDefined();
  });

  it('renders last updated', () => {
    renderTerms();
    expect(screen.getByText('screens.terms.lastUpdated')).toBeDefined();
  });

  it('has a back button that navigates back', () => {
    renderTerms();
    const btn = screen.getByLabelText('navigation.goBack');
    btn.click();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
