import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddExpense from "./AddExpense";
import "@testing-library/jest-dom";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the currencies
jest.mock("../../constants/currencies", () => ({
  currencies: [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "CAD", name: "Canadian Dollar" }
  ]
}));

// Mock the useAuth hook
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn()
}));

describe("AddExpense Component", () => {
  const mockHandleExpenses = jest.fn();
  const mockUserTrips = [
    { name_on_trip: "User1", uid: "test-user-id", trip_id: "123", member_on_same_trip: "member1", name_member_on_same_trip: "Member1" }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      currentUser: { uid: "test-user-id" }
    });
  });

  it("renders the add expense button", () => {
    render(<AddExpense handleExpenses={mockHandleExpenses} userTrips={mockUserTrips} />);
    expect(screen.getByText(/Add Expense/i)).toBeInTheDocument();
  });

  it("opens the modal when add expense button is clicked", async () => {
    render(<AddExpense handleExpenses={mockHandleExpenses} userTrips={mockUserTrips} />);
    fireEvent.click(screen.getByText(/Add Expense/i));
    await waitFor(() => {
      expect(screen.getByText(/Add New Expense/i)).toBeInTheDocument();
    });
  });

  it("allows user to enter expense details in first step", async () => {
    render(<AddExpense handleExpenses={mockHandleExpenses} userTrips={mockUserTrips} />);
    fireEvent.click(screen.getByText(/Add Expense/i));

    await waitFor(() => screen.getByRole("textbox", { name: /name/i }));

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    fireEvent.change(nameInput, { target: { value: "Dinner" } });
    expect(nameInput.value).toBe("Dinner");

    const amountInput = screen.getByRole("textbox", { name: /amount/i });
    fireEvent.change(amountInput, { target: { value: "50" } });
    expect(amountInput.value).toBe("50");

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-17" } });
    expect(dateInput.value).toBe("2025-03-17");
  });

  it("shows error messages when required fields are missing in first step", async () => {
    render(<AddExpense handleExpenses={mockHandleExpenses} userTrips={mockUserTrips} />);
    fireEvent.click(screen.getByText(/Add Expense/i));
    
    await waitFor(() => screen.getByText(/Next/i));
    fireEvent.click(screen.getByText(/Next/i));

    await waitFor(() => {
      expect(screen.getByText(/Enter your expense name/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter your expense date/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter the cost/i)).toBeInTheDocument();
      expect(screen.getByText(/Select the purchaser/i)).toBeInTheDocument();
      expect(screen.getByText(/Select the currency/i)).toBeInTheDocument();
      expect(screen.getByText(/Select the category/i)).toBeInTheDocument();
    });
  });

  it("proceeds to split step when all required fields are filled", async () => {
    render(<AddExpense handleExpenses={mockHandleExpenses} trip_id="123" userTrips={mockUserTrips} />);
    fireEvent.click(screen.getByText(/Add Expense/i));

    await waitFor(() => screen.getByRole("textbox", { name: /name/i }));

    // Fill in all required fields
    fireEvent.change(screen.getByRole("textbox", { name: /name/i }), { target: { value: "Dinner" } });
    fireEvent.change(screen.getByRole("textbox", { name: /amount/i }), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2025-03-17" } });

    fireEvent.click(screen.getByText(/Next/i));

    await waitFor(() => {
      expect(screen.queryByText(/Enter your expense name/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Add New Expense/i)).toBeInTheDocument();
    });
  });

  it("closes modal and resets when cancel is clicked", async () => {
    render(<AddExpense handleExpenses={mockHandleExpenses} userTrips={mockUserTrips} />);
    fireEvent.click(screen.getByText(/Add Expense/i));

    await waitFor(() => screen.getByText(/Cancel/i));
    fireEvent.click(screen.getByText(/Cancel/i));

    await waitFor(() => {
      expect(screen.queryByText(/Add New Expense/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add Expense/i));
    await waitFor(() => {
      const nameInput = screen.getByRole("textbox", { name: /name/i });
      expect(nameInput.value).toBe("");
    });
  });

  it('should alert the user when an unsupported file type is uploaded', async () => {
    // Mock global alert function
    global.alert = jest.fn();

    render(
      <Router>
        <AddExpense trip_id="123" handleExpenses={jest.fn()} />
      </Router>
    );

    // Trigger file upload for an unsupported file type
    const uploadButton = screen.getByText(/upload receipt/i);
    fireEvent.click(uploadButton);

    const fileInput = screen.getByTestId('receipt-upload');
    const unsupportedFile = new File(['dummy content'], 'sample-unsupported.txt', { type: 'text/plain' });

    // Trigger file change
    fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });

    // Check if the alert was triggered for unsupported file type
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please upload a valid file (PDF, JPG, PNG)');
    });
  });

  it('should alert when the file name is not the expected one', async () => {
    // Mock global alert function
    global.alert = jest.fn();

    render(
      <Router>
        <AddExpense trip_id="123" handleExpenses={jest.fn()} />
      </Router>
    );

    // Trigger file upload for a file that doesn't match the expected name
    const uploadButton = screen.getByText(/upload receipt/i);
    fireEvent.click(uploadButton);

    const fileInput = screen.getByTestId('receipt-upload');
    const fileWithUnexpectedName = new File(['dummy content'], 'unexpected-file.jpg', { type: 'image/jpeg' });

    // Trigger file change
    fireEvent.change(fileInput, { target: { files: [fileWithUnexpectedName] } });

    // Check if the alert was triggered for the unexpected file name
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Unable to parse file');
    });
  });
});