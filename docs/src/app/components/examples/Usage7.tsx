"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Button from "@/app/components/Button";
import returnFetch from "return-fetch";
import { strings } from "@/app/common/strings";

const Usage7 = (): React.JSX.Element => {
  const [output, setOutput] = React.useState(
    `${strings.clickRunButton} You will see a loading indicator.`,
  );

  const fetch = React.useMemo(() => {
    return returnFetch();
  }, []);

  return (
    <div>
      <MarkdownRenderer
        markdown={`### #7. Use \`Request\` object as a first argument of \`fetch\`

\`\`\`ts
TBD
\`\`\`
`}
      />
      <div className={"mb-4"}>
        <Button
          onClick={() => {
            setOutput("Loading...");
            fetch(
              new Request("/sample/api/echo", {
                method: "POST",
                body: JSON.stringify({ message: "Hello, world!" }),
              }),
            )
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

export default Usage7;
