import { Card, Spin, Alert, Typography, Button } from "antd";
import { getUploads } from "api/upload";
import CenteredWrapper from "components/centeredwrapper";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  console.log(data);

  useEffect(() => {
    setLoading(true);
    getUploads()
      .then((res) => setData(res.data.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const getContent = (state: string) => {
    if (state === "error") {
      return <Alert message="Analysis state : error" type="error" showIcon />;
    }
    if (state === "pending") {
      return (
        <Alert message="Analysis state : pending" type="warning" showIcon />
      );
    }
    if (state === "finished") {
      return (
        <Alert message="Analysis state : finished" type="success" showIcon />
      );
    }
  };

  if (loading) {
    return (
      <CenteredWrapper>
        <Spin
          tip="Retrieving your videos..."
          size="large"
          style={{ marginTop: "25vh" }}
        />
      </CenteredWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <CenteredWrapper>
        <Title style={{ marginTop: "25vh" }}>No analysis to display</Title>
        <Link to="/record">
          <Button type="primary" style={{ marginTop: 15 }}>
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
