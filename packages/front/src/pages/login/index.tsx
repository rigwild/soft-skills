import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import LoginForm from "containers/login";
import React from "react";

type Props = {
  login: () => void;
};

const { Title } = Typography;

const Login = (props: Props) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Title>Log in</Title>
    <Avatar size={100} style={{ marginBottom: 35 }} icon={<UserOutlined />} />
    <LoginForm login={props.login} />
  </div>
);

export default Login;
