import { Button, Form, Input } from "antd";
import { Store } from "antd/lib/form/interface";
import React from "react";
import { Link } from "react-router-dom";

const { Item } = Form;

type Props = {
  onFinish: (values: Store) => void;
  loading: boolean;
};

const SignupForm = (props: Props) => (
  <Form name="signup" onFinish={props.onFinish} size="large">
    <Item
      name="username"
      label="Username"
      rules={[
        {
          required: true,
          message: "Please enter your username",
        },
      ]}
    >
      <Input />
    </Item>
    <Item
      name="email"
      label="Email adress"
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
      <Input />
    </Item>
    <Item
      name="password"
      label="Password"
      rules={[
        {
          required: true,
          message: "Please enter a password",
        },
        {
          min: 4,
          message: "Please enter a password with more than 4 characters",
        },
      ]}
      hasFeedback
    >
      <Input.Password />
    </Item>

    <Item
      name="confirm"
      label="Password confirmation"
      dependencies={["password"]}
      hasFeedback
      rules={[
        {
          required: true,
          message: "Please confirm your password",
        },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }

            return Promise.reject("Passwords are different");
          },
        }),
      ]}
    >
      <Input.Password />
    </Item>
    <Item>
      <Button
        type="primary"
        htmlType="submit"
        disabled={props.loading}
        style={{
          width: "100%",
          marginTop: 15,
        }}
      >
        Register
      </Button>
      or <Link to="/login">Login</Link>
    </Item>
  </Form>
);

export default SignupForm;
