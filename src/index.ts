export type FetchArgs = [string | URL, RequestInit | undefined];
export type ReturnFetch = typeof returnFetch;

export type ReturnFetchDefaultOptions = {
  fetch?: ReturnType<ReturnFetch>;
  baseUrl?: string | URL;
  headers?: HeadersInit;
  interceptors?: {
    request?: (
      requestArgs: FetchArgs,
      fetch: ReturnFetchDefaultOptions["fetch"],
    ) => Promise<FetchArgs>;
    response?: (
      requestArgs: FetchArgs,
      response: Response,
      fetch: ReturnFetchDefaultOptions["fetch"],
    ) => Promise<Response>;
  };
};

const applyDefaultOptions = (
  [url, requestInit]: FetchArgs,
  defaultOptions?: ReturnFetchDefaultOptions,
): FetchArgs => {
  const headers = new Headers(defaultOptions?.headers);
  [...new Headers(requestInit?.headers).entries()].forEach(([key, value]) => {
    headers.set(key, value);
  });

  return [
    (() => {
      // ternary operator does not support short circuting after uglifying a bundle, so use 'if' statement instead.
      if (defaultOptions?.baseUrl) {
        return new URL(url, defaultOptions.baseUrl);
      } else {
        return url;
      }
    })(),
    {
      ...requestInit,
      headers,
    },
  ];
};

const returnFetch =
  (defaultOptions?: ReturnFetchDefaultOptions) =>
  async (
    url: string | URL,
    requestInit?: Parameters<typeof fetch>[1],
  ): Promise<Response> => {
    const fetchProvided = defaultOptions?.fetch ?? fetch;
    const defaultOptionAppliedArgs = applyDefaultOptions(
      [url, requestInit],
      defaultOptions,
    );

    // apply request interceptor
    let processedArgs: FetchArgs;
    if (defaultOptions?.interceptors?.request) {
      processedArgs = await defaultOptions?.interceptors?.request?.(
        defaultOptionAppliedArgs,
        fetchProvided,
      );
    } else {
      processedArgs = defaultOptionAppliedArgs;
    }

    // ajax call and apply response interceptor
    const response = await fetchProvided(...processedArgs);

    return (
      defaultOptions?.interceptors?.response?.(
        processedArgs,
        response,
        fetchProvided,
      ) ?? response
    );
  };

export default returnFetch;
