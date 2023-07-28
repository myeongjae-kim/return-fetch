import React from "react";

const Button = ({
  variant = "blue",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "blue" | "purple";
}): React.JSX.Element => {
  return (
    <button
      type="button"
      className={
        "rounded-lg bg-gradient-to-r px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4" +
        (variant === "purple"
          ? " from-purple-400 via-purple-500 to-purple-600 focus:ring-purple-300 dark:focus:ring-purple-800"
          : " from-blue-500 via-blue-600 to-blue-700 focus:ring-blue-300 dark:focus:ring-blue-800")
      }
      {...props}
    />
  );
};

export default Button;
