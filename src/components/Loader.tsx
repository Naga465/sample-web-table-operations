import React, { FC } from "react";
import "../styles/loader.css";

type LoaderProps = {
  loading: boolean;
  children: React.ReactNode;
};
const Loader: FC<LoaderProps> = (props) => {
  return props.loading ? (
    <div className="loader">
      <div className="loader-dots"></div>
    </div>
  ) : (
    <React.Fragment>{props.children}</React.Fragment>
  );
};

export default Loader;
