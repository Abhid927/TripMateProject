import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAuth } from "../../context/AuthContext";
import callApiSendInvite from "./callApiSendInvite";
import TripInvite from "./TripInvite";

// Mock the authentication hook to always return a user
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock the API call function
jest.mock("./callApiSendInvite");

describe("TripInvite Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { uid: "testUser123" } });
  });

  test("renders component correctly", () => {
    render(<TripInvite tripID={1} />);
    expect(screen.getByText("Invite a Friend to Your Trip")).toBeInTheDocument();
    expect(screen.getByText("Or Generate a Shareable Link")).toBeInTheDocument();
  });

  test("updates email input when user types", () => {
    render(<TripInvite tripID={1} />);
    const emailInput = screen.getByLabelText("Enter email address");

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    expect(emailInput.value).toBe("testuser@example.com");
  });

  test("calls API and shows success message when invite is sent", async () => {
    callApiSendInvite.mockResolvedValueOnce({ message: "Invitation sent successfully!" });

    render(<TripInvite tripID={1} />);
    const emailInput = screen.getByLabelText("Enter email address");
    const sendButton = screen.getByText("Send Invite");

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(callApiSendInvite).toHaveBeenCalledWith(1, "testUser123", "testuser@example.com");
      expect(screen.getByText("Invitation sent successfully!")).toBeInTheDocument();
    });
  });

  test("displays error message when invite has already been sent", async () => {
    callApiSendInvite.mockRejectedValueOnce(new Error("Invite has already been sent to this email."));

    render(<TripInvite tripID={1} />);
    const emailInput = screen.getByLabelText("Enter email address");
    const sendButton = screen.getByText("Send Invite");

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(callApiSendInvite).toHaveBeenCalled();
      expect(screen.getByText("Invite has already been sent to this email.")).toBeInTheDocument();
    });
  });

  test("calls API and displays shareable link", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ inviteLink: "http://localhost:3000/invite/testToken" }),
      })
    );

    render(<TripInvite tripID={1} />);
    const generateLinkButton = screen.getByText("Create Shareable Link");

    fireEvent.click(generateLinkButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/invite/link", expect.any(Object));
      expect(screen.getByDisplayValue("http://localhost:3000/invite/testToken")).toBeInTheDocument();
    });
  });
});