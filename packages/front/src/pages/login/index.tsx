import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { login } from "api/authentication";

const { Item } = Form;

const Login = () => {
  // handle remember me
  // store token
  const onFinish = (values: any) => {
    if(values.remember) {
      localStorage.setItem("username", values.username);
      localStorage.setItem("password", values.password);
      console.log("username : " + localStorage.getItem("username"));
      console.log("password : " + localStorage.getItem("password"));
    }
    console.log("Received values of form: ", values);
    const { username, password } = values;
    login(username, password).then((res) => {
      console.log(res.data);
      localStorage.setItem("token", res.data.token); // type answer
      console.log("token : " + localStorage.getItem("token"));
    }).catch(error => console.log(error));
  };

  return (
    <Form
      name="login"
      style={{ maxWidth: "300px", margin: "auto" }}
      initialValues={{
        remember: true, // what does it do ?
      }}
      onFinish={onFinish}
    >
      <Item
        name="username"
        rules={[
          {
            required: true,
            message: "Please input an username !",
          },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Item>
      <Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input a password !",
          },
        ]}
      >
        <Input
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
        />
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
            width: " 100%",
          }}
        >
          Login
        </Button>
        or <Link to="/inscription">Register</Link>
      </Item>
    </Form>
  );
};

export default Login;
