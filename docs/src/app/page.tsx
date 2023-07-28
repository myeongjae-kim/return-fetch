import React from "react";
import HeroSection from "@/app/components/HeroSection";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import { greetings } from "@/app/markdowns/greetings";
import BasicExample from "@/app/markdowns/BasicExample";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className={"mx-4 flex justify-center"}>
        <div className={"w-full max-w-3xl xl:max-w-4xl"}>
          <BasicExample />
          <MarkdownRenderer markdown={greetings} />
        </div>
      </div>
    </main>
  );
}
