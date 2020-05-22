import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Tooltip } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { register } from "api/authentication";

const { Item } = Form;

const Inscription = () => {
  const [form] = Form.useForm(); // why use a hook here and not in the other ?

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    const { username, email, password } = values;
    register(username, email, password)
      .then((res) => console.log(res.data))
      .catch((error) => console.log(error));
  };
  return (
    <Form
      form={form}
      name="inscription"
      onFinish={onFinish}
      scrollToFirstError
      style={{ maxWidth: "500px", margin: "auto" }}
    >
      <Item
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
            message: "Veuiller spécifier un identifiant !",
            whitespace: true,
          },
        ]}
      >
        <Input />
      </Item>
      <Item
        name="email"
        label="adresse e-mail"
        rules={[
          {
            type: "email",
            message: "l'adresse e-mail n'est pas au bon format !",
          },
          {
            required: true,
            message: "Veuillez spécifier un email !",
          },
        ]}
      >
        <Input />
      </Item>
      <Item
        name="password"
        label="Mot de passe"
        rules={[
          {
            required: true,
            message: "Veuillez spécifier un mot de passe !",
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Item>

      <Item
        name="confirm"
        label="confirmation du mot de passe"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Veuillez spécifier la confirmation du mot de passe",
          },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }

              return Promise.reject(
                "Les deux mots de passe ne sont pas identiques !"
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Item>
      <Item>
        <Button type="primary" htmlType="submit">
          S'inscrire
        </Button>
        ou <Link to="/login">connectez vous !</Link>
      </Item>
    </Form>
  );
};

export default Inscription;
