import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Tooltip } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { register } from "api/authentication";
import { Store } from "antd/lib/form/interface";
import { Rule } from "antd/lib/form";

const { Item } = Form;

const Inscription = () => {
  //const [form] = Form.useForm(); // why use a hook here and not in the other ?
  const onFinish = (values: Store) => {
    console.log("Received values of form: ", values);
    const { username, email, password } = values;
    register(username, email, password)
      .then((res) => console.log(res.data))
      .catch((error) => console.log(error));
  };
  return (
    <Form
      //form={form}
      name="inscription"
      onFinish={onFinish}
      style={{ maxWidth: "500px", margin: "auto" }}
    >
      <Item
        name="username"
        label={
          <span>
            Username&nbsp;
            <Tooltip title="The username used to connect to your account !">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        rules={[
          {
            required: true,
            message: "Please specify an username !",
            whitespace: true,
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
            message: "Please input a valid email adress !",
          },
          {
            required: true,
            message: "Please specify an email adress !",
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
            message: "Please specify a password !",
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
            message: "Please retype your password !",
          },
          ({ getFieldValue } : any) => ({
            validator(rule, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }

              return Promise.reject(
                "The password are not the same !"
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Item>
      <Item>
        <Button type="primary" htmlType="submit">
          Register
        </Button>
        or <Link to="/login">login</Link>
      </Item>
    </Form>
  );
};

export default Inscription;
