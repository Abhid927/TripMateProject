import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TripTimeline from "../trips/TripTimeline";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "whatwg-fetch";

jest.mock("react-vertical-timeline-component/style.min.css", () => ({}));

jest.mock("date-fns", () => ({
    format: jest.fn(() => "Mocked Date"),
    parseISO: jest.fn(() => new Date("2025-06-01")),
    isWithinInterval: jest.fn(() => true),
}));

jest.mock("date-fns-tz", () => ({
    toZonedTime: jest.fn((date) => date),
}));

jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({ currentUser: { uid: "user123" } }),
}));

global.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock API responses
beforeEach(() => {
    global.fetch = jest.fn((url) => {
        if (url.includes("/api/getTrip/")) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        trip_name: "Test Trip",
                        start_date: "2025-06-01",
                        end_date: "2025-06-10",
                    }),
            });
        }
        if (url.includes("/api/getItinerary/")) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        itinerary: [
                            {
                                id: 1,
                                name: "Visit Museum",
                                date: "2025-06-02",
                                time: "10:00 AM",
                                category: "Sightseeing",
                                notes: "Remember to buy tickets in advance.",
                            },
                            {
                                id: 2,
                                name: "Dinner at Italian Restaurant",
                                date: "2025-06-03",
                                time: "7:00 PM",
                                category: "Dining",
                                notes: "Reservation under John Doe.",
                            },
                        ],
                    }),
            });
        }
        if (url.includes("/api/updateActivityNote")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Notes updated successfully" }),
            });
        }
        return Promise.reject(new Error("Unknown API endpoint"));
    });
});

describe("TripTimeline Component", () => {
    it("renders the TripTimeline component and displays the trip details", async () => {
        render(
            <MemoryRouter initialEntries={["/trip/1"]}>
                <Routes>
                    <Route path="trip/:tripID" element={<TripTimeline />} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText(/Test Trip/i)).toBeInTheDocument();
            expect(screen.getByText(/2025-06-01 → 2025-06-10/i)).toBeInTheDocument();
        });
    });

    it("displays all activities correctly", async () => {
        render(
            <MemoryRouter initialEntries={["/trip/1"]}>
                <Routes>
                    <Route path="trip/:tripID" element={<TripTimeline />} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText("Visit Museum")).toBeInTheDocument();
            expect(screen.getByText("Dinner at Italian Restaurant")).toBeInTheDocument();
        });
    });

    it("shows trip start and end markers correctly", async () => {
        render(
            <MemoryRouter initialEntries={["/trip/1"]}>
                <Routes>
                    <Route path="trip/:tripID" element={<TripTimeline />} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText(/🚀 Trip Starts/i)).toBeInTheDocument();
            expect(screen.getByText(/🏁 Trip Ends/i)).toBeInTheDocument();
        });
    });

    it("filters activities by category", async () => {
        render(
          <MemoryRouter initialEntries={["/trip/1"]}>
            <Routes>
              <Route path="trip/:tripID" element={<TripTimeline />} />
            </Routes>
          </MemoryRouter>
        );
      
        // Wait for initial activities to load
        await waitFor(() => {
          expect(screen.getByText("Visit Museum")).toBeInTheDocument();
          expect(screen.getByText("Dinner at Italian Restaurant")).toBeInTheDocument();
        });
      
        // Find and open category dropdown
        const categoryFilter = screen.getByRole("combobox");
        fireEvent.mouseDown(categoryFilter);
      
        // Select "Dining"
        const diningOption = await screen.findByText("Dining");
        fireEvent.click(diningOption);
      
        // Wait for filtering effect
        await waitFor(() => {
          expect(screen.queryByText("Visit Museum")).not.toBeInTheDocument();
          expect(screen.getByText("Dinner at Italian Restaurant")).toBeInTheDocument();
        });
      });
      
      it("resets filters correctly", async () => {
        render(
          <MemoryRouter initialEntries={["/trip/1"]}>
            <Routes>
              <Route path="trip/:tripID" element={<TripTimeline />} />
            </Routes>
          </MemoryRouter>
        );
      
        // Wait for activities to load
        await waitFor(() => {
          expect(screen.getByText("Visit Museum")).toBeInTheDocument();
        });
      
        // Find and open category dropdown
        const categoryFilter = screen.getByRole("combobox");
        fireEvent.mouseDown(categoryFilter);
      
        // Select "Dining"
        const diningOption = await screen.findByText("Dining");
        fireEvent.click(diningOption);
      
        // Wait for filtering effect
        await waitFor(() => {
          expect(screen.queryByText("Visit Museum")).not.toBeInTheDocument();
        });
      
        // Click Reset Filters button
        const resetButton = screen.getByRole("button", { name: /reset filters/i });
        fireEvent.click(resetButton);
      
        // Wait for all activities to reappear
        await waitFor(() => {
          expect(screen.getByText("Visit Museum")).toBeInTheDocument();
        });
      });          
});