import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CurrencyConverter from "./CurrencyConverter";


jest.mock("axios", () => ({
  get: jest.fn()
}));

describe("CurrencyConverter Component", () => {
  beforeEach(() => {
    const axios = require("axios"); 

 
    axios.get.mockImplementation((url) => {
      if (url.includes("https://api.exchangerate-api.com/v4/latest/USD")) {
        return Promise.resolve({
          data: { rates: { USD: 1, EUR: 0.85, GBP: 0.75 } }
        });
      }
      return Promise.resolve({
        data: { rates: { USD: 1, EUR: 0.85 } }
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  test("renders the component correctly", async () => {
    render(<CurrencyConverter />);
    

    expect(screen.getByText(/Currency Converter/i)).toBeInTheDocument();


    await waitFor(() => {
      expect(screen.getByText("USD")).toBeInTheDocument();
      expect(screen.getByText("EUR")).toBeInTheDocument();
    });


    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();

 
    expect(screen.getByRole("button", { name: /convert/i })).toBeInTheDocument(); 
    });

  test("allows user to input amount", () => {
    render(<CurrencyConverter />);

    const inputField = screen.getByLabelText(/Amount/i);
    fireEvent.change(inputField, { target: { value: "100" } });

    expect(inputField.value).toBe("100");
  });

  test("converts currency and displays result", async () => {
    render(<CurrencyConverter />);

 
    const inputField = screen.getByLabelText(/Amount/i);
    fireEvent.change(inputField, { target: { value: "10" } });

 
    fireEvent.click(screen.getByRole("button", { name: /convert/i }));


    await waitFor(() => {
        expect(screen.getByText("Converted Amount: 8.50 EUR")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});