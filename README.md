<h1 align="center">⛓️ return-fetch</h1>

<p align="center">
  A simple and powerful high order function to extend <code>fetch</code> for baseUrl, default headers, and
interceptors. <br/>
  <a href="https://return-fetch.myeongjae.kim" target="_blank">
    <strong>See interactive documentation</strong>
  </a>
  or
  <a href="https://stackblitz.com/edit/return-fetch" target="_blank">
    <strong>demo</strong>.
  </a>
</p>

<p align="center">
  <a href="https://github.com/deer-develop/return-fetch/actions?query=workflow%3ACI">
    <img src="https://github.com/deer-develop/return-fetch/workflows/CI/badge.svg" alt="CI" height="18">
  </a>
  <a href="https://codecov.io/gh/deer-develop/return-fetch">
    <img src="https://img.shields.io/codecov/c/github/deer-develop/return-fetch.svg" alt="Test Coverage" height="18">
  </a>
  <a href="https://www.npmjs.com/package/return-fetch">
    <img src="https://img.shields.io/npm/v/return-fetch.svg" alt="npm version" height="18">
  </a>
  <a href="https://bundlephobia.com/package/return-fetch">
    <img src="https://img.shields.io/bundlephobia/minzip/return-fetch" alt="Bundle Size" height="18">
  </a>
  <a href="https://raw.githubusercontent.com/deer-develop/return-fetch/main/LICENSE">
    <img src="https://img.shields.io/npm/l/return-fetch.svg" alt="MIT license" height="18">
  </a>
</p>

```ts
import returnFetch from "return-fetch";

const fetchExtended = returnFetch({
   baseUrl: "https://jsonplaceholder.typicode.com",
   headers: { Accept: "application/json" },
   interceptors: {
      request: async (args) => {
         console.log("********* before sending request *********");
         console.log("url:", args[0].toString());
         console.log("requestInit:", args[1], "\n\n");
         return args;
      },

      response: async (requestArgs, response) => {
         console.log("********* after receiving response *********");
         console.log("url:", requestArgs[0].toString());
         console.log("requestInit:", requestArgs[1], "\n\n");
         return response;
      },
   },
});

fetchExtended("/todos/1", { method: "GET" })
        .then((it) => it.text())
        .then(console.log);
```

**Output**

```
********* before sending request *********
url: https://jsonplaceholder.typicode.com/todos/1
requestInit: { method: 'GET', headers: { Accept: 'application/json' } } 


********* after receiving response *********
url: https://jsonplaceholder.typicode.com/todos/1
requestInit: { method: 'GET', headers: { Accept: 'application/json' } } 


{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

## Background

The [Next.js framework](https://nextjs.org/)(which I love so much) [v13 App Router](https://nextjs.org/docs/app) uses
[its own `fetch` that extends `node-fetch`](https://nextjs.org/docs/app/api-reference/functions/fetch) to do
server side things like caching. I was accustomed to using [Axios](https://github.com/axios/axios) for API calls, but
I have felt that now is the time to replace Axios with `fetch` finally. The most disappointing aspect I found when
trying to replace Axios with `fetch` was that `fetch` does not have any interceptors. I thought surely someone
must have implemented it, so I searched for libraries. However, there was no library capable of handling various
situations, only one that could add a single request and response interceptors to the global `fetch`. This is the
reason why I decided to implement it myself.

### Philosophy

In implementing the `fetch` interceptors, I considered the following points:

1. **Minimalistic.** I decided to only implement the following additional functions and not others:
   1. Implementing request and response interceptors
   2. Specifying a baseUrl
   3. Setting a default header
2. **No peer dependencies**. I decided not to use any other libraries. This is because I would like to keep the library
   as light as possible, and running any execution environments which have `fetch` (e.g. Node.js, Web Browsers, React
   Native, Web Workers).
3. It should be **easy to add interceptors** because `return-fetch` will provide minimal functionality. Users should be
   able to extend fetch as they wish.
4. The code to add interceptors should be reusable and able to maintain the **Single Responsibility Principle (SRP)**,
   and it should be possible to combine interceptors that adhere to the SRP.
5. **Liskov Substitution Principle (LSP)** should be maintained. The `fetch` function should be able to be used as a
   `fetch` function without any problems.

### Good Things

- Superlight bundle size < 1KB.
- No peer dependencies.
- No side effects. Pure functional.
- No classes. Just a function.
- Recursive type definition to chain functions infinitely.
- Any execution environment having fetch, possible for any `fetch` polyfills.
- 100% TypeScript.
- 100% test coverage.

## Installation

### Package Manager

Via npm

```bash
npm install return-fetch
```

Via yarn

```bash
yarn add return-fetch
```

Via pnpm

```bash
pnpm add return-fetch
```

### \<script\> tag

```html
<!--
  Pick your favourite CDN:
    - https://unpkg.com/return-fetch
    - https://cdn.jsdelivr.net/npm/return-fetch
    - https://www.skypack.dev/view/return-fetch
    - https://cdnjs.com/libraries/return-fetch
    - …
