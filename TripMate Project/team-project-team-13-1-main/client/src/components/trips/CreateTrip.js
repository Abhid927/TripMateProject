import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Alert, Paper, Grid } from "@mui/material";

const CreateTrip = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destination, setDestination] = useState("");

  const handleCreateTrip = async (e) => {
    e.preventDefault();

    if (!tripName || !startDate || !endDate || !destination) {
      alert("Please fill out all fields.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    const tripData = {
      userID: currentUser.uid, // Using Firebase Auth User ID
      tripName,
      startDate,
      endDate,
      destination,
    };

    try {
      const response = await fetch("/api/createTrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Trip saved successfully!");
        setTimeout(() => {
          navigate("/trip-details");
        }, 2000);
      } else {
        alert("Error saving trip: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save trip.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ mt: 8, padding: 20 }}>
        
        <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42' }}>
          Create a New Trip
        </Typography>

        {message && <Alert severity="success">{message}</Alert>}

        <form onSubmit={handleCreateTrip}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trip Name"
                variant="outlined"
                margin="normal"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                variant="outlined"
                margin="normal"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" sx={{ backgroundColor: '#003366' }} fullWidth>
                Create Trip
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateTrip;
