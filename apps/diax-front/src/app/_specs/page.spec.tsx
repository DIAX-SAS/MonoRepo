import * as React from 'react';
import { render } from '@testing-library/react';
import { redirect } from "next/navigation";
import Page from "../page";

// Mock the redirect function
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Page component", () => {
  it("redirects to /dashboard", () => {
    render(<Page />);
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
