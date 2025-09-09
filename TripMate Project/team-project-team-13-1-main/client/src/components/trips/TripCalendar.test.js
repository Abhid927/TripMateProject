const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ tripID: "1" }),
}));
jest.mock("react-big-calendar/lib/css/react-big-calendar.css", () => {});
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TripCalendar from "../trips/TripCalendar";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import DayView from './DayView';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          itinerary: [
            {
              id: 1,
              name: "Visit Museum",
              date: "2025-07-01",
              time: "10:00:00",
            },
            {
              id: 2,
              name: "Dinner",
              date: "2025-07-01",
              time: "18:30:00",
            },
          ],
        }),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("react-big-calendar", () => {
  const originalModule = jest.requireActual("react-big-calendar");
  return {
    ...originalModule,
    Calendar: ({ events, onSelectEvent }) => (
      <div data-testid="calendar">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event)}
            role="button"
          >
            {event.title}
          </div>
        ))}
      </div>
    ),
  };
});

describe("TripCalendar Component", () => {
  it("renders calendar events correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/trip-calendar/1"]}>
        <Routes>
          <Route path="/trip-calendar/:tripID" element={<TripCalendar />} />
          <Route path="/trip-calendar/:tripID/day/:date" element={<DayView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Visit Museum")).toBeInTheDocument();
    expect(await screen.findByText("Dinner")).toBeInTheDocument();
  });

  it("displays fallback text if no events are found", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ itinerary: [] }),
      })
    );

    render(
      <MemoryRouter initialEntries={["/trip-calendar/1"]}>
        <Routes>
          <Route path="/trip-calendar/:tripID" element={<TripCalendar />} />
          <Route path="/trip-calendar/:tripID/day/:date" element={<DayView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/No events found. Try adding an event!/i)
    ).toBeInTheDocument();
  });

  it("displays 'No events found' message when itinerary is empty", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ itinerary: [] }),
        ok: true
      })
    );
  
    render(
      <MemoryRouter initialEntries={["/trip-calendar/1"]}>
        <Routes>
          <Route path="/trip-calendar/:tripID" element={<TripCalendar />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/no events found/i)).toBeInTheDocument();
    });
  });

  it("navigates back when 'Back to Trip' button is clicked", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            itinerary: [],
          }),
      })
    );
  
    render(
      <MemoryRouter initialEntries={["/trip-calendar/1"]}>
        <Routes>
          <Route path="/trip-calendar/:tripID" element={<TripCalendar />} />
        </Routes>
      </MemoryRouter>
    );
  
    const backButton = await screen.findByRole("button", { name: /back to trip/i });
    fireEvent.click(backButton);
  
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("filters out events with missing date or time", async () => {
    const mockData = {
      itinerary: [
        { id: 1, name: "Valid Event", date: "2025-07-01", time: "10:00:00" },
        { id: 2, name: "Missing Time", date: "2025-07-01" }, // Invalid
        { id: 3, name: "Missing Date", time: "12:00:00" }    // Invalid
      ]
    };
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
        ok: true
      })
    );
  
    render(
      <MemoryRouter initialEntries={["/trip-calendar/1"]}>
        <Routes>
          <Route path="/trip-calendar/:tripID" element={<TripCalendar />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText("Valid Event")).toBeInTheDocument();
      expect(screen.queryByText("Missing Time")).not.toBeInTheDocument();
      expect(screen.queryByText("Missing Date")).not.toBeInTheDocument();
    });
  });
});
