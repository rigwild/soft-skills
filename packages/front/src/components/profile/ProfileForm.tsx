import { UserDeleteOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import React, { CSSProperties } from "react";

const WIDTH = 360;
const { Text, Paragraph } = Typography;

type Props = {
  name: string;
  email: string;
  joinDate: string;
  setName: (name: string) => void;
  editProfile: () => void;
  showDeleteModal: () => void;
};

const labelContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  width: WIDTH,
};

const ProfileForm = (props: Props) => (
  <>
    <div style={labelContainerStyle}>
      <Text strong>Name :</Text>
      <Paragraph
        editable={{ onChange: props.setName }}
        style={{ marginLeft: 15, width: "80%" }}
      >
        {props.name}
      </Paragraph>
    </div>
    <div style={labelContainerStyle}>
      <Text strong>Email address :</Text>
      <Paragraph style={{ marginLeft: 15 }}>{props.email}</Paragraph>
    </div>
    <div style={labelContainerStyle}>
      <Text strong>Join date :</Text>
      <Paragraph style={{ marginLeft: 15 }}>
        {new Date(props.joinDate).toLocaleDateString()}
      </Paragraph>
    </div>
    <Button
      type="primary"
      onClick={props.editProfile}
      style={{ width: WIDTH, marginTop: 15 }}
    >
      Apply changes
    </Button>
    <Button
      type="primary"
      danger
      onClick={props.showDeleteModal}
      icon={<UserDeleteOutlined />}
      style={{ width: WIDTH, marginTop: 15 }}
    >
      Delete profile
    </Button>
  </>
);

export default ProfileForm;
