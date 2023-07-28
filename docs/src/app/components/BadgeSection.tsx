import React from "react";

type Badge = {
  href: string;
  src: string;
  alt: string;
};

const badges: Badge[] = [
  {
    href: "https://github.com/deer-develop/return-fetch/actions?query=workflow%3ACI",
    src: "https://github.com/deer-develop/return-fetch/workflows/CI/badge.svg",
    alt: "CI",
  },
  {
    href: "https://codecov.io/gh/deer-develop/return-fetch",
    src: "https://img.shields.io/codecov/c/github/deer-develop/return-fetch.svg",
    alt: "Test Coverage",
  },
  {
    href: "https://www.npmjs.com/package/return-fetch",
    src: "https://img.shields.io/npm/v/return-fetch.svg",
    alt: "npm version",
  },
  {
    href: "https://bundlephobia.com/package/return-fetch",
    src: "https://img.shields.io/bundlephobia/minzip/return-fetch",
    alt: "Bundle Size",
  },
  {
    href: "https://raw.githubusercontent.com/deer-develop/return-fetch/main/LICENSE",
    src: "https://img.shields.io/npm/l/return-fetch.svg",
    alt: "MIT license",
  },
];

const BadgeSection = (): React.JSX.Element => {
  return (
    <div className={"flex gap-2 flex-wrap justify-center"}>
      {badges.map(({ href, src, alt }) => (
        <a
          className={"select-none cursor-pointer"}
          key={href}
          href={href}
          target={"_blank"}
          rel={"noreferrer noopener"}
        >
          <img src={src} alt={alt} height="18" />
        </a>
      ))}
    </div>
  );
};

export default BadgeSection;
