import React from "react";

const IconLinkButton = (
  props: React.ComponentProps<"a">,
): React.JSX.Element => {
  return (
    <a
      className="hover:text-black text-black hover:opacity-100 opacity-60 active:scale-95 transition-transform flex w-12 h-12 rounded-full items-center justify-center hover:bg-gray-100"
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    />
  );
};

export default IconLinkButton;
