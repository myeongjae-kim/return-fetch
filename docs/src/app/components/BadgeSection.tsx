import React from "react";

const BadgeSection = (): React.JSX.Element => {
  return (
    <div className={"flex gap-2 flex-wrap"}>
      <a href="https://github.com/deer-develop/return-fetch/actions?query=workflow%3ACI">
        <img
          src="https://github.com/deer-develop/return-fetch/workflows/CI/badge.svg"
          alt="CI"
          height="18"
        />
      </a>
      <a href="https://codecov.io/gh/deer-develop/return-fetch">
        <img
          src="https://img.shields.io/codecov/c/github/deer-develop/return-fetch.svg"
          alt="Test Coverage"
          height="18"
        />
      </a>
      <a href="https://www.npmjs.com/package/return-fetch">
        <img
          src="https://img.shields.io/npm/v/return-fetch.svg"
          alt="npm version"
          height="18"
        />
      </a>
      <a href="https://bundlephobia.com/package/return-fetch">
        <img
          src="https://img.shields.io/bundlephobia/minzip/return-fetch"
          alt="Bundle Size"
          height="18"
        />
      </a>
      <a href="https://raw.githubusercontent.com/deer-develop/return-fetch/main/LICENSE">
        <img
          src="https://img.shields.io/npm/l/return-fetch.svg"
          alt="MIT license"
          height="18"
        />
      </a>
    </div>
  );
};

export default BadgeSection;
