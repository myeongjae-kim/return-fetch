"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import { strings } from "@/app/common/strings";
import { ApiResponse } from "@/app/domain/model/ApiResponse";
import { returnFetchJson } from "@/app/domain/application/returnFetchJson";

const fetch = returnFetchJson();

const Usage3 = (): React.JSX.Element => {
  const [output, setOutput] = React.useState(`${strings.clickRunButton}`);

  return (
    <div>
      <MarkdownRenderer
        markdown={`### #3. Serialize request body and deserialize response body

You can import below example code because it is published as a separated npm [return-fetch-json](https://www.npmjs.com/package/return-fetch-json)

\`\`\`ts
import returnFetch, { FetchArgs, ReturnFetchDefaultOptions } from "return-fetch";

// Use as a replacer of \`RequestInit\`
type JsonRequestInit = Omit<NonNullable<FetchArgs[1]>, "body"> & { body?: object };

// Use as a replacer of \`Response\`
export type ResponseGenericBody<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | "clone"
> & {
  body: T;
};

export type JsonResponse<T> = T extends object
  ? ResponseGenericBody<T>
  : ResponseGenericBody<unknown>;


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
