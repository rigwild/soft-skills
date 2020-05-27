import { Alert } from "antd";
import { Store } from "antd/lib/form/interface";
import { login } from "api/authentication";
import { AxiosError, AxiosResponse } from "axios";
import LoginForm from "components/login";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

type Props = {
  login: () => void;
};

type LoginError = {
  message: string;
};

type LoginResponse = {
  data: { token: string };
};

const LoginContainer = (props: Props) => {
  const history = useHistory();
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

    login(email, password)
      .then((res: AxiosResponse<LoginResponse>) => {
        const { data } = res.data;
        localStorage.setItem("token", data.token);
        props.login();
        history.push("/");
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
