import React from "react";
import HeroSection from "@/app/components/HeroSection";
import { basicExample } from "@/app/markdowns/basic-example";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className={"mx-4 flex justify-center"}>
        <div className={"w-full max-w-3xl xl:max-w-4xl"}>
          <h2>Example</h2>
          <MarkdownRenderer markdown={basicExample} />
        </div>
      </div>
    </main>
  );
}
