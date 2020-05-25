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

const Record = (props: Props) => {
  const history = useHistory();
  const [error, setError] = useState<string | undefined>(undefined);

  const handleLogin = (values: Store) => {
    setError(undefined);
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
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoginForm onFinish={handleLogin} />
      {error && <Alert message={error} type="error" showIcon />}
    </div>
  );
};

export default Record;
