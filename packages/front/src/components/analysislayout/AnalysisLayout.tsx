import React from "react";

type Props = {
  children: JSX.Element | JSX.Element[];
};

const AnalysisLayout = (props: Props) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {props.children}
  </div>
);

export default AnalysisLayout;
