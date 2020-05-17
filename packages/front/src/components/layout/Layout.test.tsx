import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import Layout from "./Layout";
import { BrowserRouter } from "react-router-dom";

test("renders Layout correctly", () => {
  const content = "Hello World";
  const { getByText } = render(
    <BrowserRouter>
      <Layout>
        <p>{content}</p>
      </Layout>
    </BrowserRouter>
  );
  const title = getByText(content);
  expect(title).toBeInTheDocument();
});
