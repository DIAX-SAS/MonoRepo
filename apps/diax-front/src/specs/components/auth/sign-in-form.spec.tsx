import '@testing-library/jest-dom'; 
import { render, screen, fireEvent } from "@testing-library/react";
import { SignInForm } from "../../../components/auth/sign-in-form"; // Adjust path if needed
import { signIn } from "next-auth/react";

// Mock signIn function from next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("SignInForm Component", () => {
  it("renders the sign-in button", () => {
    render(<SignInForm />);
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it("calls signIn when the button is clicked", () => {
    render(<SignInForm />);
    const button = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(button);
    expect(signIn).toHaveBeenCalledTimes(1);
  });
});
