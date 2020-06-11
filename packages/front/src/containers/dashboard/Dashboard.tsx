import {
  ExclamationCircleOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import { Alert, Button, Empty, message, Modal, Spin, Typography } from "antd";
import { deleteUpload, getUploads } from "api/upload";
import { AxiosError, AxiosResponse } from "axios";
import CenteredWrapper from "components/centeredwrapper";
import UploadCard from "components/uploadcard";
import { getErrorMessage } from "functions/error";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnalysisState, Upload } from "types/dashboard";

const { confirm } = Modal;
const { Title } = Typography;

// 10 seconds in ms
const POLLING_INTERVAL = 10000;

type UploadsResponse = {
  data: Upload[];
};

const DashboardContainer = () => {
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchUploads = useCallback(() => {
    getUploads()
      .then((res: AxiosResponse<UploadsResponse>) => {
        const uploads: Upload[] = res.data.data;
        const hasPending = uploads.find(
          (upload) => upload.state === AnalysisState.PENDING
        );
        if (hasPending) {
          setTimeout(() => fetchUploads(), POLLING_INTERVAL);
        }
        setUploads(uploads);
      })
      .catch((error: AxiosError) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUpload = (_id: string) => {
    confirm({
      title: "Are you sure you want to delete this upload?",
      icon: <ExclamationCircleOutlined />,
      content: "This action can't be undone",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      style: { top: 350 },
      onOk() {
        return deleteUpload(_id)
          .then(() =>
            setUploads(uploads.filter((upload: Upload) => upload._id !== _id))
          )
          .catch((error: AxiosError) =>
            message.error(getErrorMessage(error), 4)
          );
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchUploads();
  }, [fetchUploads]);

  if (loading) {
    return (
      <Spin
        tip="Retrieving your uploads..."
        size="large"
        style={{ marginTop: "25vh" }}
      />
    );
  }

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

  if (uploads.length === 0) {
    return (
      <>
        <Empty description={false} style={{ marginTop: "15vh" }} />
        <Title style={{ marginTop: 15 }}>No uploads to display</Title>
        <Link to="/record">
          <Button
            type="primary"
            style={{ marginTop: 25 }}
            icon={<VideoCameraAddOutlined />}
          >
            Record a video
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to="/record">
        <Button
          type="primary"
          style={{
            marginTop: 10,
            marginBottom: 10,
            backgroundColor: "#f5317f",
            borderColor: "#f5317f",
          }}
          icon={<VideoCameraAddOutlined />}
          size="large"
        >
          Record a video
        </Button>
      </Link>
      <CenteredWrapper row wrap>
        {uploads.map((upload) => (
          <UploadCard
            upload={upload}
            deleteUpload={handleDeleteUpload}
            key={upload._id}
          />
        ))}
      </CenteredWrapper>
    </>
  );
};

export default DashboardContainer;
