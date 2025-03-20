import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserPopover } from "../user-popover";
import { signOut } from "next-auth/react";


jest.mock("next-auth/react", () => ({
  useSession: jest.fn(()=> ({
    data: { user: { name: "John Doe", email: "john@example.com" } },
  })),
  signOut: jest.fn(),
}));

jest.mock("@/config", () => ({
  config: {
    auth: {
      cognitoDomain: "https://example-cognito.com",
      clientId: "mock-client-id",
      logoutUri: "https://example.com/logout",
      redirectUri: "https://example.com/redirect",
      response_type: "code",
    },
  },
}));

describe("UserPopover Component", () => {
  let setOpenMock: jest.Mock;

  beforeEach(() => {
    setOpenMock = jest.fn();
  });

  it("renders user information", () => {
    render(<UserPopover open={true} setOpen={setOpenMock} />);

    // Check if user name and email are displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("calls setOpen when closed", async () => {
    render(<UserPopover open={true} setOpen={setOpenMock} />);
  
    // Ensure popover is initially in the document
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  
    // Click outside the popover
    fireEvent.mouseDown(document.body);
  
    // Wait for state update
    await expect(setOpenMock).toHaveBeenCalledWith(false);
  });
  

  it("calls signOut and redirects on sign-out", async () => { 
    render(<UserPopover open={true} setOpen={setOpenMock} />);    
    // Click the sign-out button
    const signOutButton = screen.getByText("Sign out");
    fireEvent.click(signOutButton);
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ redirect: false }));
  });
});
