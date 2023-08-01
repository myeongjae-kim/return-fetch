"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch, { ReturnFetch } from "return-fetch";
import { strings } from "@/app/common/strings";

const Usage2 = (): React.JSX.Element => {
  const output = `${strings.clickRunButton} You will see an alert.`;

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
    return returnFetchThrowingErrorByStatusCode();
  }, [returnFetchThrowingErrorByStatusCode]);

  return (
    <div>
      <MarkdownRenderer
        markdown={`### #2. Throw an error if a response status is more than or equal to 400

\`\`\`ts
import returnFetch, { ReturnFetch } from "return-fetch";

// Write your own high order function to throw an error if a response status is more than or equal to 400.
const returnFetchThrowingErrorByStatusCode: ReturnFetch = (args) => returnFetch({
  ...args,
  interceptors: {
    response: async (response) => {
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            fetch("/sample/api/400").catch((e) => {
              alert(e.message);
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

export default Usage2;
