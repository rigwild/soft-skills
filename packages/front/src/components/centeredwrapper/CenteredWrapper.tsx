import React from "react";

type Props = {
  children: JSX.Element | JSX.Element[];
};

const CenteredWrapper = (props: Props) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {props.children}
  </div>
);

export default CenteredWrapper;
