import { Card, Spin, Alert, Typography, Button, Empty } from "antd";
import { getUploads } from "api/upload";
import CenteredWrapper from "components/centeredwrapper";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const { Title } = Typography;

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

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Analysis[]>([]);

  useEffect(() => {
    setLoading(true);
    getUploads()
      .then((res) => setData(res.data.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

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
          tip="Retrieving your analysis..."
          size="large"
          style={{ marginTop: "25vh" }}
        />
      </CenteredWrapper>
    );
  }

  if (data.length === 0) {
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
      {data.map((analysis) => (
        <Card
          key={analysis._id}
          title={analysis.name}
          extra={
            <Link to={`/analysis/${analysis._id}`} style={{ marginTop: 25 }}>
              Analysis
            </Link>
          }
          style={{ width: 300, margin: 15 }}
        >
          {getContent(analysis.state)}
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
