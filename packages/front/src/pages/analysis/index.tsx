import CenteredWrapper from "components/centeredwrapper";
import AnalysisContainer from "containers/analysis";
import React from "react";
import { useParams } from "react-router-dom";

const Analysis = () => {
  const { id } = useParams();
  return (
    <CenteredWrapper>
      <AnalysisContainer id={id} />
    </CenteredWrapper>
  );
};

export default Analysis;
