import { RedoOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import { upload } from "api/upload";
import { AxiosError } from "axios";
import WebcamRecorder from "components/recorder";
import Success from "components/success";
import { getErrorMessage } from "functions/error";
import React, { useState } from "react";

const RecorderContainer = () => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleUploadVideo = (video: Blob) => {
    setUploading(true);
    upload(video)
      .then(() => setSuccess(true))
      .catch((error: AxiosError) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      })
      .finally(() => setUploading(false));
  };

  if (success) {
    return (
      <Success
        title="Your video has been successfully uploaded!"
        subtitle="It has been sent for analysis. You will be able to see the result in your dashboard soon."
        buttonText="Go to dashboard"
        linkTo="dashboard"
      />
    );
  }

  if (error) {
    return (
      <>
        <Alert
          message="An error occurred"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: "25vh" }}
        />
        <Button
          type="primary"
          style={{ marginTop: 25 }}
          icon={<RedoOutlined />}
          onClick={() => setError(undefined)}
        >
          Try again
        </Button>
      </>
    );
  }

  return (
    <WebcamRecorder
      setError={setError}
      uploadVideo={handleUploadVideo}
      uploading={uploading}
    />
  );
};

export default RecorderContainer;
