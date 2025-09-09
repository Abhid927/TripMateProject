import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import theme from '../../styles/theme';
import NavBar from '../../styles/navbar';
import HeroSection from '../../styles/herosection';
import FancyCardsGrid from '../../styles/fancycard';
import Footer from '../../styles/footer';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import Signup from '../auth/Signup';
import Home from '../Home';
import Login from '../auth/LoginForm';
import ForgotPassword from '../auth/ForgotPassword';
import Expenses from '../Expenses';
import UserProfile from '../UserInformation/UserProfile';
import EditProfile from '../UserInformation/EditProfile';
import CreateTrip from '../trips/CreateTrip';
import TripDetails from '../trips/TripDetails';
import TripInvite from '../TripInvite/TripInvite';
import ManageBudgets from '../Budgeting/ManageBudgets';
import BudgetStatus from '../Budgeting/BudgetStatus';  // Updated path
import Navbar from '../Navigation/Navbar'
import TripCalendar from "../trips/TripCalendar";
import DayView from "../trips/DayView";
import HotelSearchPage from '../Hotels/HotelSearchPage';
import TripTimeline from "../trips/TripTimeline";
import AcceptInvite from '../TripInvite/AcceptInvite';
import Breakdown from '../Expenses/Breakdown';
import CompareTrips from '../Expenses/CompareTrips';
import TripInviteWrapper from "../TripInvite/TripInviteWrapper";
import TripReviews from "../trips/TripReviews";
import GroupBudgetStatus from '../Budgeting/GroupBudgetStatus'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh', // Ensures the page takes at least the full height of the viewport
        }}
      >
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <Navbar />

            {/* This box will take up the remaining space and push the footer to the bottom */}
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route exact path='/' element={<Home />} />
                <Route path='/manage-budgets' element={<ManageBudgets />} />
                <Route path='/budget-status' element={<BudgetStatus />} />
                <Route path='/group-budget-status' element={<GroupBudgetStatus />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/create-profile" element={<UserProfile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/create-trip" element={<CreateTrip />} />
                <Route path="/trip-details" element={<TripDetails />} />
                <Route path="/hotel-search" element={<HotelSearchPage />} />
                <Route path="/invite-friends" element={<TripInviteWrapper />} />
                <Route path="/trip-calendar/:tripID" element={<TripCalendar />} />
                <Route path="/trip-calendar/:tripID/day/:date" element={<DayView />} />
                <Route path="/trip-timeline/:tripID" element={<TripTimeline />} />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/expenses/:trip_id" element={<Breakdown />} />   
                <Route path="/compare-trips" element={<CompareTrips />} />   
                <Route path="/trip-reviews" element={<TripReviews />} />
              </Routes>
            </Box>


          </AuthProvider>
        </BrowserRouter>
      </Box>
      <Footer />
    </ThemeProvider>
  );
}


export default App;
