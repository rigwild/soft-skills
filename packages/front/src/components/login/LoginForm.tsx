import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { Store } from "antd/lib/form/interface";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  onFinish: (values: Store) => void;
  loading: boolean;
};

const { Item } = Form;

const LoginForm = (props: Props) => (
  <Form
    name="login"
    style={{ width: "300px" }}
    initialValues={{
      email: localStorage.getItem("email"),
      remember: true,
    }}
    onFinish={props.onFinish}
  >
    <Item
      name="email"
      rules={[
        {
          type: "email",
          message: "Please enter a valid email adress",
        },
        {
          required: true,
          message: "Please enter your email",
        },
      ]}
    >
      <Input prefix={<UserOutlined />} placeholder="Email" />
    </Item>
    <Item
      name="password"
      rules={[
        {
          required: true,
          message: "Please enter a password",
        },
      ]}
    >
      <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
    </Item>
    <Item>
      <Item name="remember" valuePropName="checked" noStyle>
        <Checkbox>Remember me</Checkbox>
      </Item>
    </Item>
    <Item>
      <Button
        type="primary"
        htmlType="submit"
        style={{
          width: "100%",
        }}
        disabled={props.loading}
      >
        Login
      </Button>
      or <Link to="/signup">Sign up</Link>
    </Item>
  </Form>
);

export default LoginForm;
