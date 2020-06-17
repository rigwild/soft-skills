import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Collapse, Spin, Typography } from "antd";
import { getAnalysis, getAnalysisDataFile } from "api/upload";
import { AxiosError, AxiosResponse } from "axios";
import CenteredWrapper from "components/centeredwrapper";
import LineGraph from "components/graph";
import { dateFormat } from "functions/date";
import { getErrorMessage } from "functions/error";
import React, { useEffect, useState } from "react";

const { Panel } = Collapse;
const { Title } = Typography;

type Props = {
  id: string;
};

type Analysis = {
  name: string;
  videoFile: string;
  audioFile: string;
  uploadTimestamp: string; // TODO: Add initial upload timestamp
  analysisTimestamp: string;
  amplitude: Array<number[]>;
  pitch: Array<number[]>;
  intensity: Array<number[]>;
  amplitudeGraphURL: string;
  pitchGraphURL: string;
  intensityGraphURL: string;
  videoURL: string;
  audioURL: string;
};

const AnalysisContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [analysis, setAnalysis] = useState<undefined | Analysis>(undefined);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalysis(props.id),
      getAnalysisDataFile(props.id, "amplitudePlotFile"),
      getAnalysisDataFile(props.id, "pitchPlotFile"),
      getAnalysisDataFile(props.id, "intensityPlotFile"),
      getAnalysisDataFile(props.id, "videoFile"),
      getAnalysisDataFile(props.id, "audioFile"),
    ])
      .then((res: AxiosResponse[]) => {
        const analysisData = res[0].data.data;
        const analysis: Analysis = {
          name: analysisData.name,
          videoFile: analysisData.videoFile,
          audioFile: analysisData.audioFile,
          uploadTimestamp: dateFormat(new Date(analysisData.uploadTimestamp)),
          analysisTimestamp: dateFormat(
            new Date(analysisData.analysisTimestamp)
          ),
          amplitude: analysisData.amplitude,
          pitch: analysisData.pitch.filter(
            (pitchData: number[]) => pitchData[1] !== 0
          ),
          intensity: analysisData.intensity,
          amplitudeGraphURL: URL.createObjectURL(res[1].data),
          pitchGraphURL: URL.createObjectURL(res[2].data),
          intensityGraphURL: URL.createObjectURL(res[3].data),
          videoURL: URL.createObjectURL(res[4].data),
          audioURL: URL.createObjectURL(res[5].data),
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
      <Title>{analysis?.name}</Title>
      <CenteredWrapper row wrap>
        <div>
          <p style={{ fontSize: 18, marginBottom: 5 }}>
            <strong>Uploaded: </strong>
            {analysis?.uploadTimestamp}
          </p>
          <p style={{ fontSize: 18 }}>
            <strong>Analyzed:  </strong>
            {analysis?.analysisTimestamp}
          </p>
        </div>
        <div style={{ marginLeft: 115 }}>
          <a download={analysis?.audioFile} href={analysis?.audioURL}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Download audio
            </Button>
          </a>
        </div>
      </CenteredWrapper>
      <video controls src={analysis?.videoURL} height={400} />
      <Collapse style={{ width: "100%", marginTop: 25 }}>
        <Panel header="Amplitude" key="amplitude">
          <CenteredWrapper row wrap>
            <img src={analysis?.amplitudeGraphURL} alt="Amplitude graph" />
            <LineGraph
              title="Amplitude values of the recording over time"
              xAxis="Time [s]"
              yAxis="Amplitude"
              dataName="Amplitude"
              data={analysis?.amplitude as Array<number[]>}
            />
          </CenteredWrapper>
        </Panel>
        <Panel header="Pitch" key="pitch">
          <CenteredWrapper row wrap>
            <img src={analysis?.pitchGraphURL} alt="Pitch graph" />
            <LineGraph
              point
              title="Pitch values of the recording over time"
              xAxis="Time [s]"
              yAxis="Fundamental frequency [Hz]"
              dataName="Pitch"
              data={analysis?.pitch as Array<number[]>}
              valueSuffix="Hz"
            />
          </CenteredWrapper>
        </Panel>
        <Panel header="Intensity" key="intensity">
          <CenteredWrapper row wrap>
            <img src={analysis?.intensityGraphURL} alt="Intensity graph" />
            <LineGraph
              title="Intensity values of the recording over time"
              xAxis="Time [s]"
              yAxis="Intensity [dB]"
              dataName="Intensity"
              data={analysis?.intensity as Array<number[]>}
              valueSuffix="dB"
            />
          </CenteredWrapper>
        </Panel>
      </Collapse>
    </>
  );
};

export default AnalysisContainer;
