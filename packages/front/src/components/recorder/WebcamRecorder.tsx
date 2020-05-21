import { RedoOutlined } from "@ant-design/icons";
import { Alert, Button, Spin, Statistic } from "antd";
import React, { MutableRefObject, RefObject, useRef, useState } from "react";
import Webcam from "react-webcam";

const { Countdown } = Statistic;

enum RecorderState {
  LOADING,
  READY,
  RECORDING,
  DISPLAY,
  ERROR,
}

const FIVE_MINUTE_IN_MS = 5 * 60 * 1000;

const WebcamRecorder = () => {
  const webcamRef: RefObject<Webcam | null> &
    RefObject<HTMLVideoElement | null> = useRef(null);
  const mediaRecorderRef: MutableRefObject<MediaRecorder | null> = useRef(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
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
              setState(RecorderState.ERROR);
              setError(mediaError.toString());
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
          <Button onClick={handleStartRecording} type="primary">
            Start (max : 5 minutes)
          </Button>
        );
      case RecorderState.RECORDING:
        const deadline = Date.now() + FIVE_MINUTE_IN_MS;
        return (
          <>
            <Button onClick={handleStopRecording} danger type="primary">
              Stop
            </Button>
            <Countdown
              title="Time remaining"
              value={deadline}
              onFinish={handleStopRecording}
              style={{ marginTop: 25 }}
            />
          </>
        );
      case RecorderState.DISPLAY:
        return (
          <>
            <Button
              onClick={handleResetVideo}
              type="primary"
              style={{ marginBottom: 15 }}
              icon={<RedoOutlined />}
            >
              Retry
            </Button>
            <Button
              onClick={() => console.log("Analysing video...")}
              type="primary"
              danger
            >
              Send video for analysis
            </Button>
          </>
        );
    }
  };

  const displayError = () => {
    return (
      <Alert
        message="An error occured with the webcam recorder"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: "25vh" }}
      />
    );
  };

  return state !== RecorderState.ERROR ? (
    <>
      {displayMedia()}
      <div
        style={{
          marginTop: 25,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {displayControlButtons()}
      </div>
    </>
  ) : (
    displayError()
  );
};

export default WebcamRecorder;