-->

<!-- UMD import as window.returnFetch -->
<script src="https://unpkg.com/return-fetch"></script>

<!-- Modern import -->
<script type="module">
  import returnFetch from 'https://cdn.skypack.dev/return-fetch/dist/index.js'

  // ... //
</script>
```

## Demo

Run on <a href="https://stackblitz.com/edit/return-fetch" target="_blank">Stickblitz</a>.

## Types

https://return-fetch.myeongjae.kim/docs/types/ReturnFetchDefaultOptions.html

## Usage

### #1. Display/Hide loading indicator

```ts
import returnFetch, { ReturnFetch } from "return-fetch";
import { displayLoadingIndicator, hideLoadingIndicator } from "@/your/adorable/loading/indicator";

// Write your own high order function to display/hide loading indicator
const returnFetchWithLoadingIndicator: ReturnFetch = (args) => returnFetch({
  ...args,
  interceptors: {
    request: async (args) => {
      setLoading(true);
      return args;
    },
    response: async (requestArgs, response) => {
      setLoading(false);
      return response;
    },
  },
})

// Create an extended fetch function and use it instead of the global fetch.
export const fetchExtended = returnFetchWithLoadingIndicator({
  // default options
});

//////////////////// Use it somewhere ////////////////////
fetchExtended("/sample/api");
```

### #2. Throw an error if a response status is more than or equal to 400

```ts
import returnFetch, { ReturnFetch } from "return-fetch";

// Write your own high order function to throw an error if a response status is more than or equal to 400.
const returnFetchThrowingErrorByStatusCode: ReturnFetch = (args) => returnFetch({
  ...args,
  interceptors: {
    response: async (_, response) => {
      if (response.status >= 400) {
        throw await response.text().then(Error);
      }

      return response;
    },
  },
})

// Create an extended fetch function and use it instead of the global fetch.
export const fetchExtended = returnFetchThrowingErrorByStatusCode({
  // default options
});

//////////////////// Use it somewhere ////////////////////
fetchExtended("/sample/api/400").catch((e) => { alert(e.message); });
```

### #3. Serialize request body and deserialize response body

You can import below example code because it is published as a separated npm package:
[return-fetch-json](https://www.npmjs.com/package/return-fetch-json)

```ts
import returnFetch, { FetchArgs, ReturnFetchDefaultOptions } from "return-fetch";

// Use as a replacer of `RequestInit`
type JsonRequestInit = Omit<NonNullable<FetchArgs[1]>, "body"> & { body?: object };

// Use as a replacer of `Response`
export type ResponseGenericBody<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | "clone"
> & {
  body: T;
};

export type JsonResponse<T> = T extends object
  ? ResponseGenericBody<T>
  : ResponseGenericBody<string>;


// this resembles the default behavior of axios json parser
// https://github.com/axios/axios/blob/21a5ad34c4a5956d81d338059ac0dd34a19ed094/lib/defaults/index.js#L25
const parseJsonSafely = (text: string): object | string => {
  try {
    return JSON.parse(text);
  } catch (e) {
    if ((e as Error).name !== "SyntaxError") {
      throw e;
    }

    return text.trim();
  }
};

// Write your own high order function to serialize request body and deserialize response body.
export const returnFetchJson = (args?: ReturnFetchDefaultOptions) => {
  const fetch = returnFetch(args);

  return async <T>(
    url: FetchArgs[0],
    init?: JsonRequestInit,
  ): Promise<JsonResponse<T>> => {
    const response = await fetch(url, {
      ...init,
      body: init?.body && JSON.stringify(init.body),
    });

    const body = parseJsonSafely(await response.text()) as T;

    return {
      headers: response.headers,
      ok: response.ok,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      body,
    } as JsonResponse<T>;
  };
};

// Create an extended fetch function and use it instead of the global fetch.
export const fetchExtended = returnFetchJson({
  // default options
});

//////////////////// Use it somewhere ////////////////////
export type ApiResponse<T> = {
  status: number;
  statusText: string;
  data: T;
};

