import React from "react";

const HeroSection = (): React.JSX.Element => {
  return (
    <section className="bg-white dark:bg-gray-900 antialiased">
      <div className="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 sm:py-16 lg:pt-24 lg:pb-16">
        <div className="text-center">
          <div>
            <div className={"flex justify-center"}>
              <h2 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl bg-gradient-to-r from-blue-700 to-pink-500 text-transparent bg-clip-text">
                <span className={"select-none"}>return-fetch</span>
                <span className="block text-xl sm:text-3xl lg:text-4xl mt-3">
                  A simple and powerful <br />
                  high order function
                  <br />
                  to extend fetch.
                </span>
              </h2>
            </div>
            <p className="mt-4 text-base font-normal text-gray-500 dark:text-gray-400 md:max-w-xl md:mx-auto sm:text-xl">
              Write your own functions which add feature to fetch and compose
              them to create your own extended fetch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
