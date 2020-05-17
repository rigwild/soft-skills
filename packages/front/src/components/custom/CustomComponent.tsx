import React from "react";

type Props = {
  title: string;
};

const CustomComponent = (props: Props) => (
  <>
    <h1>{props.title}</h1>
  </>
);

export default CustomComponent;