fetchExtended<ApiResponse<{ message: string }>>("/sample/api/echo", {
  method: "POST",
  body: { message: "Hello, world!" }, // body should be an object.
}).then(it => it.body);
```

### #4. Compose above three high order functions to create your awesome fetch 🥳

Because of the recursive type definition, you can chain extended returnFetch functions as many as you want. It allows
you to write extending functions which are responsible only for a single feature. Is a good practice to stick to **the
Single Responsibility Principle** and writing a reusable function to write clean code.

```ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";

/*
  Compose high order functions to create your awesome fetch.
   1. Add loading indicator.
   2. Throw an error when a response's status code is 400 or more.
   3. Serialize request body and deserialize response body as json and return it.
*/
export const fetchExtended = returnFetchJson({
  fetch: returnFetchThrowingErrorByStatusCode({
    fetch: returnFetchWithLoadingIndicator({
      // default options
    }),
  }),
});

//////////////////// Use it somewhere ////////////////////
fetchExtended("/sample/api/echo", {
  method: "POST",
  body: { message: "this is an object of `ApiResponse['data']`" }, // body should be an object.
}).catch((e) => { alert(e.message); });
```

### #5. Use any `fetch` implementation

`fetch` has been added since [Node.js v17.5 as an experimental feature](https://nodejs.org/tr/blog/release/v17.5.0),
also available from [Node.js v16.15](https://nodejs.org/tr/blog/release/v16.15.0) and
[still experimental(29 JUL 2023, v20.5.0)](https://nodejs.org/docs/v20.5.0/api/globals.html#fetch). You can use
'[node-fetch](https://github.com/node-fetch/node-fetch)' as a polyfill for Node.js v16.15 or lower,
or '[whatwg-fetch](https://github.com/JakeChampion/fetch)' for old web browsers, or
'[cross-fetch](https://github.com/lquixada/cross-fetch)' for both web browser and Node.js.

Next.js has already included 'node-fetch' and
[they extend it for server-side things like caching](https://nextjs.org/docs/app/api-reference/functions/fetch).

Whatever a `fetch` you use, you can use `return-fetch` as long as the `fetch` you use is compatible with the
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). <span class="opacity-60 text-[0.8em]">(It is
`string | URL` which is a type of first argument of `fetch` created by `return-fetch`. It does not support
`Request` object as a first argument of a customized `fetch` yet. If you need to use `Request` object, please
wait or [contribute💙](https://github.com/deer-develop/return-fetch/issues/1))</span>

#### #5-1. `node-fetch`

I implemented a simple proxy for https://postman-echo.com with `node-fetch` as an example using
[Next.js route handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

```ts
// src/app/sample/api/proxy/postman-echo/node-fetch/[[...path]]/route.ts
import { NextRequest } from "next/server";
import nodeFetch from "node-fetch";
import returnFetch, { ReturnFetchDefaultOptions } from "return-fetch";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // to turn off SSL certificate verification on server side
const pathPrefix = "/sample/api/proxy/postman-echo/node-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    // Use node-fetch instead of global fetch
    fetch: nodeFetch as ReturnFetchDefaultOptions["fetch"],
    baseUrl: "https://postman-echo.com",
  });

  const response = await fetch(nextUrl.pathname.replace(pathPrefix, ""), {
    method,
    headers,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
```

Send a request to the proxy route.

```ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";

export const fetchExtended = returnFetchJson({
  fetch: returnFetchThrowingErrorByStatusCode({
    fetch: returnFetchWithLoadingIndicator({
      baseUrl: "https://return-fetch.myeongjae.kim",
    }),
  }),
});

//////////////////// Use it somewhere ////////////////////
fetchExtended(
  "/sample/api/proxy/postman-echo/node-fetch/get",
  {
    headers: {
      "X-My-Custom-Header": "Hello World!"
    }
  },
);
```

#### #5-2. `whatwg-fetch`

`whatwg-fetch` is a polyfill for browsers. I am going to send a request using `whatwg-fetch` to the proxy route.

```ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";
import { fetch as whatwgFetch } from "whatwg-fetch";

export const fetchExtended = returnFetchJson({
  fetch: returnFetchThrowingErrorByStatusCode({
    fetch: returnFetchWithLoadingIndicator({
      fetch: whatwgFetch, // use whatwgFetch instead of browser's global fetch
      baseUrl: "https://return-fetch.myeongjae.kim",
    }),
  }),
});

//////////////////// Use it somewhere ////////////////////
fetchExtended(
  "/sample/api/proxy/postman-echo/node-fetch/get",
  {
    headers: {
      "X-My-Custom-Header": "Hello World!"
    }
  },
);
```

#### #5-3. `cross-fetch`

I implemented a simple proxy for https://postman-echo.com with `cross-fetch` as an example using
[Next.js route handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

```ts
// src/app/sample/api/proxy/postman-echo/cross-fetch/[[...path]]/route.ts
import { NextRequest } from "next/server";
import crossFetch from "cross-fetch";
import returnFetch from "return-fetch";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // to turn off SSL certificate verification on server side
const pathPrefix = "/sample/api/proxy/postman-echo/cross-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    fetch: crossFetch, // Use cross-fetch instead of built-in Next.js fetch
    baseUrl: "https://postman-echo.com",
  });

  const response = await fetch(nextUrl.pathname.replace(pathPrefix, ""), {
    method,
    headers,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
```

Send a request to the proxy route using `cross-fetch` on the client-side also.

```ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";
import crossFetch from "cross-fetch";

export const fetchExtended = returnFetchJson({
  fetch: returnFetchThrowingErrorByStatusCode({
    fetch: returnFetchWithLoadingIndicator({
      fetch: crossFetch, // Use cross-fetch instead of browser's global fetch
      baseUrl: "https://return-fetch.myeongjae.kim",
    }),
  }),
});

//////////////////// Use it somewhere ////////////////////
fetchExtended(
  "/sample/api/proxy/postman-echo/node-fetch/get",
  {
    headers: {
      "X-My-Custom-Header": "Hello World!"
    }
  },
);
```

#### #5-4. Next.js built-in `fetch`

I implemented a simple proxy for https://postman-echo.com with Next.js built-in `fetch` as an example using
[Next.js route handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

```ts
// src/app/sample/api/proxy/postman-echo/nextjs-fetch/[[...path]]/route.ts
import { NextRequest } from "next/server";
import returnFetch from "return-fetch";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // to turn off SSL certificate verification on server side
const pathPrefix = "/sample/api/proxy/postman-echo/nextjs-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    // omit fetch option to use Next.js built-in fetch
    baseUrl: "https://postman-echo.com",
  });

  const response = await fetch(nextUrl.pathname.replace(pathPrefix, ""), {
    method,
    headers,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
```

Send a request to the proxy route using web browser default `fetch`.

```ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";

export const fetchExtended = returnFetchJson({
  fetch: returnFetchThrowingErrorByStatusCode({
    fetch: returnFetchWithLoadingIndicator({
      baseUrl: "https://return-fetch.myeongjae.kim",
    }),
  }),
});

//////////////////// Use it somewhere ////////////////////
fetchExtended(
  "/sample/api/proxy/postman-echo/nextjs-fetch/get",
  {
    headers: {
      "X-My-Custom-Header": "Hello World!"
    }
  },
);
```

#### #5-5. React Native

(I have not written a documents for React Native yet, but it surely works with React Native becuase it does not have
any dependencies on a specific `fetch` implementation.)

### #6. Replace default `fetch` with your customized `returnFetch`

```ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";

// save global fetch reference.
const globalFetch = fetch;
export const fetchExtended = returnFetchThrowingErrorByStatusCode({
  fetch: returnFetchWithLoadingIndicator({
    fetch: globalFetch, // use global fetch as a base.
  }),
});

// replace global fetch with your customized fetch.
window.fetch = fetchExtended;

//////////////////// Use it somewhere ////////////////////
fetch("/sample/api/echo", {
  method: "POST",
  body: JSON.stringify({ message: "Hello, world!" })
}).catch((e) => { alert(e.message); });
```

### #7. Use `URL` or `Request` object as a first argument of `fetch`

The type of a first argument of `fetch` is `Request | string | URL` and a second argument is
`RequestInit | undefined`. Through above examples, we used a string as a first argument of `fetch`.
`return-fetch` is also able to handle a `Request` or `URL` object as a first argument. It does not restrict
any features of `fetch`.

**Be careful! the default options' baseURL does not applied to a `URL` or `Request` object.** Default headers are
still applied to a `Request` object as you expected.

#### #7-1. `URL` object as a first argument

Even a `baseUrl` is set to 'https://google.com', it is not applied to a `URL` object. An `URL` object cannot be
created if an argument does not have origin. You should set a full `URL` to a `URL` object, so a `baseUrl` will
be ignored.

```ts
import returnFetch from "return-fetch";

const fetchExtended = returnFetch({
  baseUrl: "https://google.com",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-My-Header": "Hello, world!",
  },
});

fetchExtended(
  /*
    Even a baseURL is set to 'https://google.com', it is not applied to a URL object.
    An URL object cannot be created if an argument does not have origin.
    You should set a full URL to a URL object, so a baseURL will be ignored.
  */
  new Request(new URL("https://return-fetch.myeongjae.kim/sample/api/proxy/postman-echo/nextjs-fetch/post"), {
    method: "PUT",
    body: JSON.stringify({ message: "overwritten by requestInit" }),
    headers: {
      "X-My-Headers-In-Request-Object": "Works well!",
    },
  }),
  {
    method: "POST",
    body: JSON.stringify({ message: "Hello, world!" }),
  },
)
  .then((it) => it.json())
  .then(console.log);
```

#### #7-2. `Request` object as a first argument

Even a `baseUrl` is set to 'https://google.com', it is not applied to a `Request` object. While creating a
`Request` object, an origin is set to 'https://return-fetch.myeongjae.kim', which is the origin of this page,
so `baseUrl` will be ignored.

On Node.js, a `Request` object cannot be created without an origin, same as `URL` object.

```ts
import returnFetch from "return-fetch";

const fetchExtended = returnFetch({
  baseUrl: "https://google.com",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-My-Header": "Hello, world!",
  },
});

