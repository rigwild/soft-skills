import { RedoOutlined, VideoCameraTwoTone } from "@ant-design/icons";
import { Alert, Button, Spin, Statistic } from "antd";
import { upload } from "api/upload";
import { AxiosError } from "axios";
import Success from "components/success";
import React, { MutableRefObject, RefObject, useRef, useState } from "react";
import Webcam from "react-webcam";

const { Countdown } = Statistic;

enum RecorderState {
  LOADING,
  READY,
  RECORDING,
  DISPLAY,
  ERROR,
  UPLOAD_ERROR,
  UPLOAD_SUCCESS,
}

const FIVE_MINUTE_IN_MS = 5 * 60 * 1000;

const centeredDivStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const WebcamRecorder = () => {
  const webcamRef: RefObject<Webcam | null> &
    RefObject<HTMLVideoElement | null> = useRef(null);
  const mediaRecorderRef: MutableRefObject<MediaRecorder | null> = useRef(null);

  const [video, setVideo] = useState<Blob | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
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

  const handleUploadVideo = () => {
    setUploading(true);
    upload(video!)
      .then(() => setState(RecorderState.UPLOAD_SUCCESS))
      .catch((error: AxiosError) => {
        let errorMessage: string = error.response?.data.message;
        if (error.response?.status === 401) {
          errorMessage = errorMessage
            .concat(" ")
            .concat("Please, log out and log in again.");
        }
        setState(RecorderState.UPLOAD_ERROR);
        setError(errorMessage);
      })
      .finally(() => setUploading(false));
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
              setError(`Webcam recorder ${mediaError.toString()}`);
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
            Start (5:00 maximum)
          </Button>
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
              onClick={handleResetVideo}
              type="primary"
              style={{ marginBottom: 15 }}
              icon={<RedoOutlined />}
              disabled={uploading}
            >
              Delete and start again
            </Button>
            <Button
              onClick={handleUploadVideo}
              type="primary"
              danger
              disabled={uploading}
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
        message="An error occurred"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: "25vh" }}
      />
    );
  };

  const isInErrorState = () => {
    return (
      state === RecorderState.ERROR || state === RecorderState.UPLOAD_ERROR
    );
  };

  const displaySuccessMessage = () => {
    return (
      <Success
        title="Your video has been successfully uploaded!"
        subtitle="It has been sent for analysis. You will be able to see the result in your dashboard soon."
        buttonText="Go to dashboard"
        linkTo="dashboard"
      />
    );
  };

  return !isInErrorState() ? (
    state === RecorderState.UPLOAD_SUCCESS ? (
      displaySuccessMessage()
    ) : (
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
    )
  ) : (
    <>
      {displayError()}
      {state === RecorderState.UPLOAD_ERROR && (
        <Button
          onClick={handleResetVideo}
          type="primary"
          style={{ marginTop: 25 }}
          icon={<RedoOutlined />}
        >
          Try again
        </Button>
      )}
    </>
  );
};

export default WebcamRecorder;
