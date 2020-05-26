import { UserAddOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import SignupForm from "containers/signup";
import React from "react";

const { Title } = Typography;

const Signup = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Title>Signup</Title>
    <Avatar
      size={100}
      style={{ marginBottom: 35 }}
      icon={<UserAddOutlined />}
    />
    <SignupForm />
  </div>
);

export default Signup;
