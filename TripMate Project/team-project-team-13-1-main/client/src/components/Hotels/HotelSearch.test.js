import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HotelSearchPage from "./HotelSearchPage";
import HotelList from "./HotelList";
import fetchMock from "jest-fetch-mock";
import "@testing-library/jest-dom";


jest.mock("./HotelList", () => jest.fn(() => <div>Mocked HotelList</div>));

fetchMock.enableMocks();

describe("HotelSearchPage", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    test("renders the Hotel Search page correctly", () => {
        render(<HotelSearchPage />);
        expect(screen.getByText(/hotel search/i)).toBeInTheDocument();
    });

    test("updates address input value", () => {
        render(<HotelSearchPage />);
        const input = screen.getByLabelText(/address/i);
        fireEvent.change(input, { target: { value: "New York" } });
        expect(input.value).toBe("New York");
    });

    test("fetches coordinates and triggers hotel list display on valid search", async () => {
        fetchMock.mockResponseOnce(JSON.stringify([{ lat: "40.7128", lon: "-74.0060" }]));

        render(<HotelSearchPage />);
        const input = screen.getByLabelText(/address/i);
        fireEvent.change(input, { target: { value: "New York" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("/api/hotels/coord-by-address?address=New%20York");
            expect(HotelList).toHaveBeenCalledWith({ latitude: 40.7128, longitude: -74.0060, map: null }, {});
        });
    });

    test("displays error message when API fails", async () => {
        fetchMock.mockReject(new Error("API failure"));

        render(<HotelSearchPage />);
        fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "Invalid Place" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText(/an error occurred while fetching the coordinates/i)).toBeInTheDocument();
        });
    });

    test("does not render HotelList when search fails", async () => {
        fetchMock.mockResponseOnce(JSON.stringify([]));

        render(<HotelSearchPage />);
        fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "Unknown" } });
        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        await waitFor(() => {
            expect(screen.queryByText(/Mocked HotelList/i)).not.toBeInTheDocument();
        });
    });
});