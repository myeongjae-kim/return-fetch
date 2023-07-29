import React from "react";

const IconLinkButton = ({
  className,
  ...props
}: React.ComponentProps<"a"> & {
  className?: string;
}): React.JSX.Element => {
  return (
    <a
      className={
        "flex h-12 w-12 items-center justify-center rounded-full opacity-60 transition-transform hover:bg-gray-100 hover:opacity-100 active:scale-95 " +
        (className ? className : "")
      }
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    />
  );
};

export default IconLinkButton;
