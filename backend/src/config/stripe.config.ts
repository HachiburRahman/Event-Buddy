import { ConfigService } from '@nestjs/config';

// STRIPE_SECRET_KEY has no safe default, for the same reason JWT_SECRET does not.
//
// PaymentsService used to construct Stripe with
// `stripeSecretKey || 'sk_test_mock_placeholder'`. A deployment missing the
// variable booted clean, served every page, and accepted bookings. The fake key
// only surfaced at the last possible moment, when a real user pressed Pay and
// got "Invalid API Key provided: sk_test_************lder" — and by then the
// booking row had already been written.
//
// Failing at boot moves that discovery from a paying customer to the deploy log.
export const requireStripeSecretKey = (configService: ConfigService): string => {
  const key = configService.get<string>('STRIPE_SECRET_KEY');

  if (!key || key.trim() === '') {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Checkout cannot work without it, so the API will not start. ' +
        'Set STRIPE_SECRET_KEY in backend/.env locally, or in the Render dashboard under Environment. ' +
        'Copy it from https://dashboard.stripe.com/apikeys (use the test key while developing).',
    );
  }

  const trimmed = key.trim();

  // The old fallback is public in this repo's history, and a placeholder copied
  // out of .env.example is just as dead. Both look configured to every check
  // except the one Stripe performs.
  if (/placeholder|your[_-]?stripe|changeme|xxx/i.test(trimmed)) {
    throw new Error(
      `STRIPE_SECRET_KEY looks like a placeholder ("${trimmed.slice(0, 12)}..."), not a real key. ` +
        'Stripe will reject it with "Invalid API Key provided" the first time someone tries to pay. ' +
        'Copy the real value from https://dashboard.stripe.com/apikeys.',
    );
  }

  if (!trimmed.startsWith('sk_') && !trimmed.startsWith('rk_')) {
    throw new Error(
      'STRIPE_SECRET_KEY does not look like a Stripe secret key. Expected it to start with "sk_" ' +
        '(or "rk_" for a restricted key). A publishable key ("pk_") will not work for checkout.',
    );
  }

  return trimmed;
};
