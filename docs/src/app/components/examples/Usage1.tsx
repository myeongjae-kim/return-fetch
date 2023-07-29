"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import Button from "@/app/components/Button";
import returnFetch, { ReturnFetch } from "return-fetch";
import { strings } from "@/app/common/strings";

const Usage1 = (): React.JSX.Element => {
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
          response: async (requestArgs, response) => {
            setLoading(false);
            return response;
          },
        },
      }),
    [],
  );

  const fetch = React.useMemo(() => {
    return returnFetchWithLoadingIndicator();
  }, [returnFetchWithLoadingIndicator]);

  return (
    <div>
      {loading && <LoadingIndicator />}
      <MarkdownRenderer
        markdown={`## Usage

You can find [the source code of below examples here](https://github.com/deer-develop/return-fetch/tree/main/docs/src/app/components/examples).

### #1. Display/Hide loading indicator

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            setOutput("Loading...");
            fetch("/sample/api?delay=1000")
              .then((it) => it.json())
              .then((it) => {
                setOutput(JSON.stringify(it, null, 2));
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

export default Usage1;
