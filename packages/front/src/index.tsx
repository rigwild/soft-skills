import "antd/dist/antd.css";
import Layout from "components/layout";
import Dashboard from "pages/dashboard";
import Home from "pages/home";
import Login from "pages/login";
import Record from "pages/record";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const App = () => (
  <Router>
    <Layout>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/record">
          <Record />
        </Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
      </Switch>
    </Layout>
  </Router>
);

ReactDOM.render(<App />, document.getElementById("root"));
