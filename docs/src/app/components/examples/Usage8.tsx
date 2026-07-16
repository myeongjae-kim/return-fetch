"use client";

/* eslint-disable react-hooks/refs -- retry refs are read by deferred interceptors, not during render */

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch, { ReturnFetch } from "return-fetch";
import { strings } from "@/app/common/strings";

const Usage8 = (): React.JSX.Element => {
  const [output, setOutput] = React.useState(`${strings.clickRunButton}`);
  const [nestedOutput, setNestedOutput] = React.useState(
    `${strings.clickRunButton}`,
  );
  const appendOutput = React.useCallback(
    (toAppend: string) => setOutput((it) => `${it}\n${toAppend}`),
    [],
  );
  const appendNestedOutput = React.useCallback(
    (toAppend: string) => setNestedOutput((it) => `${it}\n${toAppend}`),
    [],
  );
  const retryCount = React.useRef(0);
  const nestedRetryCount = React.useRef(0);
  const currentSiteUrl = typeof window === "undefined" ? undefined : window.origin;

  const fetchBaseUrlApplied = React.useMemo(
    () => returnFetch({ baseUrl: currentSiteUrl }),
    [currentSiteUrl],
  );
  const returnFetchRetry: ReturnFetch = React.useCallback(
    (args) =>
      returnFetch({
        ...args,
        fetch: args?.fetch ?? fetchBaseUrlApplied,
        interceptors: {
          response: async (response, requestArgs, fetch) => {
            if (response.status !== 401) {
              return response;
            }

            appendOutput("not authorized, trying to get refresh cookie..");
            const responseToRefreshCookie = await fetch("/sample/api/200");
            if (responseToRefreshCookie.status !== 200) {
              throw Error("failed to refresh cookie");
            }

            retryCount.current += 1;

            appendOutput(
              `(#${retryCount.current}) succeeded to refresh cookie and retry request`,
            );
            return fetch(...requestArgs);
          },
        },
      }),
    [appendOutput, fetchBaseUrlApplied],
  );

  const fetchRetry = React.useMemo(() => {
    return returnFetchRetry({
      baseUrl: currentSiteUrl,
    });
  }, [returnFetchRetry]);

  const returnFetchRetryNested: ReturnFetch = React.useCallback(
    (args) =>
      returnFetch({
        ...args,
        fetch: args?.fetch ?? fetchBaseUrlApplied,
        interceptors: {
          response: async (response, requestArgs, fetch) => {
            if (response.status !== 401) {
              return response;
            }

            appendNestedOutput("not authorized, trying to get refresh cookie..");
            const responseToRefreshCookie = await fetch("/sample/api/200");
            if (responseToRefreshCookie.status !== 200) {
              throw Error("failed to refresh cookie");
            }

            nestedRetryCount.current += 1;
            appendNestedOutput(
              `(#${nestedRetryCount.current}) succeeded to refresh cookie and retry request`,
            );
            return fetch(...requestArgs);
          },
        },
      }),
    [appendNestedOutput, fetchBaseUrlApplied],
  );

  const fetchRetryNested = React.useMemo(() => {
    const nest = (
      remaining: number,
      providedFetch = fetchBaseUrlApplied,
    ): ReturnType<ReturnFetch> =>
      remaining > 0
        ? nest(remaining - 1, returnFetchRetryNested({ fetch: providedFetch }))
        : providedFetch;

    return nest(4);
  }, [fetchBaseUrlApplied, returnFetchRetryNested]);

  return (
    <div>
      <MarkdownRenderer
        markdown={`### #8. Retry a request

Interceptors are async functions. You can make an async call in interceptors. This example shows how to retry a request
when a response status is 401.

\`\`\`ts
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
        "/sample/api/200",
      );
      if (responseToRefreshCookie.status !== 200) {
        throw Error("failed to refresh cookie");
      }

      retryCount += 1;
      console.log(\`(#\${retryCount}) succeeded to refresh cookie and retry request\`);
      return fetch(...requestArgs);
    },
  },
});

const fetchExtended = returnFetchRetry({
  baseUrl: window.origin,
});

fetchExtended("/sample/api/401")
  .then((it) => it.text())
  .then((it) => \`Response body: "\${it}"\`)
  .then(console.log)
  .then(() => console.log("\\n Total counts of request: " + (retryCount + 1)))
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            retryCount.current = 0;
            setOutput("Loading...");
            fetchRetry("/sample/api/401")
              .then((it) => it.text())
              .then((it) => `Response body: "${it}"`)
              .then(appendOutput)
              .then(() => {
                appendOutput(
                  "\n Total counts of request: " + (retryCount.current + 1),
                );
              });
          }}
        >
          Run
        </Button>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${output}
\`\`\``}
      />

      <MarkdownRenderer
        markdown={`#### #8-1. Doubling retry counts

If you nest \`returnFetchRetry\`, you can retry a request more than once. When you nest 4 times, you can retry a
request 16 times (I know it is too much, but isn't it fun?).

\`\`\`ts
let retryCount = 0;

// create a fetch function with baseUrl applied
const fetchBaseUrlApplied = returnFetch({
  baseUrl: window.origin,
});

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
      const responseToRefreshCookie = await fetch("/sample/api/200");
      if (responseToRefreshCookie.status !== 200) {
        throw Error("failed to refresh cookie");
      }

      retryCount += 1;
      console.log(\`(#\${retryCount}) succeeded to refresh cookie and retry request\`);
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

fetchExtended("/sample/api/401")
  .then((it) => it.text())
  .then((it) => \`Response body: "\${it}"\`)
  .then(console.log)
  .then(() => console.log("\\n Total counts of request: " + (retryCount + 1)))
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            nestedRetryCount.current = 0;
            setNestedOutput("Loading...");
            fetchRetryNested("/sample/api/401")
              .then((it) => it.text())
              .then((it) => `Response body: "${it}"`)
              .then(appendNestedOutput)
              .then(() => {
                appendNestedOutput(
                  "\n Total counts of request: " + (nestedRetryCount.current + 1),
                );
              });
          }}
        >
          Run
        </Button>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${nestedOutput}
\`\`\``}
      />
    </div>
  );
};

export default Usage8;
