"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch, {
  FetchArgs,
  ReturnFetch,
  ReturnFetchDefaultOptions,
} from "return-fetch";
import { strings } from "@/app/common/strings";
import LoadingIndicator from "@/app/components/LoadingIndicator";
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { fetch as whatwgFetch } from "whatwg-fetch";
import crossFetch from "cross-fetch";

const Usage5 = (): React.JSX.Element => {
  const [loading, setLoading] = React.useState(false);
  const [outputNodeFetch, setOutputNodeFetch] = React.useState(
    `${strings.clickRunButton}`,
  );
  const [outputCrossFetch, setOutputCrossFetch] = React.useState(
    `${strings.clickRunButton}`,
  );

  const [outputWhatwgFetch, setOutputWhatwgFetch] = React.useState(
    `${strings.clickRunButton}`,
  );

  const [outputNextjsFetch, setOutputNextjsFetch] = React.useState(
    `${strings.clickRunButton}`,
  );

  const returnFetchWithLoadingIndicator: ReturnFetch = React.useCallback(
    (args) =>
      returnFetch({
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
      }),
    [],
  );

  const returnFetchThrowingErrorByStatusCode: ReturnFetch = React.useCallback(
    (args) =>
      returnFetch({
        ...args,
        interceptors: {
          response: async (_, response) => {
            if (response.status >= 400) {
              throw await response.text().then(Error);
            }

            return response;
          },
        },
      }),
    [],
  );

  const returnFetchJson = React.useCallback(
    (args?: ReturnFetchDefaultOptions) => {
      const fetch = returnFetch(args);

      return async <T extends object>(
        url: FetchArgs[0],
        init?: Omit<NonNullable<FetchArgs[1]>, "body"> & { body?: object },
      ) => {
        const response = await fetch(url, {
          ...init,
          body: init?.body && JSON.stringify(init.body),
        });

        // get response as text and parse json for not throwing an error when the response body is empty.
        const body = await response.text();

        let data = {} as T;
        if (body) {
          data = JSON.parse(body);
        }

        return {
          ...response,
          body: data,
        };
      };
    },
    [],
  );

  const fetch = React.useMemo(() => {
    return returnFetchJson({
      fetch: returnFetchThrowingErrorByStatusCode({
        fetch: returnFetchWithLoadingIndicator(),
      }),
    });
  }, [
    returnFetchJson,
    returnFetchThrowingErrorByStatusCode,
    returnFetchWithLoadingIndicator,
  ]);

  const whatwgFetchExtended = React.useMemo(() => {
    return returnFetchJson({
      fetch: returnFetchThrowingErrorByStatusCode({
        fetch: returnFetchWithLoadingIndicator({
          fetch: whatwgFetch,
        }),
      }),
    });
  }, [
    returnFetchJson,
    returnFetchThrowingErrorByStatusCode,
    returnFetchWithLoadingIndicator,
  ]);

  const crossFetchExtended = React.useMemo(() => {
    return returnFetchJson({
      fetch: returnFetchThrowingErrorByStatusCode({
        fetch: returnFetchWithLoadingIndicator({
          fetch: crossFetch,
        }),
      }),
    });
  }, [
    returnFetchJson,
    returnFetchThrowingErrorByStatusCode,
    returnFetchWithLoadingIndicator,
  ]);

  return (
    <div>
      {loading && <LoadingIndicator />}
      <MarkdownRenderer
        markdown={`### #5. Use any \`fetch\` implementation.

\`fetch\` has been added since [Node.js v17.5 as an experimental feature](https://nodejs.org/tr/blog/release/v17.5.0),
also available from [Node.js v16.15](https://nodejs.org/tr/blog/release/v16.15.0) and
[still experimental(29 JUL 2023, v20.5.0)](https://nodejs.org/docs/v20.5.0/api/globals.html#fetch). You can use
'[node-fetch](https://github.com/node-fetch/node-fetch)' as a polyfill for Node.js v16.15 or lower,
or '[whatwg-fetch](https://github.com/JakeChampion/fetch)' for old web browsers, or 
'[cross-fetch](https://github.com/lquixada/cross-fetch)' for both web browser and Node.js.

Next.js has already included 'node-fetch' and
[they extend it for server-side things like caching](https://nextjs.org/docs/app/api-reference/functions/fetch).

Whatever a \`fetch\` you use, you can use \`return-fetch\` as long as the \`fetch\` you use is compatible with the
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). <span class="opacity-60 text-[0.8em]">(It is
\`string | URL\` which is a type of first argument of \`fetch\` created by \`return-fetch\`. It does not support
\`Request\` object as a first argument of a customized \`fetch\` yet. If you need to use \`Request\` object, please
wait or [contribute💙](https://github.com/deer-develop/return-fetch/issues/1))</span>

#### #5-1. \`node-fetch\`

I implemented a simple proxy for https://postman-echo.com with \`node-fetch\` as an example using
[Next.js route handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

\`\`\`ts
// src/app/sample/api/proxy/postman-echo/node-fetch/[[...path]]/route.ts
import { NextRequest } from "next/server";
import nodeFetch from "node-fetch";
import returnFetch, { ReturnFetchDefaultOptions } from "return-fetch";

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
\`\`\`

Send a request to the proxy route.

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <div className={"flex gap-2"}>
          <Button
            onClick={() => {
              setOutputNodeFetch("Loading...");
              fetch<{ message: string }>(
                "/sample/api/proxy/postman-echo/node-fetch/get",
                {
                  headers: {
                    "X-My-Custom-Header": "Hello World!",
                  },
                },
              )
                .then((it) => it.body)
                .then((it) => {
                  setOutputNodeFetch(JSON.stringify(it, null, 2));
                });
            }}
          >
            Run
          </Button>
        </div>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${outputNodeFetch}
\`\`\``}
      />

      <MarkdownRenderer
        markdown={`
#### #5-2. \`whatwg-fetch\`

\`whatwg-fetch\` is a polyfill for browsers. I am going to send a request using \`whatwg-fetch\` to the proxy route.

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <div className={"flex gap-2"}>
          <Button
            onClick={() => {
              setOutputWhatwgFetch("Loading...");
              whatwgFetchExtended<{ message: string }>(
                "/sample/api/proxy/postman-echo/node-fetch/get",
                {
                  headers: {
                    "X-My-Custom-Header": "Hello World!",
                  },
                },
              )
                .then((it) => it.body)
                .then((it) => {
                  setOutputWhatwgFetch(JSON.stringify(it, null, 2));
                });
            }}
          >
            Run
          </Button>
        </div>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${outputWhatwgFetch}
\`\`\``}
      />

      <MarkdownRenderer
        markdown={`
#### #5-3. \`cross-fetch\`

I implemented a simple proxy for https://postman-echo.com with \`cross-fetch\` as an example using
[Next.js route handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

\`\`\`ts
// src/app/sample/api/proxy/postman-echo/cross-fetch/[[...path]]/route.ts
import { NextRequest } from "next/server";
import crossFetch from "cross-fetch";
import returnFetch from "return-fetch";

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
\`\`\`

Send a request to the proxy route using \`cross-fetch\` on the client-side also.

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <div className={"flex gap-2"}>
          <Button
            onClick={() => {
              setOutputCrossFetch("Loading...");
              crossFetchExtended<{ message: string }>(
                "/sample/api/proxy/postman-echo/cross-fetch/get",
                {
                  headers: {
                    "X-My-Custom-Header": "Hello World!",
                  },
                },
              )
                .then((it) => it.body)
                .then((it) => {
                  setOutputCrossFetch(JSON.stringify(it, null, 2));
                });
            }}
          >
            Run
          </Button>
        </div>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${outputCrossFetch}
\`\`\``}
      />

      <MarkdownRenderer
        markdown={`
#### #5-4. Next.js built-in \`fetch\`

I implemented a simple proxy for https://postman-echo.com with Next.js built-in \`fetch\` as an example using
[Next.js route handler](https://nextjs.org/docs/app/building-your-application/routing/router-handlers).

\`\`\`ts
// src/app/sample/api/proxy/postman-echo/nextjs-fetch/[[...path]]/route.ts
import { NextRequest } from "next/server";
import returnFetch from "return-fetch";

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
\`\`\`

Send a request to the proxy route using web browser default \`fetch\`.

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <div className={"flex gap-2"}>
          <Button
            onClick={() => {
              setOutputNextjsFetch("Loading...");
              fetch<{ message: string }>(
                "/sample/api/proxy/postman-echo/nextjs-fetch/get",
                {
                  headers: {
                    "X-My-Custom-Header": "Hello World!",
                  },
                },
              )
                .then((it) => it.body)
                .then((it) => {
                  setOutputNextjsFetch(JSON.stringify(it, null, 2));
                });
            }}
          >
            Run
          </Button>
        </div>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${outputNextjsFetch}
\`\`\``}
      />

      <MarkdownRenderer
        markdown={`
#### #5-5. React Native

(I have not written a documents for React Native yet, but it surely works with React Native becuase it does not have
any dependencies on a specific \`fetch\` implementation.)
`}
      />
    </div>
  );
};

export default Usage5;
