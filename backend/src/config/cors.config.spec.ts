import { buildCorsOptions, originMatcher, parseAllowedOrigins } from './cors.config';

// The real deployment, kept literal so the regression is obvious.
const CANONICAL = 'https://event-lounge-lyart.vercel.app';
const DEPLOYMENT = 'https://event-lounge-4mt5jk56f-hachiburrahman15-2228s-projects.vercel.app';
const PREVIEW_PATTERN = 'https://event-lounge-*-hachiburrahman15-2228s-projects.vercel.app';

// enableCors() takes a callback, so exercise it the way the cors package does.
const allows = (raw: string | undefined, origin: string | undefined): boolean => {
  const originOption = buildCorsOptions(raw).origin as (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => void;

  let allowed: boolean | undefined;
  originOption(origin, (error, value) => {
    if (error) throw error;
    allowed = value;
  });

  return allowed === true;
};

describe('parseAllowedOrigins', () => {
  it('splits a comma-separated list and trims each entry', () => {
    expect(parseAllowedOrigins(` ${CANONICAL} , ${PREVIEW_PATTERN} `)).toEqual([
      CANONICAL,
      PREVIEW_PATTERN,
    ]);
  });

  it('falls back to localhost when FRONTEND_URL is unset, so local dev works', () => {
    expect(parseAllowedOrigins(undefined)).toEqual([
      'http://localhost:3000',
      'http://localhost:3001',
    ]);
  });

  it('falls back when the value is empty or only separators', () => {
    expect(parseAllowedOrigins('')).toHaveLength(2);
    expect(parseAllowedOrigins('  ,  ,')).toHaveLength(2);
  });
});

describe('originMatcher', () => {
  it('matches an exact origin', () => {
    expect(originMatcher(CANONICAL)(CANONICAL)).toBe(true);
  });

  it('ignores case and a trailing slash on either side', () => {
    expect(originMatcher(`${CANONICAL}/`)(CANONICAL.toUpperCase())).toBe(true);
  });

  it('rejects a different host', () => {
    expect(originMatcher(CANONICAL)('https://evil.example.com')).toBe(false);
  });

  it('matches Vercel deployment URLs through a wildcard', () => {
    expect(originMatcher(PREVIEW_PATTERN)(DEPLOYMENT)).toBe(true);
  });

  it('matches Vercel branch previews through the same wildcard', () => {
    expect(
      originMatcher(PREVIEW_PATTERN)(
        'https://event-lounge-git-main-hachiburrahman15-2228s-projects.vercel.app',
      ),
    ).toBe(true);
  });

  // The wildcard must not cross a hostname label, or 'https://*.vercel.app'
  // would hand a credentialed API to anyone who can deploy to Vercel.
  it('does not let the wildcard cross a dot', () => {
    const matcher = originMatcher('https://event-lounge-*.vercel.app');
    expect(matcher('https://event-lounge-abc.vercel.app')).toBe(true);
    expect(matcher('https://event-lounge-abc.attacker.vercel.app')).toBe(false);
  });

  it('does not let the wildcard escape into the path', () => {
    expect(originMatcher('https://*.example.com')('https://a.example.com/../evil')).toBe(false);
  });

  it('anchors the pattern at both ends', () => {
    const matcher = originMatcher(PREVIEW_PATTERN);
    expect(matcher(`${DEPLOYMENT}.attacker.com`)).toBe(false);
    expect(matcher(`https://attacker.com/${DEPLOYMENT}`)).toBe(false);
  });

  it('requires the wildcard to match at least one character', () => {
    expect(originMatcher('https://event-lounge-*.vercel.app')('https://event-lounge-.vercel.app')).toBe(
      false,
    );
  });

  it('treats dots in the pattern as literals, not regex wildcards', () => {
    expect(originMatcher('https://a.example.com')('https://aXexample.com')).toBe(false);
  });
});

describe('buildCorsOptions', () => {
  const configured = `${CANONICAL},${PREVIEW_PATTERN}`;

  // The bug: a single string meant the canonical alias was the only origin that
  // could ever pass, so every Vercel deployment URL got ERR_FAILED on a 200.
  it('allows a Vercel deployment URL alongside the canonical alias', () => {
    expect(allows(configured, CANONICAL)).toBe(true);
    expect(allows(configured, DEPLOYMENT)).toBe(true);
  });

  it('still rejects an origin nobody configured', () => {
    expect(allows(configured, 'https://not-my-app.vercel.app')).toBe(false);
    expect(allows(configured, 'https://evil.example.com')).toBe(false);
  });

  it('allows requests with no Origin header, so curl and health checks work', () => {
    expect(allows(configured, undefined)).toBe(true);
    expect(allows(configured, '')).toBe(true);
  });

  it('keeps credentials on, which the JWT bearer flow relies on', () => {
    expect(buildCorsOptions(configured).credentials).toBe(true);
  });

  it('still permits every method the API exposes', () => {
    expect(buildCorsOptions(configured).methods).toBe('GET,HEAD,PUT,PATCH,POST,DELETE');
  });

  it('rejects without throwing, so a CORS miss is never a 500', () => {
    const originOption = buildCorsOptions(configured).origin as (
      origin: string,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => void;

    const callback = jest.fn();
    expect(() => originOption('https://evil.example.com', callback)).not.toThrow();
    expect(callback).toHaveBeenCalledWith(null, false);
  });
});
