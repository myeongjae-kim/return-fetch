"use client";

import React from "react";
import { constants } from "@/app/common/constants";

type Heading = {
  depth: number;
  id: string;
  innerHTML: string;
};

const render = (headings: Heading[], curr = 0): string => {
  if (headings.length === 0) {
    return "";
  }

  const id = headings[curr].id;
  const innerHTML = headings[curr].innerHTML;

  if (headings.length - 1 === curr) {
    return `<li><a class="${constants.TOC_LINK_DEFAULT_CLASS_NAME}" href="#${id}">${innerHTML}</a></li>`;
  }

  const currentDepth = headings[curr].depth;
  const nextDepth = headings[curr + 1].depth;

  if (nextDepth > currentDepth) {
    let addDepth = "";
    for (let i = currentDepth; i < nextDepth; i++) {
      addDepth += '<li class="list-none"><ul>';
    }

    return `<li><a class="${
      constants.TOC_LINK_DEFAULT_CLASS_NAME
    }" href="#${id}">${innerHTML}</a></li>${addDepth}${render(
      headings,
      curr + 1,
    )}`;
  }

  if (nextDepth < currentDepth) {
    let minusDepth = "";
    for (let i = nextDepth; i < currentDepth; i++) {
      minusDepth += "</ul></li>";
    }

    return `<li><a class="${
      constants.TOC_LINK_DEFAULT_CLASS_NAME
    }" href="#${id}">${innerHTML}</a></li>${minusDepth}${render(
      headings,
      curr + 1,
    )}`;
  }

  return `<li><a class="${
    constants.TOC_LINK_DEFAULT_CLASS_NAME
  }" href="#${id}">${innerHTML}</a></li>${render(headings, curr + 1)}`;
};

const TableOfContents = (): JSX.Element => {
  const [headings, setHeadings] = React.useState<Heading[]>([]);

  React.useEffect(() => {
    setHeadings(
      [...document.querySelectorAll("h2, h3, h4, h5, h6")].map((block) => ({
        depth: parseInt(block.tagName[1]),
        id: block.id,
        innerHTML: block.innerHTML,
      })),
    );
  }, []);

  return headings.length > 0 ? (
    <>
      <nav
        id={constants.TOC_WRAPPER_NAV}
        className={
          "mb-4 flex hidden max-h-[calc(100vh-0.5rem)] max-w-md overflow-scroll 2xl:fixed 2xl:left-2 2xl:top-2 2xl:block 2xl:max-w-xs"
        }
      >
        <div
          className={
            "rounded-lg bg-stone-50 p-2 text-sm leading-6 2xl:bg-transparent"
          }
        >
          <span
            id={constants.TOC_ID}
            className={
              "select-none font-bold " + constants.TOC_LINK_DEFAULT_CLASS_NAME
            }
          >
            Table of Contents
          </span>
          <div
            dangerouslySetInnerHTML={{ __html: `<ul>${render(headings)}</ul>` }}
          ></div>
        </div>
      </nav>
    </>
  ) : (
    <></>
  );
};

export default TableOfContents;