fetchExtended(
  /*
    Even a baseURL is set to 'https://google.com', it is not applied to a Request object.
    While creating a Request object, an origin is set to 'https://return-fetch.myeongjae.kim',
    which is the origin of this page, so baseURL will be ignored.
  */
  new Request("/sample/api/proxy/postman-echo/node-fetch/post", {
    method: "PUT",
    body: JSON.stringify({ message: "overwritten by requestInit" }),
    headers: {
      "X-My-Headers-In-Request-Object": "Works well!",
    },
  }),
  {
    method: "POST",
    body: JSON.stringify({ message: "Hello, world!" }),
  },
)
  .then((it) => it.json())
  .then(console.log);
```

### #8. Retry a request

Interceptors are async functions. You can make an async call in interceptors. This example shows how to retry a request
when a response status is 401.

```ts
let retryCount = 0;

const returnFetchRetry: ReturnFetch = (args) => returnFetch({
  ...args,
  interceptors: {
    response: async (response, requestArgs, fetch) => {
      if (response.status !== 401) {
        return response;
      }

      console.log("not authorized, trying to get refresh cookie..");
      const responseToRefreshCookie = await fetch(
        "https://httpstat.us/200",
      );
      if (responseToRefreshCookie.status !== 200) {
        throw Error("failed to refresh cookie");
      }

      retryCount += 1;
      console.log(`(#${retryCount}) succeeded to refresh cookie and retry request`);
      return fetch(...requestArgs);
    },
  },
});

