import React from "react";
import Spinner from "@/app/components/Spinner";

const LoadingIndicator = (): React.JSX.Element => {
  return (
    <div
      className={
        "fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-gray-700 bg-opacity-30"
      }
    >
      <Spinner />
    </div>
  );
};

export default LoadingIndicator;
