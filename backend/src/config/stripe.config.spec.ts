import { ConfigService } from '@nestjs/config';
import { requireStripeSecretKey } from './stripe.config';

describe('requireStripeSecretKey', () => {
  const configWith = (value?: string) => ({ get: () => value }) as unknown as ConfigService;

  it('returns a real-looking secret key', () => {
    expect(requireStripeSecretKey(configWith('sk_test_51AbCdEf'))).toBe('sk_test_51AbCdEf');
  });

  it('accepts a restricted key', () => {
    expect(requireStripeSecretKey(configWith('rk_live_51AbCdEf'))).toBe('rk_live_51AbCdEf');
  });

  it('trims surrounding whitespace, which pasting into a dashboard adds easily', () => {
    expect(requireStripeSecretKey(configWith('  sk_live_51AbCdEf  '))).toBe('sk_live_51AbCdEf');
  });

  // The bug: production booted with no key at all and only failed when a real
  // user pressed Pay, after the booking row had already been written.
  it('throws when STRIPE_SECRET_KEY is missing', () => {
    expect(() => requireStripeSecretKey(configWith(undefined))).toThrow(/STRIPE_SECRET_KEY is not set/);
  });

  it('throws on an empty or whitespace value', () => {
    expect(() => requireStripeSecretKey(configWith(''))).toThrow(/not set/);
    expect(() => requireStripeSecretKey(configWith('   '))).toThrow(/not set/);
  });

  // Guards the exact literal that shipped to production.
  it('rejects the old committed fallback key', () => {
    expect(() => requireStripeSecretKey(configWith('sk_test_mock_placeholder'))).toThrow(/placeholder/i);
  });

  it('rejects other placeholder shapes copied out of .env.example', () => {
    expect(() => requireStripeSecretKey(configWith('sk_test_your_stripe_key'))).toThrow(/placeholder/i);
    expect(() => requireStripeSecretKey(configWith('sk_test_changeme'))).toThrow(/placeholder/i);
    expect(() => requireStripeSecretKey(configWith('sk_test_xxx'))).toThrow(/placeholder/i);
  });

  it('rejects a publishable key, which cannot create a checkout session', () => {
    expect(() => requireStripeSecretKey(configWith('pk_test_51AbCdEf'))).toThrow(/publishable key/);
  });

  it('says where to get the real key', () => {
    expect(() => requireStripeSecretKey(configWith(undefined))).toThrow(/dashboard\.stripe\.com\/apikeys/);
    expect(() => requireStripeSecretKey(configWith(undefined))).toThrow(/Render dashboard/);
  });

  it('never leaks a full key into an error message', () => {
    const secret = 'sk_test_placeholder_but_long_enough_to_matter';
    try {
      requireStripeSecretKey(configWith(secret));
    } catch (error) {
      expect((error as Error).message).not.toContain(secret);
      return;
    }
    throw new Error('expected requireStripeSecretKey to throw');
  });
});
