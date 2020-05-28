import {
  ExclamationCircleOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Modal, Typography } from "antd";
import React, { useState } from "react";

const WIDTH = 360;
const { confirm } = Modal;
const { Text, Title, Paragraph } = Typography;

const EditableLabel = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (str: string) => void;
  value: string;
}) => (
  <div style={{ display: "flex", flexDirection: "row", width: WIDTH }}>
    <Text strong>{label} :</Text>
    <Paragraph editable={{ onChange }} style={{ marginLeft: 15, width: "80%" }}>
      {value}
    </Paragraph>
  </div>
);

const Profile = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("example@test.com");

  const applyChanges = () => {
    console.log("Name : " + name);
    console.log("Email : " + email);
  };

  const showDeleteModal = () => {
    confirm({
      title: "Are you sure you want to delete your account ?",
      icon: <ExclamationCircleOutlined />,
      content: "This action can't be undone",
      style: { top: 330 },
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        console.log("Delete account and redirect to /, unlogged");
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Title>My account</Title>
      <Avatar size={100} style={{ marginBottom: 35 }} icon={<UserOutlined />} />
      <>
        <EditableLabel label="Name" onChange={setName} value={name} />
        <EditableLabel label="Email" onChange={setEmail} value={email} />
        <Button
          type="primary"
          onClick={applyChanges}
          style={{ width: WIDTH, marginTop: 15 }}
        >
          Apply changes
        </Button>
        <Button
          type="primary"
          danger
          onClick={showDeleteModal}
          icon={<UserDeleteOutlined />}
          style={{ width: WIDTH, marginTop: 15 }}
        >
          Delete profile
        </Button>
      </>
    </div>
  );
};

export default Profile;
