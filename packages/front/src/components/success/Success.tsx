import { Button, Result } from "antd";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle: string;
  buttonText: string;
  linkTo: string;
};

const Success = (props: Props) => (
  <Result
    status="success"
    title={props.title}
    subTitle={<p style={{ marginTop: 10 }}>{props.subtitle}</p>}
    extra={[
      <Link to={`/${props.linkTo}`} key={props.linkTo}>
        <Button type="primary">{props.buttonText}</Button>
      </Link>,
    ]}
  />
);

export default Success;
