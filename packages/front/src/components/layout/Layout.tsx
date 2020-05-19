import { Layout as AntLayout, Menu } from "antd";
import React from "react";
import { Link } from "react-router-dom";

const { Header, Content, Footer } = AntLayout;

type Props = {
  children: JSX.Element | JSX.Element[];
};

const Layout = (props: Props) => (
  <AntLayout style={{ height: "100vh" }}>
    <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
      <div
        className="logo"
        style={{
          width: "120px",
          height: "31px",
          background: "rgba(255, 255, 255, 0.2)",
          margin: "16px 24px 16px 0",
          float: "left",
        }}
      />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1">
          <Link to="/">Accueil </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/login">Connection</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/record">Enregistrement</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/dashboard">Tableau de bord</Link>
        </Menu.Item>
        <Menu.Item key="5">
          <Link to="/inscription">Inscription</Link>
        </Menu.Item>
      </Menu>
    </Header>
    <Content style={{ padding: "0 50px", marginTop: 100 }}>
      <div style={{ padding: 24, minHeight: "100%", backgroundColor: "white" }}>
        {props.children}
      </div>
    </Content>
    <Footer style={{ textAlign: "center" }}>
      Soft Skills © 2020 Created by Isuru Haupe, Maxime Gratens, rigwild,
      Thomas Audo, Adrien Mazet
    </Footer>
  </AntLayout>
);

export default Layout;
