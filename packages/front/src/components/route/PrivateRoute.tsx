import { Spin } from "antd";
import CenteredWrapper from "components/centeredwrapper";
import { AuthContext } from "context";
import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";

type Props = {
  children: JSX.Element | JSX.Element[];
  [x: string]: any;
};

const PrivateRoute = ({ children, ...rest }: Props) => {
  const { verifyingCredentials, loggedIn } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={() => {
        if (verifyingCredentials) {
          return (
            <CenteredWrapper>
              <Spin
                tip="Verifying credentials..."
                size="large"
                style={{ marginTop: "25vh" }}
              />
            </CenteredWrapper>
          );
        } else {
          return loggedIn ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login",
              }}
            />
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
