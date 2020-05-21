import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import React from "react";
import { Link } from "react-router-dom";

const { Item } = Form;

const Login = () => {
  // use axios
  // move api call
  // handle remember me
  // store token
  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    //launching fetch request
    return fetch("http://localhost:3100/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    })
      .then((res) => res.json())
      .then((obj) => {
        //check if we can save token in local storage and retrieve it
        console.log(obj);
        console.log("saving token");
        localStorage.setItem("token", obj.data.token);
        console.log("fetching token");
        console.log("token : " + localStorage.getItem("token"));
      });
  };

  return (
    <Form
      name="normal_login"
      style={{ maxWidth: "300px", margin: "auto" }}
      initialValues={{
        remember: true,
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
