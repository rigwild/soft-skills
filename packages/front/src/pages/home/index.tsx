import {
  CloudSyncOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  LoginOutlined,
  UserAddOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import { Button, Card, Typography } from "antd";
import CenteredWrapper from "components/centeredwrapper";
import { AuthContext } from "context";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const cards = [
  {
    cover: (
      <VideoCameraAddOutlined style={{ fontSize: 110, color: "#f04134" }} />
    ),
    title: "Record a video",
    description:
      "Record yourself with your webcam when practicing public speaking.",
    style: {},
  },
  {
    cover: (
      <CloudSyncOutlined
        style={{
          fontSize: 110,
          color: "#ffbf00",
        }}
      />
    ),
    title: "Analyse",
    description:
      "We analyse your recording and highlight some important data that will help you progress.",
    style: {
      marginLeft: "13vw",
      marginRight: "13vw",
    },
  },
  {
    cover: <LineChartOutlined style={{ fontSize: 110, color: "#00a854" }} />,
    title: "View the results",
    description:
      "Easily understand our analysis with meaningful charts and statistics.",
    style: {},
  },
];

const Home = () => {
  const { loggedIn } = useContext(AuthContext);
  return (
    <CenteredWrapper>
      <Title>Soft skills</Title>
      <Title level={3} style={{ marginBottom: 110 }}>
        Practice speaking in your browser!
      </Title>
      <CenteredWrapper row wrap>
        <>
          {cards.map((card) => (
            <Card
              key={card.title}
              bordered={false}
              cover={card.cover}
              style={card.style}
            >
              <Card.Meta
                title={<Title level={2} style={{ textAlign: "center" }}>{card.title}</Title>}
                description={
                  <div style={{ width: 250, textAlign: "center" }}>
                    <Text style={{ fontSize: 18 }}>{card.description}</Text>
                  </div>
                }
              />
            </Card>
          ))}
        </>
      </CenteredWrapper>
      <Title level={3} style={{ marginTop: 100 }}>
        Start now!
      </Title>
      <CenteredWrapper row wrap>
        {loggedIn ? (
          <Link to="/record">
            <Button danger icon={<VideoCameraAddOutlined />} size="large">
              Record a video
            </Button>
          </Link>
        ) : (
          <Link to="/signup">
            <Button icon={<UserAddOutlined />} size="large">
              Sign up
            </Button>
          </Link>
        )}
        <Text style={{ fontSize: 24, marginLeft: 25, marginRight: 25 }}>
          or
        </Text>
        {loggedIn ? (
          <Link to="/dashboard">
            <Button type="primary" icon={<ExperimentOutlined />} size="large">
              Go to dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />} size="large">
              Log in
            </Button>
          </Link>
        )}
      </CenteredWrapper>
    </CenteredWrapper>
  );
};

export default Home;
