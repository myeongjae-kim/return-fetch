"use client";

import React from "react";
import { constants } from "@/app/common/constants";
import TableOfContents from "@/app/components/TableOfContents";
import { toast, Toaster } from "react-hot-toast";

const ClientDependencyContainer = (): React.JSX.Element => {
  React.useEffect(() => {
    document.querySelectorAll("h2, h3, h4, h5, h6").forEach((block) => {
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
