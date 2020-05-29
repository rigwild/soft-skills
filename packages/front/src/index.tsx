import "antd/dist/antd.css";
import { getProfile } from "api/profile";
import Layout from "components/layout";
import PrivateRoute from "components/route";
import Dashboard from "pages/dashboard";
import Home from "pages/home";
import Login from "pages/login";
import NoMatch from "pages/nomatch";
import Profile from "pages/profile";
import Record from "pages/record";
import Signup from "pages/signup";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    getProfile().then(() => setLoggedIn(true));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    <Router>
      <Layout loggedIn={loggedIn} logout={handleLogout}>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login login={handleLogin} />
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <PrivateRoute loggedIn={loggedIn} path="/record">
            <Record />
          </PrivateRoute>
          <PrivateRoute loggedIn={loggedIn} path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute loggedIn={loggedIn} path="/profile">
            <Profile />
          </PrivateRoute>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
