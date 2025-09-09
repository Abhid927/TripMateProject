import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ManageBudgets from "./ManageBudgets";
import { AuthProvider } from "../../context/AuthContext";
import userEvent from "@testing-library/user-event";

global.fetch = jest.fn((url) => {
  if (url === "/api/getUserTrips") {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          trips: [{ id: "1", trip_name: "Trip 1" }, { id: "2", trip_name: "Trip 2" }],
        }),
    });
  }
  if (url === "/api/setCategoryBudgets") {
    return Promise.resolve({
      json: () => Promise.resolve({ message: "Budget set successfully" }),
    });
  }
  return Promise.reject(new Error("Unknown API call"));
});

describe("ManageBudgets Component", () => {
  beforeEach(() => {
    fetch.mockClear(); 
  });

  test("Renders ManageBudgets component correctly", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <ManageBudgets />
          </MemoryRouter>
        </AuthProvider>
      );
    });

    expect(await screen.findByText(/Manage Budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();
  });

  test("Updates the input fields correctly", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <ManageBudgets />
          </MemoryRouter>
        </AuthProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/Total Budget/i), { target: { value: "500" } });
    expect(screen.getByLabelText(/Total Budget/i).value).toBe("500");
  });

  test("When category budgets exceed total budget it displays the correct error", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <ManageBudgets />
          </MemoryRouter>
        </AuthProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/Total Budget/i), { target: { value: "500" } });

    fireEvent.change(screen.getByLabelText(/Food Budget/i), { target: { value: "300" } });
    fireEvent.change(screen.getByLabelText(/Transport Budget/i), { target: { value: "300" } });

    const submitButton = await screen.findByRole("button", { name: /Set Category Budgets/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Total allocated category budgets exceed the total budget/i)).toBeInTheDocument();
    });
  });

  test("When budget input is negative, it displays the correct error", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <ManageBudgets />
          </MemoryRouter>
        </AuthProvider>
      );
    });

    fireEvent.change(screen.getByLabelText(/Total Budget/i), { target: { value: "500" } });

    fireEvent.change(screen.getByLabelText(/Food Budget/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/Food Budget/i), { target: { value: "-50" } });


    const submitButton = await screen.findByRole("button", { name: /Set Category Budgets/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });


    await waitFor(() => {
      expect(screen.getByText(/Failed to update category budgets/i)).toBeInTheDocument();
    });
  });

  test("If entered a character like '.' in budget input, it displays the error", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <ManageBudgets />
          </MemoryRouter>
        </AuthProvider>
      );
    });

  
    const totalBudgetInput = screen.getByLabelText(/Total Budget/i);

    fireEvent.change(totalBudgetInput, { target: { value: "" } });
    fireEvent.change(totalBudgetInput, { target: { value: "." } });


    await waitFor(() => {
      expect(totalBudgetInput.validity.valid).toBe(false);
      expect(totalBudgetInput.validationMessage).toBe("Constraints not satisfied");
    });
  });
});
