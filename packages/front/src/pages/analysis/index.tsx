import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAnalysis, getAnalysisDataFile } from "api/upload";

const Analysis = () => {
  const { id } = useParams();
  const [data, setData] = useState<undefined | any>(undefined);
  const [amplitude, setAmplitude] = useState<undefined | any>(undefined);
  const [pitch, setPitch] = useState<undefined | any>(undefined);
  const [intensity, setIntensity] = useState<undefined | any>(undefined);

  useEffect(() => {
    getAnalysis(id)
      .then((res) => setData(res.data.data))
      .catch((err) => console.log(err));
    getAnalysisDataFile(id, "amplitude")
      .then((res) => {
        setAmplitude(URL.createObjectURL(res.data));
      })
      .catch((err) => console.log(err.response));
    getAnalysisDataFile(id, "pitch")
      .then((res) => {
        setPitch(URL.createObjectURL(res.data));
      })
      .catch((err) => console.log(err.response));
    getAnalysisDataFile(id, "intensity")
      .then((res) => {
        setIntensity(URL.createObjectURL(res.data));
      })
      .catch((err) => console.log(err.response));
  }, []);

  return (
    <>
      <p>{JSON.stringify(data)}</p>
      {amplitude && <img src={amplitude} />}
      {pitch && <img src={pitch} />}
      {intensity && <img src={intensity} />}
    </>
  );
};

export default Analysis;
