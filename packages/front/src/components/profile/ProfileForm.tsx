import {
  ExclamationCircleOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";
import { dateFormat } from "functions/date";
import React, { CSSProperties } from "react";

const WIDTH = 360;
const { Text, Paragraph } = Typography;
const { confirm } = Modal;

type Props = {
  name: string;
  email: string;
  joinDate: string;
  setName: (name: string) => void;
  editProfile: () => void;
  deleteProfile: () => void;
  disabled: boolean;
};

const labelContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  width: WIDTH,
};

const ProfileForm = (props: Props) => {
  const showDeleteModal = () => {
    confirm({
      title: "Are you sure you want to delete your account ?",
      icon: <ExclamationCircleOutlined />,
      content: "This action can't be undone",
      style: { top: 330 },
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: props.deleteProfile,
    });
  };

  return (
    <>
      <div style={labelContainerStyle}>
        <Text strong>Name:</Text>
        <Paragraph
          editable={!props.disabled && { onChange: props.setName }}
          style={{ marginLeft: 15, width: "80%" }}
        >
          {props.name}
        </Paragraph>
      </div>
      <div style={labelContainerStyle}>
        <Text strong>Email address:</Text>
        <Paragraph style={{ marginLeft: 15 }}>{props.email}</Paragraph>
      </div>
      <div style={labelContainerStyle}>
        <Text strong>Join date:</Text>
        <Paragraph style={{ marginLeft: 15 }}>
          {dateFormat(new Date(props.joinDate))}
        </Paragraph>
      </div>
      <Button
        type="primary"
        onClick={props.editProfile}
        style={{ width: WIDTH, marginTop: 15 }}
        disabled={props.disabled}
      >
        Apply changes
      </Button>
      <Button
        type="primary"
        danger
        onClick={showDeleteModal}
        icon={<UserDeleteOutlined />}
        style={{ width: WIDTH, marginTop: 15 }}
        disabled={props.disabled}
      >
        Delete profile
      </Button>
    </>
  );
};

export default ProfileForm;
