import { describe, it, expect } from 'vitest';
import { CSP_POLICY } from '../src/components/Layout';

function parseCSP(policy: string): Map<string, Set<string>> {
  const directives = new Map<string, Set<string>>();
  for (const part of policy.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [name, ...values] = trimmed.split(/\s+/) as [string, ...string[]];
    directives.set(name, new Set(values));
  }
  return directives;
}

const HEADERS_CSP =
  "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://eu-assets.i.posthog.com; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://*.convex.cloud https://*.convex.cloud https://accounts.google.com https://www.google-analytics.com https://analytics.google.com https://*.ingest.sentry.io https://*.i.posthog.com; frame-src https://accounts.google.com; img-src 'self' data:; worker-src 'self'; font-src 'self'; object-src 'none'; form-action 'self'; base-uri 'self'";

// Ensure these stay in sync when third-party services are added or changed.
const EXPECTED = [
  // [domain, directive]
  ['https://www.googletagmanager.com', 'script-src'],
  ['https://eu-assets.i.posthog.com', 'script-src'],
  ['wss://*.convex.cloud', 'connect-src'],
  ['https://*.convex.cloud', 'connect-src'],
  ['https://accounts.google.com', 'connect-src'],
  ['https://www.google-analytics.com', 'connect-src'],
  ['https://analytics.google.com', 'connect-src'],
  ['https://*.ingest.sentry.io', 'connect-src'],
  ['https://*.i.posthog.com', 'connect-src'],
  ['https://accounts.google.com', 'frame-src'],
] as const;

function assertExpectedDomains(
  directives: Map<string, Set<string>>,
  source: string,
) {
  for (const [domain, directive] of EXPECTED) {
    const values = directives.get(directive);
    if (!values) {
      throw new Error(`${source}: missing '${directive}' directive entirely`);
    }
    if (!values.has(domain)) {
      throw new Error(`${source}: '${directive}' must include ${domain}`);
    }
  }
}

describe('CSP', () => {
  it('Layout CSP includes all required third-party domains', () => {
    const directives = parseCSP(CSP_POLICY);
    assertExpectedDomains(directives, 'Layout CSP');
  });

  it('_headers CSP includes all required third-party domains', () => {
    const directives = parseCSP(HEADERS_CSP);
    assertExpectedDomains(directives, '_headers CSP');
  });

  it('Layout CSP and _headers CSP script-src match', () => {
    const layout = parseCSP(CSP_POLICY).get('script-src');
    const headers = parseCSP(HEADERS_CSP).get('script-src');
    expect([...layout!].sort()).toEqual([...headers!].sort());
  });

  it('Layout CSP and _headers CSP connect-src match', () => {
    const layout = parseCSP(CSP_POLICY).get('connect-src');
    const headers = parseCSP(HEADERS_CSP).get('connect-src');
    expect([...layout!].sort()).toEqual([...headers!].sort());
  });
});
