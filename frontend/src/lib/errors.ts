// Every page used to read `err.response?.data?.message` and fall back to a
// hardcoded string when it was missing. But a request that never reaches the
// server has no `response` at all, so a CORS block, a cold Render instance, or
// an offline laptop all produced the fallback. On the login page that read
// "Please check your credentials and try again" while the credentials were
// fine and had never been checked, which is a wrong diagnosis in the one place
// a user is least able to argue with it.
//
// Transport failures and server answers are different things, so say so.

const OFFLINE_MESSAGE =
  'Could not reach the server. It may be waking up after a period of inactivity — wait a few seconds and try again.';

const TIMEOUT_MESSAGE =
  'The server took too long to respond. It may be waking up — wait a few seconds and try again.';

type ApiError = {
  code?: string;
  response?: { data?: { message?: string | string[] } };
};

// class-validator returns an array of messages for a failed DTO. Joining beats
// rendering "[object Object]" or only the first rule that tripped.
const readServerMessage = (error: ApiError): string | null => {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    const joined = message.filter(Boolean).join('. ');
    return joined.length > 0 ? joined : null;
  }

  return typeof message === 'string' && message.trim().length > 0 ? message : null;
};

/**
 * Turns an Axios failure into something worth showing a user.
 *
 * `fallback` is only used when the server answered but said nothing useful, so
 * it is safe to write it as a statement about the request rather than a guess
 * about what the user did wrong.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as ApiError;

  const serverMessage = readServerMessage(apiError);
  if (serverMessage) {
    return serverMessage;
  }

  if (apiError?.code === 'ECONNABORTED' || apiError?.code === 'ETIMEDOUT') {
    return TIMEOUT_MESSAGE;
  }

  // No response object means the request died in transit: CORS rejection,
  // DNS failure, connection reset, or no network.
  if (!apiError?.response) {
    return OFFLINE_MESSAGE;
  }

  return fallback;
};
