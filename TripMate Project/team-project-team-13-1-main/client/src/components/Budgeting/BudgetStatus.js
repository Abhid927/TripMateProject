import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  TextField, MenuItem, Typography, Container, CircularProgress, Alert, Card, CardContent, Grid, Divider
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

const BudgetStatus = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [budgetData, setBudgetData] = useState(null);
  const [groupBudgetData, setGroupBudgetData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Fetch individual budget status when a trip is selected
  useEffect(() => {
    if (selectedTrip) {
      fetchBudgetStatus(selectedTrip);
      fetchGroupBudgetStatus(selectedTrip);
    } else {
      setBudgetData(null);
      setGroupBudgetData([]);
      setError(null);
    }
  }, [selectedTrip]);

  const fetchBudgetStatus = async (tripID) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getBudgetStatus/${tripID}/${currentUser.uid}`);
      const data = await response.json();
      if (response.ok) {
        if (!data.budget || Object.keys(data.budget).length === 0 || data.budget.total === 0) {
          setBudgetData(null);
          setError("Budget for this trip was not set.");
        } else {
          setBudgetData(data);
          setError(null);
        }
      } else {
        setBudgetData(null);
        setError(data.error || "Failed to load budget data.");
      }
    } catch (err) {
      setBudgetData(null);
      setError("Failed to fetch budget status.");
    }
    setLoading(false);
  };

  const fetchGroupBudgetStatus = async (tripID) => {
    try {
      const response = await fetch(`/api/getGroupBudgetStatus/${tripID}`);
      const data = await response.json();
      if (response.ok) {
        if (!data.groupBudgetStatus || data.groupBudgetStatus.length === 0) {
          setGroupBudgetData([]);
        } else {
          setGroupBudgetData(data.groupBudgetStatus);
        }
      } else {
        setGroupBudgetData([]);
      }
    } catch (err) {
      setGroupBudgetData([]);
    }
  };

  const renderProgress = (label, budget, spent) => {
    if (budget === undefined || spent === undefined) return null;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const isOverBudget = spent > budget;

    return (
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 3,
          border: isOverBudget ? "2px solid #d32f2f" : "1px solid #ccc",
          backgroundColor: "#ffffff"
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: isOverBudget ? "#d32f2f" : "inherit" }}
          >
            {label} {isOverBudget && "❗"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={percentage > 100 ? 100 : percentage}
            sx={{
              height: 12,
              borderRadius: 6,
              mt: 1,
              bgcolor: isOverBudget ? "#ff7961" : "#64b5f6"
            }}
            color={isOverBudget ? "error" : "primary"}
          />
          <Typography
            variant="body2"
            sx={{ mt: 1, fontWeight: "medium", color: isOverBudget ? "#d32f2f" : "inherit" }}
          >
            ${spent.toFixed(2)} spent / ${budget.toFixed(2)} budgeted
          </Typography>
          {isOverBudget && (
            <Typography variant="caption" sx={{ color: "#d32f2f", fontWeight: "bold" }}>
              ⚠️ Over budget!
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
        Budget Tracking
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
        <Alert severity="error" sx={{ mt: 2, fontSize: "1rem", fontWeight: "bold", textAlign: "center" }}>
          {error}
        </Alert>
      )}

      {!loading && budgetData && (
        <>
          {/* 🔹 Main Budget Overview */}
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 5,
              boxShadow: 3,
              mb: 4,
              backgroundColor: "#ffffff" // ✅ White Background
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center" }}>
              Total Budget vs. Total Expenses
            </Typography>
            {renderProgress("Total Budget", budgetData.budget.total,
              budgetData.spent.food + budgetData.spent.transport + budgetData.spent.accommodation + budgetData.spent.activities)}
          </Card>

          {/* 🔹 Category Budgets */}
          <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}>
            Category-wise Spending
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {renderProgress("Food", budgetData.budget.food, budgetData.spent.food)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProgress("Transport", budgetData.budget.transport, budgetData.spent.transport)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProgress("Accommodation", budgetData.budget.accommodation, budgetData.spent.accommodation)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProgress("Activities", budgetData.budget.activities, budgetData.spent.activities)}
            </Grid>
          </Grid>
        </>
      )}

      {/* Divider to separate Group Budget section */}
      <Divider sx={{ my: 4 }} />

      {/* Updated Group Budget Overview title */}
      <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
        Group Budget Overview
      </Typography>

      {groupBudgetData.length > 0 ? (
        <Grid container spacing={2}>
          {groupBudgetData.map((user) => (
            <Grid item xs={12} sm={6} key={user.name}>
              {renderProgress(user.name, user.total_budget, user.total_spent)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2, fontSize: "1rem", textAlign: "center", fontWeight: "bold" }}>
          No group budget data found for this trip.
        </Alert>
      )}
    </Container>
  );
};

export default BudgetStatus;
