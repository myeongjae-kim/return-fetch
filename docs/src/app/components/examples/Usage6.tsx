"use client";

import React from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

const Usage6 = (): React.JSX.Element => {
  return (
    <MarkdownRenderer
      markdown={`### #6. Replace default \`fetch\` with your customized \`returnFetch\`
        
\`\`\`ts
import {
  returnFetchJson,
  returnFetchThrowingErrorByStatusCode,
  returnFetchWithLoadingIndicator
} from "@/your/customized/return-fetch";

// save global fetch reference.
const globalFetch = fetch;
export const fetchExtended = returnFetchThrowingErrorByStatusCode({
  fetch: returnFetchWithLoadingIndicator({
    fetch: globalFetch, // use global fetch as a base.
  }),
});

// replace global fetch with your customized fetch.
globalThis.fetch = fetchExtended;

//////////////////// Use it somewhere ////////////////////
fetch("/sample/api/echo", {
  method: "POST",
  body: JSON.stringify({ message: "Hello, world!" })
}).catch((e) => { alert(e.message); });
\`\`\`

I didn't write an interactive example for this because replacing global fetch with a customized one will break other
examples. Test on your own example and you are going to see that it works well.
`}
    />
  );
};

export default Usage6;
