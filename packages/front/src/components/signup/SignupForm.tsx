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
      name="name"
      label="Name"
      rules={[
        {
          required: true,
          message: "Please enter your name",
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
          message: "Enter a valid email address",
        },
        {
          required: true,
          message: "Enter an email address",
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
          min: 4,
          message: "Your password must be 4 characters minimum",
        },
        {
          required: true,
          message: "Enter a password",
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
          message: "Confirm your password",
        },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }

            return Promise.reject("Passwords do not match");
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
        Sign up
      </Button>
      or <Link to="/login">Log in</Link>
    </Item>
  </Form>
);

export default SignupForm;
