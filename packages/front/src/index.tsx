import "antd/dist/antd.css";
import Layout from "components/layout";
import PrivateRoute from "components/route";
import { AuthContextProvider } from "context";
import Dashboard from "pages/dashboard";
import Home from "pages/home";
import Login from "pages/login";
import NoMatch from "pages/nomatch";
import Profile from "pages/profile";
import Record from "pages/record";
import Signup from "pages/signup";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const App = () => (
  <Router>
    <AuthContextProvider>
      <Layout>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <PrivateRoute path="/record">
            <Record />
          </PrivateRoute>
          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute path="/profile">
            <Profile />
          </PrivateRoute>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Layout>
    </AuthContextProvider>
  </Router>
);

ReactDOM.render(<App />, document.getElementById("root"));
