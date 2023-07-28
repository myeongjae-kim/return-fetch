import React from "react";

const IconLinkButton = (
  props: React.ComponentProps<"a">,
): React.JSX.Element => {
  return (
    <a
      className="flex h-12 w-12 items-center justify-center rounded-full text-black opacity-60 transition-transform hover:bg-gray-100 hover:text-black hover:opacity-100 active:scale-95"
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    />
  );
};

export default IconLinkButton;
