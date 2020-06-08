import React from "react";

type Props = {
  row?: boolean;
  wrap?: boolean;
  children: JSX.Element | JSX.Element[];
};

const CenteredWrapper = (props: Props) => (
  <div
    style={{
      display: "flex",
      flexDirection: props.row ? "row" : "column",
      ...(props.wrap && { flexWrap: "wrap" }),
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {props.children}
  </div>
);

export default CenteredWrapper;
