import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import CustomComponent from "./CustomComponent";

// can be used for :
// - unit test
// - end to end test
// - mocking api response

test("renders CustomComponent correctly", () => {
  const testTitle = "Soft skills";
  const { getByText } = render(<CustomComponent title={testTitle} />);
  const title = getByText(testTitle);
  expect(title).toBeInTheDocument();
});
