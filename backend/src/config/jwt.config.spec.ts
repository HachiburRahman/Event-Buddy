import { ConfigService } from '@nestjs/config';
import { requireJwtSecret } from './jwt.config';

describe('requireJwtSecret', () => {
  const configWith = (value?: string) =>
    ({ get: () => value }) as unknown as ConfigService;

  it('returns the configured secret', () => {
    expect(requireJwtSecret(configWith('a-real-secret'))).toBe('a-real-secret');
  });

  // Booting without a secret used to produce a 500 on every successful login,
  // and left token verification falling back to a string published in this repo.
  it('throws when JWT_SECRET is missing, so the app cannot boot half-broken', () => {
    expect(() => requireJwtSecret(configWith(undefined))).toThrow(/JWT_SECRET is not set/);
  });

  it('throws on an empty string, which env vars produce easily', () => {
    expect(() => requireJwtSecret(configWith(''))).toThrow(/JWT_SECRET is not set/);
  });

  it('throws on whitespace, so a stray space is not mistaken for a secret', () => {
    expect(() => requireJwtSecret(configWith('   '))).toThrow(/JWT_SECRET is not set/);
  });

  it('explains where to set it and how to generate one', () => {
    expect(() => requireJwtSecret(configWith(undefined))).toThrow(/Render dashboard/);
    expect(() => requireJwtSecret(configWith(undefined))).toThrow(/randomBytes/);
  });

  it('never falls back to the old committed default', () => {
    // Guards the exact string that made forged tokens work in production.
    try {
      requireJwtSecret(configWith(undefined));
    } catch (error) {
      expect((error as Error).message).not.toContain('your_default_secret');
      return;
    }
    throw new Error('expected requireJwtSecret to throw');
  });
});