const fetchExtended = returnFetchRetry({
  baseUrl: "https://httpstat.us",
});

fetchExtended("/401")
  .then((it) => it.text())
  .then((it) => `Response body: "${it}"`)
  .then(console.log)
  .then(() => console.log("\n Total counts of request: " + (retryCount + 1)))
```

#### #8-1. Doubling retry counts

If you nest `returnFetchRetry`, you can retry a request more than once. When you nest 4 times, you can retry a
request 16 times (I know it is too much, but isn't it fun?).

```ts
let retryCount = 0;

// create a fetch function with baseUrl applied
const fetchBaseUrlApplied = returnFetch({ baseUrl: "https://httpstat.us" });

const returnFetchRetry: ReturnFetch = (args) => returnFetch({
  ...args,
  // use fetchBaseUrlApplied as a default fetch function
  fetch: args?.fetch ?? fetchBaseUrlApplied,
  interceptors: {
    response: async (response, requestArgs, fetch) => {
      if (response.status !== 401) {
         return response;
      }

      console.log("not authorized, trying to get refresh cookie..");
      const responseToRefreshCookie = await fetch("/200");
      if (responseToRefreshCookie.status !== 200) {
         throw Error("failed to refresh cookie");
      }

      retryCount += 1;
      console.log(`(#${retryCount}) succeeded to refresh cookie and retry request`);
      return fetch(...requestArgs);
    },
  },
});

const nest = (
  remaining: number,
  providedFetch = fetchBaseUrlApplied,
): ReturnType<ReturnFetch> =>
  remaining > 0
    ? nest(remaining - 1, returnFetchRetry({ fetch: providedFetch }))
    : providedFetch;

// nest 4 times -> 2^4 = 16
const fetchExtended = nest(4);

fetchExtended("/401")
  .then((it) => it.text())
  .then((it) => `Response body: "${it}"`)
  .then(console.log)
  .then(() => console.log("\n Total counts of request: " + (retryCount + 1)))
```

## Derived Packages

- [return-fetch-json](https://www.npmjs.com/package/return-fetch-json): A package that serialize request body object
and deserialize response body as a JSON object.

## License

MIT © [Myeongjae Kim](https://myeongjae.kim)
