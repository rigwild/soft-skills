import { LoadingOutlined, VideoCameraAddOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, Spin, Typography } from "antd";
import { getUploads } from "api/upload";
import { AxiosError, AxiosResponse } from "axios";
import CenteredWrapper from "components/centeredwrapper";
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
  uploadTimestamp: string; // TODO: Add initial upload timestamp
  lastStateEditTimestamp: string; // TODO: Add last state edit timestamp
};

type AnalysisResponse = {
  data: Upload[];
};

const DashboardContainer = () => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<Upload[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchAnalyses = useCallback(() => {
    getUploads()
      .then((res: AxiosResponse<AnalysisResponse>) => {
        const analyses: Upload[] = res.data.data;
        const hasPending = analyses.find(
          (analysis) => analysis.state === AnalysisState.PENDING
        );
        if (hasPending) {
          setTimeout(() => fetchAnalyses(), POLLING_INTERVAL);
        }
        setAnalyses(analyses);
      })
      .catch((error: AxiosError) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAnalyses();
  }, [fetchAnalyses]);

  const getContent = (state: AnalysisState) => {
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

  const getExtra = (analysis: Analysis) => {
    switch (analysis.state) {
      case AnalysisState.PENDING:
        return (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        );
      case AnalysisState.SUCCESS:
        return (
          <Link to={`/analysis/${analysis.analysisId}`} style={{ marginTop: 25 }}>
            Details
          </Link>
        );
    }
  };

  if (loading) {
    return (
      <Spin
        tip="Retrieving your analyses..."
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

  if (analyses.length === 0) {
    return (
      <>
        <Empty description={false} style={{ marginTop: "15vh" }} />
        <Title style={{ marginTop: 15 }}>No analysis to display</Title>
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
    <CenteredWrapper row wrap>
      {analyses.map((analysis) => (
        <Card
          key={analysis._id}
          title={analysis.videoFile}
          extra={getExtra(analysis)}
          style={{ width: 300, margin: 15 }}
        >
          {getContent(analysis.state)}
        </Card>
      ))}
    </CenteredWrapper>
  );
};

export default DashboardContainer;
