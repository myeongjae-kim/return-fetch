"use client";

import React from "react";
import { constants } from "@/app/common/constants";
import TableOfContents from "@/app/components/TableOfContents";
import { toast, Toaster } from "react-hot-toast";

const ClientDependencyContainer = (): React.JSX.Element => {
  React.useEffect(() => {
    document.querySelectorAll("h2, h3, h4, h5, h6").forEach((block) => {
      "z".split(" ").forEach((className) => {
        block.classList.add(className);
      });
      block.innerHTML = `${block.innerHTML} <a class="${constants.HEADING_URL_COPY_LINK_CLASS}" href="#${block.id}" onClick="navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#${block.id}')">
  <span class="material-icons cursor-pointer select-none" style="font-size: 1.2em">
    link
  </span>
</a>
`;
    });
  }, []);

  React.useEffect(() => {
    if (!document) {
      return;
    }

    // link copy handler
    document
      .querySelectorAll(`a.${constants.HEADING_URL_COPY_LINK_CLASS}`)
      .forEach((element) => {
        element.attributes.removeNamedItem("onClick");
        element.addEventListener("click", () => {
          void navigator.clipboard.writeText(
            window.location.origin +
              window.location.pathname +
              element.getAttribute("href"),
          );
          toast.success("Link copied!");
        });
      });

    // toc highlighter
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (document.documentElement.scrollTop === 0) {
            // 글 목록에서 글 상세로 이동했을 때 끝쪽의 heading에 highlight가 되는 버그가 있음.
            // scroll이 제일 위에 있을 때는 highlight를 하지 않음으로서 버그 해결
            return;
          }

          const id = entry.target.getAttribute("id");

          const tocLinks = [
            ...(document
              .getElementById(constants.TOC_WRAPPER_NAV)
              ?.querySelectorAll(`nav li a`) || []),
          ];

          const targetLinkIndex = tocLinks.findIndex(
            (element) => element.getAttribute("href") === `#${id}`,
          );

          const interactionDirection =
            entry.boundingClientRect.y < 0 ? "top" : "bottom";
          const elementInOrOut = entry.intersectionRatio > 0 ? "in" : "out";

          if (interactionDirection !== "bottom") {
            return;
          }

          tocLinks.forEach((element) => {
            element.classList.remove("font-bold");
            element.classList.add(constants.TOC_LINK_DEFAULT_CLASS_NAME);
          });
          if (elementInOrOut === "in") {
            tocLinks[targetLinkIndex]?.classList?.remove(
              constants.TOC_LINK_DEFAULT_CLASS_NAME,
            );
            tocLinks[targetLinkIndex]?.classList?.add("font-bold");
          } else {
            tocLinks[targetLinkIndex - 1]?.classList?.remove(
              constants.TOC_LINK_DEFAULT_CLASS_NAME,
            );
            tocLinks[targetLinkIndex - 1]?.classList?.add("font-bold");
          }
        });
      },
      {
        rootMargin: "0px 0px -70% 0px",
      },
    );

    // register observer
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((element) => {
      observer.observe(element);
    });
  }, []);

  return (
    <>
      <TableOfContents />
      <Toaster
        position="bottom-center"
        toastOptions={{
          position: "top-center",
          style: {
            border: "1px solid #1A56DB",
            color: "#1A56DB",
            userSelect: "none",
            paddingLeft: "16px",
          },
          iconTheme: {
            primary: "#1A56DB",
            secondary: "#FFFAEE",
          },
        }}
      />
    </>
  );
};

export default ClientDependencyContainer;
