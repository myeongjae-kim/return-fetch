import React, { forwardRef } from "react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";
import { mangle } from "marked-mangle";
import { gfmHeadingId } from "marked-gfm-heading-id";

import "prismjs/components/prism-typescript.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-tsx.min.js";
import "prismjs/components/prism-bash.min.js";

marked.use(
  mangle(),
  gfmHeadingId(),
  markedHighlight({
    highlight(code: string, lang: string): string {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], lang);
      } else {
        return code;
      }
    },
  }),
);

type Props = React.ComponentProps<"div"> & {
  markdown: string;
};

const MarkdownRenderer = (
  { markdown, style, ...props }: Props,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.JSX.Element => {
  const html = marked(markdown);

  return (
    <div
      ref={ref}
      style={{ overflowWrap: "anywhere", ...style }}
      {...props}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default forwardRef(MarkdownRenderer);
