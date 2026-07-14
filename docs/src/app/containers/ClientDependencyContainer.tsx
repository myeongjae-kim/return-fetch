"use client";

import React from "react";
import { constants } from "@/app/common/constants";
import TableOfContents from "@/app/components/TableOfContents";
import { toast, Toaster } from "react-hot-toast";

const ClientDependencyContainer = (): React.JSX.Element => {
  React.useEffect(() => {
    const cleanups: Array<() => void> = [];

    document.querySelectorAll("h2, h3, h4, h5, h6").forEach((heading) => {
      heading
        .querySelectorAll(`a.${constants.HEADING_URL_COPY_LINK_CLASS}`)
        .forEach((link) => link.remove());

      const separator = document.createTextNode(" ");
      const link = document.createElement("a");
      const icon = document.createElement("span");

      link.className = constants.HEADING_URL_COPY_LINK_CLASS;
      link.href = `#${heading.id}`;
      icon.className = "material-icons cursor-pointer select-none";
      icon.style.fontSize = "1.2em";
      icon.textContent = "link";
      link.append(icon);

      const handleClick = () => {
        void navigator.clipboard.writeText(
          window.location.origin +
            window.location.pathname +
            link.getAttribute("href"),
        );
        toast.success("Link copied!");
      };

      link.addEventListener("click", handleClick);
      heading.append(separator, link);

      cleanups.push(() => {
        link.removeEventListener("click", handleClick);
        separator.remove();
        link.remove();
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
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
