import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import CenteredWrapper from "components/centeredwrapper";
import LoginForm from "containers/login";
import React from "react";

type Props = {
  login: () => void;
};

const { Title } = Typography;

const Login = (props: Props) => (
  <CenteredWrapper>
    <Title>Log in</Title>
    <Avatar size={100} style={{ marginBottom: 35 }} icon={<UserOutlined />} />
    <LoginForm login={props.login} />
  </CenteredWrapper>
);

export default Login;
