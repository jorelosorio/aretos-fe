import { isAxiosError } from 'axios';

/** Body of every non-2xx response (`internal/api/errors.ErrorResponse`). */
type ApiErrorBody = {
  error: string;
  code: string;
  details?: string;
};

/** A request that never got a response: offline, DNS, timeout, wrong base URL. */
export const NETWORK_ERROR = 'NETWORK_ERROR';

/**
 * Every failure the app handles, in one shape — whether it came back from the
 * API, died in transit, or was thrown locally. Features branch on `code`,
 * which is the backend's contract (`internal/api/errors/codes.go`); `message`
 * is English-only and meant for logs, never for the UI.
 */
export class ApiError extends Error {
  readonly code: string;
  /** Absent when the request never reached the server. */
  readonly status?: number;

  constructor(code: string, message: string, status?: number, cause?: unknown) {
    super(message, { cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }

  get isNetworkError() {
    return this.status === undefined;
  }

  /** True for anything only a new login can fix. */
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return typeof (body as ApiErrorBody | undefined)?.code === 'string';
}

/** Funnels anything thrown by a request into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const { response } = error;
    if (!response)
      return new ApiError(NETWORK_ERROR, error.message, undefined, error);

    // A proxy 5xx or a 404 on a bad base URL comes back as HTML, so fall back
    // to the status rather than trusting the body's shape.
    return isApiErrorBody(response.data)
      ? new ApiError(
          response.data.code,
          response.data.error,
          response.status,
          error,
        )
      : new ApiError(
          `HTTP_${response.status}`,
          error.message,
          response.status,
          error,
        );
  }

  const message = error instanceof Error ? error.message : String(error);
  return new ApiError('UNKNOWN_ERROR', message, undefined, error);
}
