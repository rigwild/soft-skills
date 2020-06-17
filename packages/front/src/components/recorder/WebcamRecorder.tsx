import {
  ExperimentOutlined,
  RedoOutlined,
  UploadOutlined,
  VideoCameraOutlined,
  VideoCameraTwoTone,
} from "@ant-design/icons";
import { Button, Spin, Statistic, Typography, Upload } from "antd";
import React, { MutableRefObject, RefObject, useRef, useState } from "react";
import Webcam from "react-webcam";

const { Countdown } = Statistic;
const { Text } = Typography;

enum RecorderState {
  LOADING,
  READY,
  RECORDING,
  DISPLAY,
}

const FIVE_MINUTE_IN_MS = 5 * 60 * 1000;

const centeredDivStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

type Props = {
  uploading: boolean;
  setError: (error: string) => void;
  uploadVideo: (video: Blob) => void;
};

const WebcamRecorder = (props: Props) => {
  const webcamRef: RefObject<Webcam | null> &
    RefObject<HTMLVideoElement | null> = useRef(null);
  const mediaRecorderRef: MutableRefObject<MediaRecorder | null> = useRef(null);

  const [video, setVideo] = useState<Blob | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState("");
  const [state, setState] = useState(RecorderState.LOADING);

  const handleStartRecording = () => {
    setState(RecorderState.RECORDING);
    mediaRecorderRef.current = new MediaRecorder(
      webcamRef.current?.stream as MediaStream,
      {
        mimeType: "video/webm",
      }
    );
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  };

  const handleDataAvailable = ({ data }: { data: BlobPart }) => {
    const blob = new Blob([data], {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    setVideo(blob);
    setVideoUrl(url);
    setState(RecorderState.DISPLAY);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleResetVideo = () => {
    window.URL.revokeObjectURL(videoUrl);
    setVideo(undefined);
    setVideoUrl("");
    setState(RecorderState.LOADING);
  };

  const displayMedia = () => {
    if (state === RecorderState.DISPLAY) {
      return <video controls src={videoUrl} preload="auto" />;
    } else {
      return (
        <>
          <Webcam
            ref={webcamRef}
            onUserMedia={() => setState(RecorderState.READY)}
            onUserMediaError={(mediaError) => {
              props.setError(`Webcam recorder ${mediaError.toString()}`);
            }}
          />
          {state === RecorderState.LOADING && (
            <Spin tip="Connecting to your webcam..." size="large" />
          )}
        </>
      );
    }
  };

  const displayControlButtons = () => {
    switch (state) {
      case RecorderState.READY:
        return (
          <>
            <Button
              onClick={handleStartRecording}
              type="primary"
              icon={<VideoCameraOutlined />}
              style={{ width: "250px" }}
            >
              Start recording (5:00 maximum)
            </Button>
            <Text style={{ fontSize: 24, marginTop: 10, marginBottom: 10 }}>
              or
            </Text>
            <Upload
              showUploadList={false}
              beforeUpload={(file: Blob, _) => {
                props.uploadVideo(file);
                return false;
              }}
            >
              <Button type="primary" danger style={{ width: "250px" }}>
                <UploadOutlined /> Upload a video
              </Button>
            </Upload>
          </>
        );
      case RecorderState.RECORDING:
        const deadline = Date.now() + FIVE_MINUTE_IN_MS;
        return (
          <>
            <div style={centeredDivStyle}>
              <VideoCameraTwoTone style={{ fontSize: 27 }} twoToneColor="red" />
              <span style={{ fontSize: 25, marginLeft: 8 }}>Recording...</span>
            </div>
            <Countdown
              title="Time left"
              value={deadline}
              onFinish={handleStopRecording}
              style={{ margin: 15, textAlign: "center" }}
            />
            <Button onClick={handleStopRecording} danger type="primary">
              Stop recording
            </Button>
          </>
        );
      case RecorderState.DISPLAY:
        return (
          <>
            <Button
              onClick={() => props.uploadVideo(video!)}
              type="primary"
              style={{ marginBottom: 15 }}
              icon={<ExperimentOutlined />}
              disabled={props.uploading}
            >
              Send video for analysis
            </Button>
            <Button
              onClick={handleResetVideo}
              type="primary"
              danger
              icon={<RedoOutlined />}
              disabled={props.uploading}
            >
              Delete and start again
            </Button>
          </>
        );
    }
  };

  return (
    <>
      {displayMedia()}
      <div
        style={{
          ...centeredDivStyle,
          marginTop: 25,
          flexDirection: "column",
        }}
      >
        {displayControlButtons()}
      </div>
    </>
  );
};

export default WebcamRecorder;
