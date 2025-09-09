# TripMate - Group Travel Planning & Financial Management Platform

## Overview:
TripMate is an all-in-one platform designed for group travel planning, financial tracking, and itinerary management. It simplifies expense tracking, cost splitting, and budgeting across different currencies, ensuring an organized and stress-free travel experience for groups.

## Functionalities

#### Financial Management:
- Receipt Scanner: Upload receipts to auto-populate expenses.
- Currency Conversion: Convert expenses to home currency in real time.
- Purchase Breakdown: Categorize and visualize spending trends.
- Budgeting Tool: Set and track individual/group budgets.

#### Group Planning:
- Trip & Group Creation: Organize expenses and trip details collaboratively.
- Itinerary Planner: Shareable, collaborative scheduling tool.
- Timeline: Track daily spending and key trip events.
- Trip Comparisons: Analyze past trip expenses.

#### Additional Features:
- Hotel Booking: API integration for budget-friendly accommodations. **
- Activity Suggestions: Personalized recommendations based on past trips.
- Trip Recap: Share highlights, ratings, and memories.

## Sample Input Data

Here is an example of user-entered data for testing:

User Profile
{
  "uid": "user1"
  "name": "user",
  "home_currency": "USD",
}

Trip Information
{
  "trip_name": "Summer 2025"
  "destination": "Paris, France",
  "start_date": "2025-06-15",
  "end_date": "2025-06-22",
}

Expense
{
  "exp_name": 'McDonalds',
  "exp_date": "2025-01-15",
  "exp_amount": 60,
  "currency_id": "EUR",
  "members": ['user1','user2']
}

** to be able to use the hotel search feature, you will need to add a .env file in the root directory, which can be found as part of our submission.

### Invoice/Receipt Upload

Use the sample files in `./.samples/`. The invoice/receipt parsing is hard coded right now to these two files specifically.
