import { Spin } from "antd";
import CenteredWrapper from "components/centeredwrapper";
import React from "react";
import { Redirect, Route } from "react-router-dom";

type Props = {
  loading: boolean;
  loggedIn: boolean;
  children: JSX.Element | JSX.Element[];
  [x: string]: any;
};

const PrivateRoute = ({ loading, loggedIn, children, ...rest }: Props) => (
  <Route
    {...rest}
    render={() => {
      if (loading) {
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

export default PrivateRoute;
