import { ConfigService } from '@nestjs/config';

// JWT_SECRET has no safe default.
//
// It used to be read two different ways: auth.module.ts passed the raw value
// straight to JwtModule, while jwt.strategy.ts fell back to a literal string
// committed in this repo. When the variable was missing the app still booted,
// then failed in two ways at once. Signing threw, so a correct password
// returned 500 instead of a token. Verification kept working against the public
// fallback, so anyone could mint a token that the API accepted.
//
// Both sides now call this, so a missing secret stops the process at boot with
// a message you can act on, instead of shipping a broken and open API.
export const requireJwtSecret = (configService: ConfigService): string => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET is not set. The API cannot sign or verify tokens without it, so it will not start. ' +
      'Set JWT_SECRET in backend/.env locally, or in the Render dashboard under Environment. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    );
  }

  return secret;
};
