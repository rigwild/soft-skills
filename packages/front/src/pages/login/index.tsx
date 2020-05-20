import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    //launching fetch request
    return fetch("http://localhost:3100/login", {
      method: 'POST',
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       },
      body: JSON.stringify({
        username: values.username,
        password: values.password
      })
    })
    .then(res => res.json()) 
    .then(obj => {
      //check if we can save token in local storage and retrieve it
      console.log(obj);
      console.log("saving token");
      localStorage.setItem('token', obj.data.token);
      console.log("fetching token");
      console.log("token : " + localStorage.getItem('token'));
    });
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: 'Veuillez entrer un nom d\'utilisateur !',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Veuillez entrer un mot de passe !',
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Se souvenir de moi</Checkbox>
        </Form.Item>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Connection
        </Button>
        ou <a href="../inscription/index.tsx">enregistrez vous !</a>
      </Form.Item>
    </Form>
  );
};

export default Login;