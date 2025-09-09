import React, { useState, useEffect } from "react";
import {
  TextField, MenuItem, Typography, Container, CircularProgress, Card, CardContent, Grid
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GroupBudgetStatus = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [groupBudgetData, setGroupBudgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchTrips();
  }, [currentUser, navigate]);

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

  // Fetch group budget data when a trip is selected
  useEffect(() => {
    if (selectedTrip) {
      fetchGroupBudgetStatus(selectedTrip);
    } else {
      setGroupBudgetData([]);
      setError(null);
    }
  }, [selectedTrip]);

  const fetchGroupBudgetStatus = async (tripID) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getGroupBudgetStatus/${tripID}`);
      const data = await response.json();

      if (response.ok) {
        if (!data.groupBudgetStatus || data.groupBudgetStatus.length === 0) {
          setGroupBudgetData([]);
          setError("No budget data found for this trip.");
        } else {
          setGroupBudgetData(data.groupBudgetStatus);
          setError(null);
        }
      } else {
        setGroupBudgetData([]);
        setError(data.error || "Failed to load group budget data.");
      }
    } catch (err) {
      setGroupBudgetData([]);
      setError("Failed to fetch group budget status.");
    }
    setLoading(false);
  };

  const renderProgress = (name, totalBudget, totalSpent) => {
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = totalSpent > totalBudget;

    return (
      <Card variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 3, bgcolor: "#fff" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
            {name}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={percentage > 100 ? 100 : percentage}
            sx={{ height: 12, borderRadius: 6, mt: 2 }}
            color={isOverBudget ? "error" : "primary"}
          />
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Total Spent: <strong>${totalSpent.toFixed(2)}</strong> / Budget: <strong>${totalBudget.toFixed(2)}</strong>
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
        Group Budget Overview
      </Typography>

      <TextField
        fullWidth
        select
        label="Select Trip"
        variant="outlined"
        margin="normal"
        value={selectedTrip}
        onChange={(e) => setSelectedTrip(e.target.value)}
        sx={{ mb: 3 }}
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

      {loading && <CircularProgress sx={{ display: "block", margin: "auto", mt: 2 }} />}

      {!loading && error && selectedTrip && (
        <Typography variant="body2" sx={{ mt: 2, color: "red", textAlign: "center", fontWeight: "bold" }}>
          {error}
        </Typography>
      )}

      {!loading && groupBudgetData.length > 0 && (
        <Grid container spacing={2}>
          {groupBudgetData.map((user) => (
            <Grid item xs={12} sm={6} key={user.name}>
              {renderProgress(user.name, user.total_budget, user.total_spent)}
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default GroupBudgetStatus;
