import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Login from "./LoginForm";
import "@testing-library/jest-dom";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Login Component", () => {
  let loginMock;

  beforeEach(() => {
    loginMock = jest.fn();
    useAuth.mockReturnValue({ login: loginMock });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  test("renders login form correctly", () => {
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
  
    expect(screen.getByText(/need an account\?/i)).toBeInTheDocument();
  });

  test("displays error message if login fails", async () => {
    loginMock.mockRejectedValue(new Error("Failed to log in"));

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to log in/i)).toBeInTheDocument();
    });
  });

  test("calls login function with correct email and password", async () => {
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  test("disables button when login is in progress", async () => {
    loginMock.mockImplementation(() => new Promise(() => {})); // Simulate pending request

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
    });
  });

  test("renders forgot password and sign-up links", () => {
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });
});