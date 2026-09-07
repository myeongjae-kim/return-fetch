/**
 * A simple and powerful high order function to extend fetch.
 *
 * @packageDocumentation
 */

/**
 * Arguments of fetch function.
 *
 * Request inputs are passed through without reading their bodies.
 * @see {fetch, RequestInfo, Request}
 *
 * @public
 */
export type FetchArgs = [RequestInfo | URL, RequestInit | undefined];

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
   * Call headers override defaults. For Request inputs, omitted call headers inherit
   * the Request's headers; explicit call headers replace them before merging defaults.
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

const applyDefaultOptions = (
  [input, requestInit]: FetchArgs,
  defaultOptions?: ReturnFetchDefaultOptions,
): FetchArgs => {
  const isRequest = input instanceof Request;
  if (isRequest && !defaultOptions?.headers) {
    return [input, requestInit];
  }
  const headers = new Headers(defaultOptions?.headers);
  new Headers(
    requestInit?.headers ?? (isRequest ? input.headers : undefined),
  ).forEach((value, key) => {
    headers.set(key, value);
  });

  let inputToReturn: FetchArgs[0] = input;
  if (!isRequest && defaultOptions?.baseUrl) {
    inputToReturn = new URL(input, defaultOptions.baseUrl);
  }

  return [
    inputToReturn,
    {
      ...requestInit,
      headers,
    },
  ];
};

const returnFetch =
  (defaultOptions?: ReturnFetchDefaultOptions) =>
  async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const defaultOptionAppliedArgs = applyDefaultOptions(
      [input, init],
      defaultOptions,
    );

    // apply request interceptor
    const fetchProvided = defaultOptions?.fetch || fetch;
    let requestInterceptorAppliedArgs: FetchArgs;
    if (defaultOptions?.interceptors?.request) {
      requestInterceptorAppliedArgs =
        await defaultOptions?.interceptors?.request?.(
          defaultOptionAppliedArgs,
          fetchProvided,
        );
    } else {
      requestInterceptorAppliedArgs = defaultOptionAppliedArgs;
    }

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
