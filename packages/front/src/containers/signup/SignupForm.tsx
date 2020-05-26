import { UserAddOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Result, Typography } from "antd";
import { Store } from "antd/lib/form/interface";
import { register } from "api/authentication";
import { AxiosError, AxiosResponse } from "axios";
import SignupForm from "components/signup";
import React, { useState } from "react";
import { Link } from "react-router-dom";

type SignupError = {
  message: string;
};

type SignupResponse = {
  data: AccountData;
};

type AccountData = {
  email: string;
  name: string;
};

const { Title } = Typography;

const SignupContainer = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<AccountData | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSignup = (values: Store) => {
    setError(undefined);
    setLoading(true);
    const { name, email, password } = values;

    register(name, email, password)
      .then((res: AxiosResponse<SignupResponse>) => {
        const { data } = res.data;
        setSuccess(data);
      })
      .catch((error: AxiosError<SignupError>) => {
        setError(error.response?.data.message);
        setLoading(false);
      });
  };

  return success ? (
    <Result
      status="success"
      title="Your account has been successfully created"
      subTitle={
        <>
          <p>Name : {success.name}</p>
          <p>Email : {success.email}</p>
        </>
      }
      extra={[
        <Link to="/login" key="login">
          <Button type="primary">Login</Button>
        </Link>,
      ]}
    />
  ) : (
    <>
      <Title>Signup</Title>
      <Avatar
        size={100}
        style={{ marginBottom: 35 }}
        icon={<UserAddOutlined />}
      />
      <SignupForm onFinish={handleSignup} loading={loading} />
      {error && <Alert message={error} type="error" showIcon />}
    </>
  );
};

export default SignupContainer;
