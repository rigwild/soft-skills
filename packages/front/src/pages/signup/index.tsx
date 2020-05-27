import SignupForm from "containers/signup";
import React from "react";

const Signup = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <SignupForm />
  </div>
);

export default Signup;
