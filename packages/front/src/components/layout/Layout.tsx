import { Layout as AntLayout, Menu } from "antd";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const { Header, Content, Footer } = AntLayout;

type Props = {
  children: JSX.Element | JSX.Element[];
};

const Layout = (props: Props) => {
  const location = useLocation();
  return (
    <AntLayout style={{ height: "100vh" }}>
      <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
        <div
          style={{
            marginRight: "60px",
            float: "left",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              color: "white",
              width: "120x",
              height: "53px",
            }}
          >
            Soft skills
          </h1>
        </div>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
          <Menu.Item key="/">
            <Link to="/">Accueil </Link>
          </Menu.Item>
          <Menu.Item key="/login">
            <Link to="/login">Connection</Link>
          </Menu.Item>
          <Menu.Item key="/record">
            <Link to="/record">Enregistrement</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard">
            <Link to="/dashboard">Tableau de bord</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px", marginTop: 100 }}>
        <div
          style={{ padding: 24, minHeight: "100%", backgroundColor: "white" }}
        >
          {props.children}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Soft Skills © 2020 Created by Isuru Haupe, Maxime Gratens, rigwild,
        Thomas Audo, Adrien Mazet
      </Footer>
    </AntLayout>
  );
};

export default Layout;
