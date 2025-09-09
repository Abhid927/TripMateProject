import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Alert, MenuItem, Grid, Box } from "@mui/material";
import { AddCircle, Edit, CheckCircle } from "@mui/icons-material";

const ManageBudget = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState({
    food: "",
    transport: "",
    accommodation: "",
    activities: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchTrips();
  }, [currentUser, navigate]);

  // Fetch user's trips
  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/getUserTrips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: currentUser.uid }),
      });

      const data = await response.json();
      if (response.ok) {
        setTrips(data.trips);
      } else {
        console.error("Error fetching trips:", data.error);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  // Fetch the budget details when a trip is selected
  useEffect(() => {
    if (selectedTrip) {
      fetchBudgetDetails(selectedTrip);
    }
  }, [selectedTrip]);

  const fetchBudgetDetails = async (tripID) => {
    try {
      const response = await fetch(`/api/getTotalBudget/${tripID}`);
      const data = await response.json();

      if (response.ok) {
        setTotalBudget(data.total_budget || "");
        setCategoryBudgets({
          food: data.food_budget || "",
          transport: data.transport_budget || "",
          accommodation: data.accommodation_budget || "",
          activities: data.activities_budget || "",
        });
      } else {
        console.error("Error fetching budget details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching budget details:", error);
    }
  };

  // Handle total budget submission
  const handleTotalBudgetSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTrip || !totalBudget) {
      setError("Please select a trip and enter a total budget.");
      return;
    }

    try {
      const response = await fetch("/api/setTotalBudget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.uid,
          trip_id: selectedTrip,
          total_budget: totalBudget,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Total budget updated successfully!");
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update total budget.");
    }
  };

  // Handle category budget submission
  const handleCategoryBudgetSubmit = async (e) => {
    e.preventDefault();

    const totalAllocated = Object.values(categoryBudgets).reduce((sum, val) => sum + Number(val || 0), 0);
    if (totalAllocated > totalBudget) {
      setError("Total allocated category budgets exceed the total budget.");
      return;
    }

    try {
      const response = await fetch("/api/setCategoryBudgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.uid,
          trip_id: selectedTrip,
          categories: categoryBudgets,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Category budgets updated successfully!");
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to update category budgets.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
        Manage Budget
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        fullWidth
        select
        label="Select Trip"
        variant="outlined"
        margin="normal"
        value={selectedTrip}
        onChange={(e) => setSelectedTrip(e.target.value)}
      >
        {[...new Set(trips.map((trip) => trip.id))]
          .map((uniqueId) => {
              const trip = trips.find((t) => t.id === uniqueId);
              return (
              <MenuItem key={trip.id} value={trip.id}>
                  {trip.trip_name}
              </MenuItem>
              );
          })}
      </TextField>

      <form onSubmit={handleTotalBudgetSubmit}>
        <TextField
          fullWidth
          label="Total Budget"
          type="number"
          variant="outlined"
          margin="normal"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          required
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            fullWidth
            sx={{
              fontSize: "1.2rem",
              padding: "15px", // Increase padding for bigger button
              backgroundColor: "#1976d2", // Blue color for visibility
              color: "#fff", // White text for contrast
              '&:hover': {
                backgroundColor: "#1565c0", // Darker blue on hover
              },
            }}
          >
            Set Total Budget
          </Button>
        </Box>
      </form>

      <form onSubmit={handleCategoryBudgetSubmit} style={{ marginTop: "20px" }}>
        <TextField
          fullWidth
          label="Food Budget"
          type="number"
          variant="outlined"
          margin="normal"
          value={categoryBudgets.food}
          onChange={(e) => setCategoryBudgets({ ...categoryBudgets, food: e.target.value })}
        />
        <TextField
          fullWidth
          label="Transport Budget"
          type="number"
          variant="outlined"
          margin="normal"
          value={categoryBudgets.transport}
          onChange={(e) => setCategoryBudgets({ ...categoryBudgets, transport: e.target.value })}
        />
        <TextField
          fullWidth
          label="Accommodation Budget"
          type="number"
          variant="outlined"
          margin="normal"
          value={categoryBudgets.accommodation}
          onChange={(e) => setCategoryBudgets({ ...categoryBudgets, accommodation: e.target.value })}
        />
        <TextField
          fullWidth
          label="Activities Budget"
          type="number"
          variant="outlined"
          margin="normal"
          value={categoryBudgets.activities}
          onChange={(e) => setCategoryBudgets({ ...categoryBudgets, activities: e.target.value })}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            startIcon={<Edit />}
            fullWidth
            sx={{
              fontSize: "1.2rem",
              padding: "15px", // Increase padding for bigger button
              backgroundColor: "#0288d1", // Secondary blue color
              color: "#fff", // White text for contrast
              '&:hover': {
                backgroundColor: "#0277bd", // Darker secondary blue on hover
              },
            }}
          >
            Set Category Budgets
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default ManageBudget;
