import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../components/UserProfile";
import '@testing-library/jest-dom';


let mockIsAuthenticated = false;

jest.mock("@auth0/auth0-react", () => ({
    ...jest.requireActual("@auth0/auth0-react"),
    Auth0Provider: ({ children }) => children,
    useAuth0: () => {
        return {
            isLoading: false,
            user: {
                sub: "subId",
                email: "liz@gmail.com",
                email_verified: true,
            },
            isAuthenticated: mockIsAuthenticated,
            loginWithRedirect: jest.fn(),
        };
    },
}));

jest.mock("../AuthTokenContext", () => ({
    useAuthToken: () => {
      return { accessToken: "123" };
    },
  }));


jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useOutletContext: jest.fn().mockReturnValue("adb"),
}));

test("renders Profile", () => {
    render( 
      <MemoryRouter initialEntries = {["/"]} >
          <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText("📧 Email: liz@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("✅ Email Verified: true")).toBeInTheDocument();
    expect(screen.getByText("My Favorites (0)")).toBeInTheDocument();
    expect(screen.getByText("My Reviews (0)")).toBeInTheDocument();
});  