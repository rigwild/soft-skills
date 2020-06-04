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

type Analysis = {
  _id: string;
  name: string;
  state: AnalysisState;
};

type AnalysisResponse = {
  data: Analysis[];
};

const DashboardContainer = () => {
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchAnalyses = useCallback(() => {
    getUploads()
      .then((res: AxiosResponse<AnalysisResponse>) => {
        const analyses: Analysis[] = res.data.data;
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
    return <Alert message={`Analysis state : ${state}`} type={type} showIcon />;
  };

  if (loading) {
    return (
      <CenteredWrapper>
        <Spin
          tip="Retrieving your analyses..."
          size="large"
          style={{ marginTop: "25vh" }}
        />
      </CenteredWrapper>
    );
  }

  if (error) {
    return (
      <CenteredWrapper>
        <Alert
          message="An error occurred"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: "25vh" }}
        />
      </CenteredWrapper>
    );
  }

  if (analyses.length === 0) {
    return (
      <CenteredWrapper>
        <Empty description={false} style={{ marginTop: "15vh" }} />
        <Title style={{ marginTop: 15 }}>No analysis to display</Title>
        <Link to="/record">
          <Button type="primary" style={{ marginTop: 25 }}>
            Record a video
          </Button>
        </Link>
      </CenteredWrapper>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {analyses.map((analysis) => (
        <Card
          key={analysis._id}
          title={analysis.name}
          extra={
            analysis.state === AnalysisState.SUCCESS && (
              <Link to={`/analysis/${analysis._id}`} style={{ marginTop: 25 }}>
                Details
              </Link>
            )
          }
          style={{ width: 300, margin: 15 }}
        >
          {getContent(analysis.state)}
        </Card>
      ))}
    </div>
  );
};

export default DashboardContainer;
