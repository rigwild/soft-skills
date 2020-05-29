import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import CenteredWrapper from "components/centeredwrapper";
import ProfileForm from "containers/profile";
import React from "react";

const { Title } = Typography;

const Profile = () => {
  return (
    <CenteredWrapper>
      <Title>My account</Title>
      <Avatar size={100} style={{ marginBottom: 35 }} icon={<UserOutlined />} />
      <ProfileForm />
    </CenteredWrapper>
  );
};

export default Profile;
