import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import CenteredWrapper from "components/centeredwrapper";
import LoginForm from "containers/login";
import React from "react";

const { Title } = Typography;

const Login = () => (
  <CenteredWrapper>
    <Title>Log in</Title>
    <Avatar size={100} style={{ marginBottom: 35 }} icon={<UserOutlined />} />
    <LoginForm />
  </CenteredWrapper>
);

export default Login;
