/**
 * A simple and powerful high order function to extend fetch.
 *
 * @packageDocumentation
 */

/**
 * Arguments of fetch function.
 *
 * Request inputs are normalized to a URL string and a buffered RequestInit.
 * @see {fetch, RequestInfo, Request}
 *
 * @public
 */
export type FetchArgs = [string | URL, RequestInit | undefined];

/**
 * Type of `returnFetch` function.
 * It is useful for whom want to write customized returnFetch function.
 *
 * @public
 */
export type ReturnFetch = typeof returnFetch;

/**
 * Options of `returnFetch` function.
 *
 * @public
 */
export type ReturnFetchDefaultOptions = {
  /**
   * `fetch` function to be used in `returnFetch` function.
   * If not provided, `fetch` function in global scope will be used.
   * Any fetch implementation can be used, such as `node-fetch`, `cross-fetch`, `isomorphic-fetch`, etc.
   *
   * a `fetch` function created by `returnFetch` also can be used here.
   *
   * @public
   */
  fetch?: ReturnType<ReturnFetch>;
  /**
   * Base URL of fetch. It will be used when the first argument of fetch is relative URL.
   *
   * @public
   */
  baseUrl?: string | URL;
  /**
   * Default headers of fetch. It will be used when the second argument of fetch does not have `headers` property.
   * If it is provided and `headers` also provided when calling a `fetch`, headers will be merged.
   * Priority of headers is `requestInit.headers` > `defaultOptions.headers`. Duplicated headers will be overwritten.
   *
   * @public
   */
  headers?: HeadersInit;
  interceptors?: {
    /**
     * Request interceptor. It will be called before request.
     *
     * @param requestArgs Arguments of fetch function.
     * @param fetch the `fetch` you provided at {@link ReturnFetchDefaultOptions['fetch']}
     *
     * @public
     */
    request?: (
      requestArgs: FetchArgs,
      fetch: NonNullable<ReturnFetchDefaultOptions["fetch"]>,
    ) => Promise<FetchArgs>;
    /**
     * Response interceptor. It will be called after response.
     *
     * @param response Response object received from fetch function.
     * @param requestArgs Arguments of fetch function.
     * @param fetch the `fetch` you provided at {@link ReturnFetchDefaultOptions['fetch']}
     *
     * @public
     */
    response?: (
      response: Response,
      requestArgs: FetchArgs,
      fetch: NonNullable<ReturnFetchDefaultOptions["fetch"]>,
    ) => Promise<Response>;
  };
};

// Keep the legacy reusable body while allowing aborts before fetch starts.
const bufferRequestBody = (
  request: Request,
): Promise<ArrayBuffer> | undefined => {
  const { body, signal } = request;
  if (body === null) return;

  // Piping propagates abort to both the source and the buffered response.
  // Native consumption also validates byte chunks and handles cross-realm views.
  // Older fetch polyfills keep their original arrayBuffer behavior.
  const source =
    typeof TransformStream === "undefined" || !body?.pipeThrough
      ? request
      : new Response(body.pipeThrough(new TransformStream(), { signal }));
  return source.arrayBuffer();
};

// Normalize native fields, then buffer for the existing interceptor contract.
const normalizeBufferedRequest = async (
  request: Request,
  requestInit?: RequestInit,
): Promise<FetchArgs> => {
  // Let native Request read options in its own order, but evaluate each getter
  // only once when retaining those options after normalization.
  const values: Record<PropertyKey, unknown> = Object.create(null);
  const options =
    requestInit === undefined
      ? undefined
      : new Proxy(requestInit, {
          get(target, key) {
            if (!(key in values)) {
              values[key] = (target as Record<PropertyKey, unknown>)[key];
            }
            return values[key];
          },
        });
  const mergedRequest = new Request(
    request,
    options && Object.keys(options).length
      ? options
      : {
          referrer: request.referrer,
          referrerPolicy: request.referrerPolicy,
        },
  );

  const body = await bufferRequestBody(mergedRequest);
  // Copy native fields in the legacy order; preserve only the buffered body.
  const normalized: RequestInit = { ...options };
  (
    [
      "method",
      "headers",
      "body",
      "referrer",
      "referrerPolicy",
      "mode",
      "cache",
      "redirect",
      "credentials",
      "integrity",
      "keepalive",
      "signal",
    ] as const
  ).forEach((key) => {
    (normalized as Record<string, unknown>)[key] =
      key === "body"
        ? body && body.byteLength
          ? body
          : undefined
        : mergedRequest[key];
  });
  normalized.window = options?.window;
  return [request.url, normalized];
};

const normalizeArgs = (
  input: RequestInfo | URL,
  init?: RequestInit,
): FetchArgs | Promise<FetchArgs> =>
  input instanceof Request
    ? normalizeBufferedRequest(input, init)
    : [input, init];

const returnFetch =
  (defaultOptions?: ReturnFetchDefaultOptions) =>
  async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const [input, requestInit] = await normalizeArgs(...args);
    const headers = new Headers(defaultOptions?.headers);
    new Headers(requestInit?.headers).forEach((value, key) => {
      headers.set(key, value);
    });
    const defaultOptionAppliedArgs: FetchArgs = [
      defaultOptions?.baseUrl ? new URL(input, defaultOptions.baseUrl) : input,
      { ...requestInit, headers },
    ];

    // apply request interceptor
    const fetchProvided = defaultOptions?.fetch || fetch;
    const requestInterceptorAppliedArgs = defaultOptions?.interceptors?.request
      ? await defaultOptions.interceptors.request(
          defaultOptionAppliedArgs,
          fetchProvided,
        )
      : defaultOptionAppliedArgs;

    // ajax call
    const response = await fetchProvided(...requestInterceptorAppliedArgs);

    // apply response interceptor
    return (
      defaultOptions?.interceptors?.response?.(
        response,
        requestInterceptorAppliedArgs,
        fetchProvided,
      ) || response
    );
  };

export default returnFetch;
