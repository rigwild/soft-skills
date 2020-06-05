import { Alert, Collapse, Spin, Typography } from "antd";
import { getAnalysis, getAnalysisDataFile } from "api/upload";
import { AxiosError, AxiosResponse } from "axios";
import { getErrorMessage } from "functions/error";
import React, { useEffect, useState } from "react";

const { Panel } = Collapse;
const { Title } = Typography;

type Props = {
  id: string;
};

type Analysis = {
  name: string;
  date: string;
  amplitude: number[];
  pitch: { x: number; y: number }[];
  intensity: number[];
  amplitudeGraphURL: string;
  pitchGraphURL: string;
  intensityGraphURL: string;
  videoURL: string;
};

const AnalysisContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [analysis, setAnalysis] = useState<undefined | Analysis>(undefined);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalysis(props.id),
      getAnalysisDataFile(props.id, "amplitude"),
      getAnalysisDataFile(props.id, "pitch"),
      getAnalysisDataFile(props.id, "intensity"),
      getAnalysisDataFile(props.id, "file"),
    ])
      .then((res: AxiosResponse[]) => {
        const analysisData = res[0].data.data;
        const analysis: Analysis = {
          name: analysisData.name,
          date: new Date(analysisData.analysisDate).toLocaleDateString("en-CA"),
          amplitude: analysisData.amplitude.flat(),
          pitch: analysisData.pitch.map((pitchData: number[]) => {
            return { x: pitchData[0], y: pitchData[1] };
          }),
          intensity: analysisData.intensity.flat(),
          amplitudeGraphURL: URL.createObjectURL(res[1].data),
          pitchGraphURL: URL.createObjectURL(res[2].data),
          intensityGraphURL: URL.createObjectURL(res[3].data),
          videoURL: URL.createObjectURL(res[4].data),
        };
        setAnalysis(analysis);
      })
      .catch((error: AxiosError) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [props.id]);

  if (error) {
    return (
      <Alert
        message="An error occurred"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: "25vh" }}
      />
    );
  }

  if (loading) {
    return (
      <Spin
        tip="Retrieving analysis..."
        size="large"
        style={{ marginTop: "25vh" }}
      />
    );
  }

  return (
    <>
      <Title style={{ margin: 0 }}>{analysis?.name}</Title>
      <Title level={4} style={{ marginTop: 10 }}>
        {analysis?.date}
      </Title>
      <video controls src={analysis?.videoURL} height={400} />
      <Collapse style={{ width: "100%", marginTop: 25 }}>
        <Panel header="Amplitude" key="amplitude">
          <img src={analysis?.amplitudeGraphURL} alt="Amplitude graph" />
        </Panel>
        <Panel header="Pitch" key="pitch">
          <img src={analysis?.pitchGraphURL} alt="Pitch graph" />
        </Panel>
        <Panel header="Intensity" key="intensity">
          <img src={analysis?.intensityGraphURL} alt="Intensity graph" />
        </Panel>
      </Collapse>
    </>
  );
};

export default AnalysisContainer;
