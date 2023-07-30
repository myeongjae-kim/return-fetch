import React from "react";
import BadgeSection from "@/app/components/BadgeSection";

const HeroSection = (): React.JSX.Element => {
  return (
    <section className="bg-white antialiased dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 pb-4 lg:px-6 lg:pb-16 lg:pt-4">
        <div className="text-center">
          <div>
            <div className={"flex justify-center"}>
              <h1 className="bg-gradient-to-r from-blue-700 to-pink-500 bg-clip-text text-5xl font-extrabold leading-none tracking-tight text-gray-900 text-transparent dark:text-white sm:text-7xl lg:text-8xl">
                <span className={"select-none"}>return-fetch</span>
                <span className="mt-3 block text-2xl sm:text-4xl lg:text-5xl">
                  A simple and powerful <br />
                  high order function
                  <br />
                  to extend fetch.
                </span>
              </h1>
            </div>
            <p className="mt-4 text-base font-normal text-gray-500 dark:text-gray-400 sm:text-xl md:mx-auto md:max-w-xl">
              baseURL, default headers, interceptors.
            </p>
          </div>
        </div>
        <BadgeSection />
      </div>
    </section>
  );
};

export default HeroSection;
