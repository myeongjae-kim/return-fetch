"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch from "return-fetch";
import { strings } from "@/app/common/strings";

const Usage7 = (): React.JSX.Element => {
  const [urlObjectOutput, setUrlObjectOutput] = React.useState(
    `${strings.clickRunButton}`,
  );

  const [requestObjectOutput, setRequestObjectOutput] = React.useState(
    `${strings.clickRunButton}`,
  );

  const fetchForRequestObject = React.useMemo(() => {
    return returnFetch({
      baseUrl: "https://google.com",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-My-Header": "Hello, world!",
      },
    });
  }, []);

  return (
    <div>
      <MarkdownRenderer
        markdown={`### #7. Use \`URL\` or \`Request\` object as a first argument of \`fetch\`

The type of a first argument of \`fetch\` is \`Request | string | URL\` and a second argument is
\`RequestInit | undefined\`. Through above examples, we used a string as a first argument of \`fetch\`.
\`return-fetch\` is also able to handle a \`Request\` or \`URL\` object as a first argument. It does not restrict
any features of \`fetch\`.

**Be careful! the default options' baseURL does not applied to a \`URL\` or \`Request\` object.** Default headers are
still applied to a \`Request\` object as you expected.

#### #7-1. \`URL\` object as a first argument

Even a \`baseUrl\` is set to 'https://google.com', it is not applied to a \`URL\` object. An \`URL\` object cannot be
created if an argument does not have origin. You should set a full \`URL\` to a \`URL\` object, so a \`baseUrl\` will
be ignored.

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            setUrlObjectOutput("Loading...");
            fetchForRequestObject(
              new Request(
                new URL(
                  window.origin +
                    "/sample/api/proxy/postman-echo/nextjs-fetch/post",
                ),
                {
                  method: "PUT",
                  body: JSON.stringify({
                    message: "overwritten by requestInit",
                  }),
                  headers: {
                    "X-My-Headers-In-Request-Object": "Works well!",
                  },
                },
              ),
              {
                method: "POST",
                body: JSON.stringify({ message: "Hello, world!" }),
              },
            )
              .then((it) => it.json())
              .then((it) => {
                setUrlObjectOutput(JSON.stringify(it, null, 2));
              });
          }}
        >
          Run
        </Button>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${urlObjectOutput}
\`\`\``}
      />

      <MarkdownRenderer
        markdown={`#### #7-2. \`Request\` object as a first argument

Even a \`baseUrl\` is set to 'https://google.com', it is not applied to a \`Request\` object. While creating a
\`Request\` object, an origin is set to 'https://return-fetch.myeongjae.kim', which is the origin of this page,
so \`baseUrl\` will be ignored.

On Node.js, a \`Request\` object cannot be created without an origin, same as \`URL\` object.

\`\`\`ts
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
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            setRequestObjectOutput("Loading...");
            fetchForRequestObject(
              new Request("/sample/api/proxy/postman-echo/nextjs-fetch/post", {
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
              .then((it) => {
                setRequestObjectOutput(JSON.stringify(it, null, 2));
              });
          }}
        >
          Run
        </Button>
      </div>
      <strong>Output</strong>
      <MarkdownRenderer
        markdown={`\`\`\`json
${requestObjectOutput}
\`\`\``}
      />
    </div>
  );
};

export default Usage7;
