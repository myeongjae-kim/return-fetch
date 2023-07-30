/**
 * A simple and powerful high order function to extend fetch.
 *
 * @packageDocumentation
 */

/**
 * Type of `fetch` function.
 * It is simplified to be used in request, response interceptors.
 *
 * Before calling request interceptor, `fetch` arguments is preprocessed to be `FetchArgs`.
 *
 * @public
 */
export type FetchArgs = [string, Request];

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
      fetch: ReturnFetchDefaultOptions["fetch"],
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
      fetch: ReturnFetchDefaultOptions["fetch"],
    ) => Promise<Response>;
  };
};

const getUrlFromFetchParams = ([input]: Parameters<typeof fetch>): string => {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
};

const returnFetch =
  (defaultOptions?: ReturnFetchDefaultOptions) =>
  async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const fetchProvided = defaultOptions?.fetch ?? fetch;

    const [, requestInit] = args;
    let url = getUrlFromFetchParams(args);
    if (defaultOptions?.baseUrl) {
      url = new URL(url, defaultOptions?.baseUrl).toString();
    }

    // merge headers
    const headers = new Headers(defaultOptions?.headers);
    new Headers(requestInit?.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    let processedArgs: FetchArgs = [
      url,
      new Request(url, { ...requestInit, headers }),
    ];

    // apply request interceptor
    if (defaultOptions?.interceptors?.request) {
      processedArgs = await defaultOptions?.interceptors?.request?.(
        processedArgs,
        fetchProvided,
      );
    }

    // ajax call and apply response interceptor
    const response = await fetchProvided(...processedArgs);

    return (
      defaultOptions?.interceptors?.response?.(
        response,
        processedArgs,
        fetchProvided,
      ) ?? response
    );
  };

export default returnFetch;
