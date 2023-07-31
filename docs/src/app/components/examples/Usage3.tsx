"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch, {
  FetchArgs,
  ReturnFetchDefaultOptions,
} from "return-fetch";
import { strings } from "@/app/common/strings";
import { ApiResponse } from "@/app/domain/model/ApiResponse";
import { JsonResponse } from "@/app/domain/model/JsonRespones";

type JsonRequestInit = Omit<NonNullable<FetchArgs[1]>, "body"> & {
  body?: object;
};

const Usage3 = (): React.JSX.Element => {
  const [output, setOutput] = React.useState(`${strings.clickRunButton}`);

  const returnFetchJson = React.useCallback(
    (args?: ReturnFetchDefaultOptions) => {
      const fetch = returnFetch(args);

      return async <T extends object>(
        url: FetchArgs[0],
        init?: JsonRequestInit,
      ): Promise<JsonResponse<T>> => {
        const response = await fetch(url, {
          ...init,
          body: init?.body && JSON.stringify(init.body),
        });

        // get response as text and parse json for not throwing an error when a response body is empty.
        const body = await response.text();

        let data = {} as T;
        if (body) {
          data = JSON.parse(body);
        }

        return {
          headers: response.headers,
          ok: response.ok,
          redirected: response.redirected,
          status: response.status,
          statusText: response.statusText,
          type: response.type,
          url: response.url,
          body: data,
        };
      };
    },
    [],
  );

  const fetch = React.useMemo(() => {
    return returnFetchJson();
  }, [returnFetchJson]);

  return (
    <div>
      <MarkdownRenderer
        markdown={`### #3. Serialize request body and deserialize response body.

\`\`\`ts
import returnFetch, { FetchArgs, ReturnFetchDefaultOptions } from "return-fetch";

// Use as a replacer of \`RequestInit\`
type JsonRequestInit = Omit<NonNullable<FetchArgs[1]>, "body"> & { body?: object };

// Use as a replacer of \`Response\`
export type JsonResponse<T extends object | null> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | "clone"
> & {
  body: T;
};

// Write your own high order function to serialize request body and deserialize response body.
const returnFetchJson = (args?: ReturnFetchDefaultOptions) => {
  const fetch = returnFetch(args);

  return async <T extends object>(
    url: FetchArgs[0],
    init?: JsonRequestInit,
  ): Promise<JsonResponse<T>> => {
    const response = await fetch(url, {
      ...init,
      body: init?.body && JSON.stringify(init.body),
    });

    // For not throwing an error when a response body is empty, get response as text and parse to json.
    const body = await response.text();

    let data = {} as T;
    if (body) {
      data = JSON.parse(body);
    }

    return {
      headers: response.headers,
      ok: response.ok,
      redirected: response.redirected,
      status: response.status,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      body: data,
    };
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            setOutput("Loading...");
            fetch<ApiResponse<{ message: string }>>(
              "/sample/api/echo?delay=200",
              {
                method: "POST",
                body: { message: "Hello, world!" },
              },
            )
              .then((it) => it.body)
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

export default Usage3;
