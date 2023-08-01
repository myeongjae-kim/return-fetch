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
import { JsonRequestInit } from "@/app/domain/model/JsonRequestInit";
import { returnFetchJson } from "@/app/domain/application/returnFetchJson";

const Usage4 = (): React.JSX.Element => {
  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState(
    `${strings.clickRunButton} You will see a loading indicator.`,
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
          response: async (response) => {
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
          response: async (response) => {
            if (response.status >= 400) {
              throw await response.text().then(Error);
            }

            return response;
          },
        },
      }),
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

  return (
    <div>
      {loading && <LoadingIndicator />}
      <MarkdownRenderer
        markdown={`### #4. Compose above three high order functions to create your awesome fetch 🥳
        
Because of the recursive type definition, you can chain extended \`returnFetch\` functions as many as you want. It
allows you to write extending functions which are responsible only for a single feature. Is a good practice to stick
to **the Single Responsibility Principle** and writing a reusable function to write clean code.

\`\`\`ts
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
  body: { message: "Hello, world!" }, // body should be an object.
}).catch((e) => { alert(e.message); });
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <div className={"flex gap-2"}>
          <Button
            onClick={() => {
              setOutput("Loading...");
              fetch<{ message: string }>("/sample/api/echo?delay=200", {
                method: "POST",
                body: { message: "Hello, world!" },
              })
                .then((it) => it.body)
                .then((it) => {
                  setOutput(JSON.stringify(it, null, 2));
                });
            }}
          >
            Run (Status 200)
          </Button>
          <Button
            variant={"purple"}
            onClick={() => {
              setOutput(
                "You have seen a loading indicator. The status code is 400 so an alert occurs.",
              );
              fetch<{ message: string }>("/sample/api/400?delay=200").catch(
                (e) => {
                  alert(e.message);
                },
              );
            }}
          >
            Run (Status 400)
          </Button>
        </div>
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

export default Usage4;
