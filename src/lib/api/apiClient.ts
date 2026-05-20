/**
 * API Client — thin fetch wrapper for the Downxtown backend.
 *
 * Features:
 *  - 30-second request timeout via AbortController
 *  - Automatic Bearer token injection from authManager
 *  - 401 → force-refresh token → retry-once logic
 *  - On second 401: broadcast sign-out event via BroadcastChannel('auth')
 *  - Typed ApiError for all 4xx / 5xx responses
 */

import { authManager } from '@/lib/firebase/authManager';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.downxtown.com';
const TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Shape of the error body the backend returns for 4xx / 5xx responses. */
interface ErrorBody {
  code?: string;
  message?: string;
  error?: string;
}

/**
 * Attempt to parse an error body from a non-OK response.
 * Falls back to generic values when the body is not valid JSON.
 */
async function parseErrorBody(response: Response): Promise<{ code: string; message: string }> {
  try {
    const body: ErrorBody = await response.json();
    return {
      code: body.code ?? body.error ?? 'UNKNOWN_ERROR',
      message: body.message ?? response.statusText ?? 'An unexpected error occurred',
    };
  } catch {
    return {
      code: 'UNKNOWN_ERROR',
      message: response.statusText || 'An unexpected error occurred',
    };
  }
}

/** Broadcast a sign-out event to all open tabs. */
function broadcastSignOut(): void {
  try {
    const channel = new BroadcastChannel('auth');
    channel.postMessage({ type: 'signout' });
    channel.close();
  } catch {
    // BroadcastChannel may not be available in all environments (e.g. SSR).
  }
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

export interface ApiRequestOptions {
  /** Additional headers to merge into the request. */
  headers?: Record<string, string>;
  /** When false, the Authorization header is omitted. Defaults to true. */
  auth?: boolean;
}

/**
 * Execute an authenticated HTTP request against the Downxtown API.
 *
 * @param method  HTTP method (GET, POST, PUT, DELETE, …)
 * @param path    Path relative to the base URL, e.g. `/buyer/profile`
 * @param body    Optional request body (will be JSON-serialised)
 * @param options Additional options (extra headers, auth flag)
 */
export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, headers: extraHeaders = {} } = options;

  // -------------------------------------------------------------------------
  // Inner helper: perform a single fetch attempt with the given token.
  // -------------------------------------------------------------------------
  async function attempt(token: string | null): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: Record<string, string> = {
      ...extraHeaders,
    };

    // Only set Content-Type when sending a body. Setting it on GET/DELETE
    // requests (which have no body) triggers an unnecessary CORS preflight
    // that some server CORS configs reject, silently blocking the request.
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // -------------------------------------------------------------------------
  // First attempt
  // -------------------------------------------------------------------------
  const token = auth ? await authManager.getCurrentIdToken() : null;
  let response = await attempt(token);

  // -------------------------------------------------------------------------
  // 401 handling: force-refresh token and retry once
  // -------------------------------------------------------------------------
  if (response.status === 401 && auth) {
    const refreshedToken = await authManager.getCurrentIdToken(true);
    response = await attempt(refreshedToken);

    // Second 401 → sign out across all tabs
    if (response.status === 401) {
      broadcastSignOut();
      throw new ApiError(401, 'UNAUTHENTICATED', 'Session expired. Please sign in again.');
    }
  }

  // -------------------------------------------------------------------------
  // 4xx / 5xx error mapping
  // -------------------------------------------------------------------------
  if (!response.ok) {
    const { code, message } = await parseErrorBody(response);
    throw new ApiError(response.status, code, message);
  }
  // -------------------------------------------------------------------------
  // Parse and return the response body
  // -------------------------------------------------------------------------

  // Handle 204 No Content (and similar empty responses)
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status === 204 || !contentType.includes('application/json')) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const api = {
  /**
   * HTTP GET — fetch a resource.
   * @example api.get<Product>('/products/123')
   */
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>('GET', path, undefined, options);
  },

  /**
   * HTTP POST — create a resource or trigger an action.
   * @example api.post<OrderResponse>('/orders', orderPayload)
   */
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>('POST', path, body, options);
  },

  /**
   * HTTP PUT — replace / update a resource.
   * @example api.put<void>('/buyer/address', addressPayload)
   */
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>('PUT', path, body, options);
  },

  /**
   * HTTP DELETE — remove a resource.
   * @example api.delete<void>('/buyer/account')
   */
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>('DELETE', path, undefined, options);
  },
};
