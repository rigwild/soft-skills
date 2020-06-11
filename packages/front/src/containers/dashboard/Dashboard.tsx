import {
  DeleteOutlined,
  ExperimentOutlined,
  LoadingOutlined,
  RedoOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Empty, Spin, Tooltip, Typography } from "antd";
import { getUploads } from "api/upload";
import { AxiosError, AxiosResponse } from "axios";
import CenteredWrapper from "components/centeredwrapper";
import { dateFormat } from "functions/date";
import { getErrorMessage } from "functions/error";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const { Title } = Typography;

// 10 seconds in ms
const POLLING_INTERVAL = 10000;

enum AnalysisState {
  PENDING = "pending",
  ERROR = "error",
  SUCCESS = "finished",
}

type Upload = {
  _id: string;
  analysisId: string;
  videoFile: string;
  state: AnalysisState;
  uploadTimestamp: string;
  lastStateEditTimestamp: string;
};

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

  useEffect(() => {
    setLoading(true);
    fetchUploads();
  }, [fetchUploads]);

  const getStateContent = (state: AnalysisState) => {
    type AlertType = "warning" | "error" | "success" | undefined;
    let type: AlertType = undefined;
    switch (state) {
      case AnalysisState.PENDING:
        type = "warning";
        break;
      case AnalysisState.ERROR:
        type = "error";
        break;
      case AnalysisState.SUCCESS:
        type = "success";
        break;
    }
    return <Alert message={`Analysis state: ${state}`} type={type} showIcon />;
  };

  const getAnalysisDate = (upload: Upload) => {
    return upload.state === "pending" || upload.state === "error"
      ? "-"
      : dateFormat(new Date(upload.lastStateEditTimestamp));
  };

  const getExtra = (state: AnalysisState) => {
    switch (state) {
      case AnalysisState.PENDING:
        return (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        );
      case AnalysisState.SUCCESS:
      case AnalysisState.ERROR:
        return (
          <Tooltip title="Delete analysis" placement="top">
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              style={{ marginTop: 5 }}
            />
          </Tooltip>
        );
    }
  };

  const getAction = (upload: Upload) => {
    switch (upload.state) {
      case AnalysisState.SUCCESS:
        return [
          <Link to={`/analysis/${upload.analysisId}`} key="analysis">
            <Button type="primary" icon={<ExperimentOutlined />}>
              Show analysis
            </Button>
          </Link>,
        ];
      case AnalysisState.ERROR:
        return [
          <Button
            type="primary"
            icon={<RedoOutlined />}
            style={{ backgroundColor: "#ffbf00", borderColor: "#ffbf00" }}
          >
            Retry
          </Button>,
        ];
    }
  };

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
          <Card
            key={upload._id}
            title={upload.videoFile}
            extra={getExtra(upload.state)}
            style={{ height: 290, width: 300, margin: 15 }}
            actions={getAction(upload)}
          >
            {getStateContent(upload.state)}
            <div style={{ marginTop: 15 }}>
              <p style={{ marginBottom: 5 }}>
                <strong>Uploaded: </strong>
                {dateFormat(new Date(upload.uploadTimestamp))}
              </p>
              <p>
                <strong>Analysed:  </strong>
                {getAnalysisDate(upload)}
              </p>
            </div>
          </Card>
        ))}
      </CenteredWrapper>
    </>
  );
};

export default DashboardContainer;
