import React from "react";
import { useParams } from "react-router-dom";

const Analysis = () => {
  const { id } = useParams();
  return (
    <>
      <p>{id}</p>
    </>
  );
};

export default Analysis;
