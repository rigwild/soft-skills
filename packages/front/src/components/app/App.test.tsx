import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import App from "./App";

// can be used for :
// - unit test
// - end to end test
// - mocking api response

test("renders app title", () => {
  const { getByText } = render(<App />);
  const appTitle = getByText("Soft skills");
  expect(appTitle).toBeInTheDocument();
});
