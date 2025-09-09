import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../auth/LogoutButton.js";

const Navbar = () => {
  const { currentUser } = useAuth();

  const navButtonStyle = {
    color: "white",
    fontWeight: 500,
    mx: 1,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#003366", paddingX: 2 }}>
      <Toolbar disableGutters sx={{ width: "100%", display: "flex" }}>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
              letterSpacing: 1.5,
              mx: 2,
            }}
          >
            TRIPMATE
          </Typography>
          <Button component={Link} to="/create-trip" sx={navButtonStyle}>Create Trip</Button>
          <Button component={Link} to="/trip-details" sx={navButtonStyle}>Trip Details</Button>
          <Button component={Link} to="/invite-friends" sx={navButtonStyle}>Invite your Friend</Button>
          <Button component={Link} to="/expenses" sx={navButtonStyle}>Manage Expenses</Button>
          <Button component={Link} to="/compare-trips" sx={navButtonStyle}>Compare Trips</Button>
          <Button component={Link} to="/hotel-search" sx={navButtonStyle}>Search Hotels</Button>
          <Button component={Link} to="/trip-reviews" sx={navButtonStyle}>Trip Reviews</Button>
          <Button component={Link} to="/manage-budgets" sx={navButtonStyle}>Manage Budgets</Button>
          <Button component={Link} to="/budget-status" sx={navButtonStyle}>Budget Status</Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {currentUser ? (
            <>
              <Button component={Link} to="/edit-profile" sx={navButtonStyle}>Edit Profile</Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button component={Link} to="/login" sx={navButtonStyle}>Login</Button>
              <Button component={Link} to="/signup" sx={navButtonStyle}>Sign Up</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
