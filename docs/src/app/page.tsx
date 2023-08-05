import React from "react";
import HeroSection from "@/app/components/HeroSection";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import { greetings } from "@/app/markdowns/greetings";
import BasicExample from "@/app/components/examples/BasicExample";
import Usage1 from "@/app/components/examples/Usage1";
import Usage2 from "@/app/components/examples/Usage2";
import Usage3 from "@/app/components/examples/Usage3";
import Usage4 from "@/app/components/examples/Usage4";
import Usage5 from "@/app/components/examples/Usage5";
import Usage6 from "@/app/components/examples/Usage6";
import Usage7 from "@/app/components/examples/Usage7";
import Usage8 from "@/app/components/examples/Usage8";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className={"mx-4 flex justify-center"}>
        <div className={"w-full max-w-3xl xl:max-w-4xl"}>
          <BasicExample />
          <MarkdownRenderer markdown={greetings} />
          <MarkdownRenderer markdown={"## Types"} />
          <div>
            <iframe
              src={"/docs/types/ReturnFetchDefaultOptions.html"}
              className={"h-[calc(100vh-100px)] w-full"}
            ></iframe>
          </div>
          <Usage1 />
          <Usage2 />
          <Usage3 />
          <Usage4 />
          <Usage5 />
          <Usage6 />
          <Usage7 />
          <Usage8 />
          <div>
            <MarkdownRenderer
              markdown={`## Derived Packages

- [return-fetch-json](https://www.npmjs.com/package/return-fetch-json): A package that serialize request body object
and deserialize response body as a JSON object.
`}
            />
          </div>
          <div className={"mb-24"}>
            <h2 id={"license"}>License</h2>
            MIT ©{" "}
            <a
              aria-label="Open author's homepage"
              href="https://myeongjae.kim"
              target="_blank"
              rel="noreferrer noopener"
            >
              Myeongjae Kim
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
