"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch, { ReturnFetch } from "return-fetch";
import { strings } from "@/app/common/strings";

const Usage8 = (): React.JSX.Element => {
  const [output, setOutput] = React.useState(`${strings.clickRunButton}`);
  const appendOutput = (toAppend: string) =>
    setOutput((it) => `${it}\n${toAppend}`);
  const retryCount = React.useRef(0);

  const fetchBaseUrlApplied = React.useMemo(
    () => returnFetch({ baseUrl: "https://httpstat.us" }),
    [],
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
            const responseToRefreshCookie = await fetch("/200");
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
    [],
  );

  const fetchRetry = React.useMemo(() => {
    return returnFetchRetry({
      baseUrl: "https://httpstat.us",
    });
  }, [returnFetchRetry]);

  const fetchRetryCubic = React.useMemo(() => {
    return returnFetchRetry({
      fetch: returnFetchRetry({
        fetch: returnFetchRetry({
          fetch: returnFetchRetry(),
        }),
      }),
    });
  }, [returnFetchRetry]);

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
        "https://httpstat.us/200",
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
  baseUrl: "https://httpstat.us",
});

fetchExtended("/401")
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
            fetchRetry("/401")
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
      const responseToRefreshCookie = await fetch(
        "/200",
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

// nest 4 times -> 2^4 = 16
const fetchExtended = returnFetchRetry({
  fetch: returnFetchRetry({
    fetch: returnFetchRetry({
      fetch: returnFetchRetry(),
    }),
  }),
});

fetchExtended("/401")
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
            fetchRetryCubic("/401")
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
    </div>
  );
};

export default Usage8;
