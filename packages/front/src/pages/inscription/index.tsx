import React from 'react';
import 'antd/dist/antd.css';
import {
  Form,
  Input,
  Tooltip,
  Checkbox,
  Button,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const Inscription = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    return fetch("http://localhost:3100/register", {
      method: 'POST',
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       },
      body: JSON.stringify({
        username: values.username,
        name: values.email,
        password: values.password

      })
    })
    .then(res => res.text()) 
    .then(answer => console.log(answer));
  };
  return (
    <Form
      {...formItemLayout}
      form={form}
      name="inscription"
      onFinish={onFinish}
      scrollToFirstError
    >
      <Form.Item
        name="email"
        label="adresse e-mail"
        rules={[
          {
            type: 'email',
            message: 'l\'adresse e-mail n\'est pas au bon format !',
          },
          {
            required: true,
            message: 'Veuillez spécifier un email !',
          },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="username"
        label={
          <span>
            Identifiant&nbsp;
            <Tooltip title="l'identifiant utilisé pour vous connecter !">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        rules={[
          {
            required: true,
            message: 'Veuiller spécifier un identifiant !',
            whitespace: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mot de passe"
        rules={[
          {
            required: true,
            message: 'Veuillez spécifier un mot de passe !',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="confirmation du mot de passe"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Veuillez spécifier la confirmation du mot de passe',
          },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }

              return Promise.reject('Les deux mots de passe ne sont pas identiques !');
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('Veuillez accepter les conditions générales d\'utilisation !'),
          },
        ]}
        {...tailFormItemLayout}
      >
        <Checkbox>
          J'ai lu et j'accepte les <a href="">conditions générales d'utilisation</a>
        </Checkbox>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          S'inscrire
        </Button>
      
         ou <a href="../login/index.tsx">connectez vous !</a>
      </Form.Item>
    </Form>
  );
};

export default Inscription;
