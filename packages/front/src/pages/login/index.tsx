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
    console.log("Received values of form: ", values);
    const { username, password } = values;
    login(username, password).then((res) => {
      console.log(res.data);
      localStorage.setItem("token", res.data.token); // type answer
      console.log("token : " + localStorage.getItem("token"));
    });
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
            message: "Veuillez entrer un nom d'utilisateur !",
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
            message: "Veuillez entrer un mot de passe !",
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
          <Checkbox>Se souvenir de moi</Checkbox>
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
          Connection
        </Button>
        ou <Link to="/inscription">enregistrez vous !</Link>
      </Item>
    </Form>
  );
};

export default Login;
