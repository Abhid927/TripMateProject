import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ViewExpense from "./ViewExpense";
import { useAuth } from "../../context/AuthContext";
import { currencies } from "../../constants/currencies";
import "@testing-library/jest-dom";


jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("ViewExpense Component", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      currentUser: { uid: "user1" },
    });
  });

  const mockProps = {
    open: true,
    handleClose: jest.fn(),
    edit: false,
    setEdit: jest.fn(),
    setView: jest.fn(),
    setOpen: jest.fn(),
    viewExpense: {
      exp_name: "Dinner",
      exp_amount: "50",
      currency_id: "USD",
      u_id: "user1",
      exp_category: "Food",
      exp_date: "2024-03-01",
      exp_id: 1,
    },
    userTrips: [{ name_on_trip: "John Doe" }],
  };

  test("renders ViewExpense modal with expense details", () => {
    render(<ViewExpense {...mockProps} />);
    expect(screen.getByText(/View Expense/i)).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("$50 USD")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  test("calls setEdit when Edit button is clicked", () => {
    render(<ViewExpense {...mockProps} />);
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);
    expect(mockProps.setEdit).toHaveBeenCalledWith(true);
  });

  test("calls handleClose when Close button is clicked", () => {
    render(<ViewExpense {...mockProps} />);
    const closeButton = screen.getAllByText("Close")[0];
    fireEvent.click(closeButton);
    expect(mockProps.handleClose).toHaveBeenCalled();
  });

  test("renders edit fields when edit mode is enabled", () => {
    render(<ViewExpense {...mockProps} edit={true} />);
    expect(screen.getByLabelText("Name"));
    expect(screen.getByLabelText("Amount"));
  });

  test("calls handleSaveChanges when Save Changes is clicked", async () => {
    const mockSaveChanges = jest.fn();
    render(<ViewExpense {...mockProps} edit={true} />);
    const saveButton = screen.getByText("Save Changes");
    fireEvent.click(saveButton);
    await waitFor(() => expect(mockProps.setEdit).toHaveBeenCalledWith(false));
  });
});
