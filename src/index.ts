export type FetchArgs = [string | URL, RequestInit | undefined];
export type ReturnFetch = typeof returnFetch;

export type ReturnFetchDefaultOptions = {
  fetch?: ReturnType<ReturnFetch>;
  baseUrl?: string | URL;
  headers?: Record<string, string>;
  interceptors?: {
    request?: (args: FetchArgs) => Promise<FetchArgs>;
    response?: (
      requestArgs: FetchArgs,
      response: Response,
    ) => Promise<Response>;
  };
};

const applyDefaultOptions = (
  [url, requestInit]: FetchArgs,
  defaultOptions?: ReturnFetchDefaultOptions,
): FetchArgs => [
  (() => {
    // ternary operator does not support short circuting, so use 'if' statement instead.
    if (defaultOptions?.baseUrl) {
      return new URL(url, defaultOptions.baseUrl);
    } else {
      return url;
    }
  })(),
  {
    ...requestInit,
    headers: { ...defaultOptions?.headers, ...requestInit?.headers },
  },
];

export const returnFetch =
  (defaultOptions?: ReturnFetchDefaultOptions) =>
  async (
    url: string | URL,
    requestInit?: Parameters<typeof fetch>[1],
  ): Promise<Response> => {
    const defaultOptionAppliedArgs = applyDefaultOptions(
      [url, requestInit],
      defaultOptions,
    );

    // apply request interceptor
    const processedArgs: FetchArgs =
      (await defaultOptions?.interceptors?.request?.(
        defaultOptionAppliedArgs,
      )) ?? defaultOptionAppliedArgs;

    // ajax call and apply response interceptor
    const response = await (defaultOptions?.fetch ?? fetch)(...processedArgs);

    return (
      defaultOptions?.interceptors?.response?.(processedArgs, response) ??
      response
    );
  };
