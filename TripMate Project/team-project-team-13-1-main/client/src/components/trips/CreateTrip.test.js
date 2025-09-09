import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateTrip from '../trips/CreateTrip';
import { MemoryRouter } from "react-router-dom";
import "whatwg-fetch";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ signInWithEmailAndPassword: jest.fn() })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ currentUser: { uid: "user123" } }),
}));

describe("CreateTrip Component", () => {
  it("renders the CreateTrip component without crashing", () => {
    render(
      <MemoryRouter>
        <CreateTrip />
      </MemoryRouter>
    );

    expect(screen.getByText(/Create a New Trip/i)).toBeInTheDocument();
  });

  it("displays all input fields and the submit button", () => {
    render(
      <MemoryRouter>
        <CreateTrip />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Trip Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destination/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Trip/i)).toBeInTheDocument();
  });

  it("shows an alert if the end date is before the start date", () => {
    window.alert = jest.fn();
    render(
      <MemoryRouter>
        <CreateTrip />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/Trip Name/i), { target: { value: "Trip to NYC" } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: "2025-12-10" } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: "2025-12-05" } });
    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: "New York" } });
    
    fireEvent.click(screen.getByText(/Create Trip/i));
    expect(window.alert).toHaveBeenCalledWith("End date cannot be earlier than start date.");
  });

  it("successfully submits the form when all fields are valid", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Trip saved successfully!" }),
      })
    );

    render(
      <MemoryRouter>
        <CreateTrip />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Trip Name/i), { target: { value: "Trip to NYC" } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: "2025-12-10" } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: "2025-12-15" } });
    fireEvent.change(screen.getByLabelText(/Destination/i), { target: { value: "New York" } });
    
    fireEvent.click(screen.getByText(/Create Trip/i));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  });
});

