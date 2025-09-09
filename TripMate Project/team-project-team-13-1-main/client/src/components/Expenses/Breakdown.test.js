import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Breakdown from './Breakdown';
import { useLocation } from 'react-router-dom';
import "@testing-library/jest-dom";


// Mocking the necessary hooks and data
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('./WeeklyExpenses', () => () => <div>Weekly Expenses View</div>);

describe('Breakdown Component', () => {
  const mockTrip = {
    trip_id: 1,
    trip_name: 'Test Trip',
  };

  const mockUserTrips = [mockTrip];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock useLocation to return the trip_id and userTrips for testing
    useLocation.mockReturnValue({
      state: {
        u_id: '123',
        trip_id: 1,
        userTrips: mockUserTrips,
      },
    });
  });

  test('renders Breakdown component with correct trip name', () => {
    render(<Breakdown />);

    // Check if the correct trip name is displayed
    expect(screen.getByText('Test Trip')).toBeInTheDocument();
  });

  test('shows "Trip Summary" when trip name is not found', () => {
    useLocation.mockReturnValue({
      state: {
        u_id: '123',
        trip_id: 999, // A trip_id that does not exist in the mock data
        userTrips: mockUserTrips,
      },
    });

    render(<Breakdown />);

    expect(screen.getByText('Trip Summary')).toBeInTheDocument();
  });

  test('renders category breakdown table', () => {
    render(<Breakdown />);

    // Check if the category names appear in the table
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  test('calls fetchExpenses on mount', async () => {
    const mockFetchExpenses = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ express: JSON.stringify([]) }),
      })
    );

    render(<Breakdown />);

    // Simulate mount and ensure fetchExpenses is called
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });
});
