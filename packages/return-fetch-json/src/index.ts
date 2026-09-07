import returnFetch, {
  FetchArgs,
  ReturnFetchDefaultOptions,
} from "return-fetch";

export type ReturnFetchJson = typeof returnFetchJson;

export type ReturnFetchJsonDefaultOptions = ReturnFetchDefaultOptions & {
  jsonParser?: typeof JSON.parse;
};

// Use as a replacer of `RequestInit`
export type JsonRequestInit = Omit<NonNullable<FetchArgs[1]>, "body"> & {
  body?: object;
};

// Use as a replacer of `Response`
export type ResponseGenericBody<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | "clone"
> & {
  body: T;
};

/** Parsed JSON, or trimmed text when the response is not valid JSON. */
export type JsonResponse<T> = ResponseGenericBody<T | string>;

// this resembles the default behavior of axios json parser
// https://github.com/axios/axios/blob/21a5ad34c4a5956d81d338059ac0dd34a19ed094/lib/defaults/index.js#L25
const parseJsonSafely = (text: string, jsonParser = JSON.parse): unknown => {
  try {
    return jsonParser(text);
  } catch (e) {
    if ((e as Error).name !== "SyntaxError") {
      throw e;
    }

    return text.trim();
  }
};

// Write your own high order function to serialize request body and deserialize response body.
const returnFetchJson = (args?: ReturnFetchJsonDefaultOptions) => {
  const fetch = returnFetch(args);

  return async <T = unknown>(
    url: string | URL,
    init?: JsonRequestInit,
  ): Promise<JsonResponse<T>> => {
    const headers = new Headers(args?.headers);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    if (init?.method && init.method.toUpperCase() !== "GET") {
      headers.has("Content-Type") ||
        headers.set("Content-Type", "application/json");
    }
    headers.has("Accept") || headers.set("Accept", "application/json");

    const response = await fetch(url, {
      ...init,
      headers,
      body: init?.body && JSON.stringify(init.body),
    });

    const body = parseJsonSafely(await response.text(), args?.jsonParser) as T;

    return {
      headers: response.headers,
      ok: response.ok,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      body,
    };
  };
};

export default returnFetchJson;
