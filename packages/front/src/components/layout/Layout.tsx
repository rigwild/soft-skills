import {
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Button, Layout as AntLayout, Menu } from "antd";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const { Header, Content, Footer } = AntLayout;

type Props = {
  loggedIn: boolean;
  logout: () => void;
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
          <Link to="/">
            <h1
              style={{
                color: "white",
                width: "120x",
                height: "53px",
              }}
            >
              Soft skills
            </h1>
          </Link>
        </div>
        {props.loggedIn ? (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
          >
            <Menu.Item key="/record">
              <Link to="/record">Record</Link>
            </Menu.Item>
            <Menu.Item key="/dashboard">
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item style={{ position: "absolute", right: "30px" }}>
              <Link to="/">
                <Button
                  type="primary"
                  danger
                  onClick={() => props.logout()}
                  icon={<LogoutOutlined />}
                >
                  Log out
                </Button>
              </Link>
            </Menu.Item>
          </Menu>
        ) : (
          <Menu theme="dark" mode="horizontal" selectable={false}>
            <Menu.Item style={{ position: "absolute", right: "30px" }}>
              <Link to="/login">
                <Button type="primary" icon={<LoginOutlined />}>
                  Log in
                </Button>
              </Link>
            </Menu.Item>
            <Menu.Item style={{ position: "absolute", right: "170px" }}>
              <Link to="/signup">
                <Button icon={<UserAddOutlined />}>Sign up</Button>
              </Link>
            </Menu.Item>
          </Menu>
        )}
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
