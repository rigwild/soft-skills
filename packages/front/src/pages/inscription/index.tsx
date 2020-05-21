import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Tooltip } from "antd";
import React from "react";

const { Item } = Form;

const Inscription = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    return fetch("http://localhost:3100/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: values.username,
        name: values.email,
        password: values.password,
      }),
    })
      .then((res) => res.text())
      .then((answer) => console.log(answer));
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

      <Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(
                    "Veuillez accepter les conditions générales d'utilisation !"
                  ),
          },
        ]}
      >
        <Checkbox>
          J'ai lu et j'accepte les{" "}
          <a href="">conditions générales d'utilisation</a>
        </Checkbox>
      </Item>
      <Item>
        <Button type="primary" htmlType="submit">
          S'inscrire
        </Button>
        ou <a href="../login/index.tsx">connectez vous !</a>
      </Item>
    </Form>
  );
};

export default Inscription;
