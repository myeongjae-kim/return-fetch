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

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className={"mx-4 flex justify-center"}>
        <div className={"w-full max-w-3xl xl:max-w-4xl"}>
          <BasicExample />
          <MarkdownRenderer markdown={greetings} />
          <Usage1 />
          <Usage2 />
          <Usage3 />
          <Usage4 />
          <Usage5 />
          <Usage6 />
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
