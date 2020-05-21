import WebcamRecorder from "components/recorder";
import React from "react";

const Record = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <WebcamRecorder />
  </div>
);

export default Record;
