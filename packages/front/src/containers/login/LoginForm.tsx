import { Alert } from "antd";
import { Store } from "antd/lib/form/interface";
import { login as apiLogin } from "api/authentication";
import { AxiosError, AxiosResponse } from "axios";
import LoginForm from "components/login";
import { AuthContext } from "context";
import React, { useContext, useState } from "react";

type LoginError = {
  message: string;
};

type LoginResponse = {
  data: { token: string };
};

const LoginContainer = () => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleLogin = (values: Store) => {
    setError(undefined);
    setLoading(true);
    const { email, password, remember } = values;

    if (remember) {
      localStorage.setItem("email", values.email);
    } else {
      localStorage.removeItem("email");
    }

    apiLogin(email, password)
      .then((res: AxiosResponse<LoginResponse>) => {
        const { data } = res.data;
        localStorage.setItem("token", data.token);
        login();
      })
      .catch((error: AxiosError<LoginError>) => {
        setError(error.response?.data.message);
        setLoading(false);
      });
  };

  return (
    <>
      <LoginForm onFinish={handleLogin} loading={loading} />
      {error && <Alert message={error} type="error" showIcon />}
    </>
  );
};

export default LoginContainer;
