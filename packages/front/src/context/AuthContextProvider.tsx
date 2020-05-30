import { getProfile } from "api/profile";
import React, { createContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

export const AuthContext = createContext({
  loggedIn: false,
  verifyingCredentials: true,
  login: () => {},
  logout: () => {},
});

type Props = { children: JSX.Element | JSX.Element[] };

export const AuthContextProvider = (props: Props) => {
  const history = useHistory();
  const [loggedIn, setLoggedIn] = useState(false);
  const [verifyingCredentials, setVerifyingCredentials] = useState(true);

  useEffect(() => {
    getProfile()
      .then(() => {
        setLoggedIn(true);
      })
      .finally(() => setVerifyingCredentials(false));
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    history.push("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    history.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        verifyingCredentials,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
