import React from "react";
import { Redirect, Route } from "react-router-dom";

type Props = {
  loggedIn: boolean;
  children: JSX.Element | JSX.Element[];
  [x: string]: any;
};

const PrivateRoute = ({ loggedIn, children, ...rest }: Props) => (
  <Route
    {...rest}
    render={() =>
      loggedIn ? (
        children
      ) : (
        <Redirect
          to={{
            pathname: "/login",
          }}
        />
      )
    }
  />
);

export default PrivateRoute;
