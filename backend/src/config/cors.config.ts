import { Logger } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// FRONTEND_URL used to be handed to enableCors() as a single string. Nest then
// echoed that one literal value as Access-Control-Allow-Origin for every caller,
// so exactly one hostname could ever pass.
//
// Vercel serves the same frontend from several: the canonical alias
// (event-lounge-lyart.vercel.app), a unique URL per deployment
// (event-lounge-<hash>-<scope>.vercel.app), and one per branch
// (event-lounge-git-<branch>-<scope>.vercel.app). Opening any of them except the
// canonical alias got a header the browser rejected, so every request died with
// ERR_FAILED even though the API answered 200 with the right body.
//
// FRONTEND_URL is now a comma-separated list, and an entry may contain '*'.

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Origins are compared case-insensitively, and a trailing slash is not part of
// an origin. Browsers never send one, but hand-typed env values often have it.
const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, '').toLowerCase();

// '*' stands for one or more characters that are neither '.' nor '/'. That
// restriction is the whole security guarantee: it cannot cross a hostname label
// or escape into the path, so a pattern must name the account scope to be
// useful. 'https://event-lounge-*-myscope.vercel.app' matches this project's
// deployments and nothing else; it can never match another Vercel user's site.
export const originMatcher = (pattern: string): ((origin: string) => boolean) => {
  const normalized = normalizeOrigin(pattern);

  if (!normalized.includes('*')) {
    return (origin) => normalizeOrigin(origin) === normalized;
  }

  const source = normalized.split('*').map(escapeRegex).join('[^./]+');
  const regex = new RegExp(`^${source}$`);

  return (origin) => regex.test(normalizeOrigin(origin));
};

export const parseAllowedOrigins = (raw?: string): string[] => {
  const entries = (raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length > 0 ? entries : [...DEV_ORIGINS];
};

export const buildCorsOptions = (raw?: string): CorsOptions => {
  const patterns = parseAllowedOrigins(raw);
  const matchers = patterns.map(originMatcher);
  const logger = new Logger('Cors');
  // Printed on every boot so the deployed allow-list is verifiable from the
  // Render logs without guessing what the dashboard holds.
  logger.log(`Allowed origins: ${patterns.join(', ')}`);

  // A blocked origin is worth one warning, not one per request. The frontend
  // retries GETs three times, so an unconfigured origin would flood the logs.
  const alreadyWarned = new Set<string>();

  return {
    origin: (origin, callback) => {
      // No Origin header means no browser to protect: curl, the Render health
      // check, server-to-server calls, and the Stripe webhook all land here.
      if (!origin) {
        return callback(null, true);
      }

      if (matchers.some((matches) => matches(origin))) {
        return callback(null, true);
      }

      if (!alreadyWarned.has(origin)) {
        alreadyWarned.add(origin);
        logger.warn(
          `Blocked a cross-origin request from ${origin}. ` +
            'Add it to FRONTEND_URL (comma-separated, "*" allowed inside a hostname label) and redeploy.',
        );
      }

      // Reject by omitting the header, not by throwing. Throwing turns a CORS
      // miss into a 500 and buries the real cause; omitting it produces the
      // plain browser CORS error, which names the origin.
      return callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
};
