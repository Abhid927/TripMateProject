import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';

import { Grid, Typography, Select, MenuItem, Paper, Table, TableHead, TableBody, TableCell, TableRow, TableContainer } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { scaleLinear, scaleBand } from 'd3-scale';  // Using d3-scale instead of visx
import { extent, max } from 'd3-array';
import { curveMonotoneX } from 'd3-shape';

const CompareTrips = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const categories = ['Groceries', 'Food', 'Entertainment', 'Accommodation', 'Other'];

  const [userTrips, setTrips] = React.useState([]); 
  const [u_id, setUser] = React.useState(""); 

  const [tripId1, setTripId1] = useState(null);
  const [tripId2, setTripId2] = useState(null);
  const [expenses1, setExpenses1] = useState([]);
  const [expenses2, setExpenses2] = useState([]);


  // Function to group expenses
  const groupExpenses = (expenses) => {
      const grouped = {};
      let totalTripCost = 0;
      let categoryTotals = { Groceries: 0, Food: 0, Entertainment: 0, Accommodation: 0, Other: 0 };

      expenses.forEach(exp => {
          totalTripCost += exp.exp_amount;
          const cat = categories.includes(exp.exp_category) ? exp.exp_category : 'Other';
          categoryTotals[cat] += exp.exp_amount;

          const date = new Date(exp.exp_date).toLocaleDateString();
          if (!grouped[date]) grouped[date] = 0;
          grouped[date] += exp.exp_amount;
      });

      return { grouped, totalTripCost, categoryTotals };
  };

  const calculatePersonalExpense = (expenses) =>
      expenses.reduce((sum, exp) => sum + (exp.exp_owed || 0), 0);

  React.useEffect(() => {
      if (!currentUser) {
          navigate("/login");
          return;
      }

      const fetchTrips = async () => {
          try {
              const response = await fetch("/api/getTripInfo", {
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
              console.error("Error:", error);
          }
      };

      fetchTrips();
  }, [currentUser, navigate]);

  React.useEffect(() => {
      if (currentUser?.uid) {
          setUser(currentUser.uid);
      }
  }, [currentUser]);

  const fetchExpenses = async (tripId, setter) => {
      try {
          const expenses = await callApiGetExpenses(tripId);
          console.log("callApiGetExpenses returned: ", expenses);
          setter(Array.isArray(expenses) ? expenses : []);
      } catch (error) {
          console.error("Error calling API:", error);
      }
  };

  const callApiGetExpenses = async (tripId) => {
      const url = '/api/getExpenses';

      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              trip_id: tripId,
              u_id: u_id
          })
      });

      if (!response.ok) {
          throw new Error(`error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log("API Response:", body);
      return JSON.parse(body.express);
  };

  React.useEffect(() => {
      if (tripId1) fetchExpenses(tripId1, setExpenses1);
  }, [tripId1]);

  React.useEffect(() => {
      if (tripId2) fetchExpenses(tripId2, setExpenses2);
  }, [tripId2]);

  const { grouped: grouped1, totalTripCost: total1, categoryTotals: cat1 } = groupExpenses(expenses1);
  const { grouped: grouped2, totalTripCost: total2, categoryTotals: cat2 } = groupExpenses(expenses2);

  const personal1 = calculatePersonalExpense(expenses1);
  const personal2 = calculatePersonalExpense(expenses2);


  return (
      <div>
          <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42' }}>
              Compare Trips
          </Typography>

          <Grid container spacing={2} justifyContent="center" mb={2}>
              <Grid item xs={5}>
                <Select
                      fullWidth
                      value={tripId1 || ""}
                      onChange={(e) => setTripId1(e.target.value)}
                      displayEmpty
                  >
                      <MenuItem disabled value="">Select Trip 1</MenuItem>
                      {[...new Map(userTrips.map(t => [t.trip_id, t])).values()]
                          .map((trip) => (
                              <MenuItem key={trip.trip_id} value={trip.trip_id}>
                                  {trip.trip_name}
                              </MenuItem>
                          ))}
                  </Select>
              </Grid>
              <Grid item xs={5}>
              <Select
                      fullWidth
                      value={tripId2 || ""}
                      onChange={(e) => setTripId2(e.target.value)}
                      displayEmpty
                  >
                      <MenuItem disabled value="">Select Trip 2</MenuItem>
                      {[...new Map(userTrips.map(t => [t.trip_id, t])).values()]
                          .map((trip) => (
                              <MenuItem key={trip.trip_id} value={trip.trip_id}>
                                  {trip.trip_name}
                              </MenuItem>
                          ))}
                  </Select>
              </Grid>
          </Grid>

          <Grid container spacing={2} sx={{padding:2}}>
              {[{ title: "Trip 1", total: total1, personal: personal1, categories: cat1 },
                  { title: "Trip 2", total: total2, personal: personal2, categories: cat2 }].map((trip, idx) => (
                      <Grid item xs={6} key={idx}>
                          <Paper elevation={3} style={{ padding: 16, backgroundColor: '#D0E6F3', borderRadius: '12px' }}>
                              <Typography variant="h6" align="center" style={{ fontWeight: 600, color: '#2B2D42' }}>
                                  {trip.title}
                              </Typography>
                              <Typography style={{ fontWeight: 600, color: '#2B2D42' }}>Total Trip Cost: {trip.total.toFixed(2)}</Typography>
                              <Typography style={{ fontWeight: 600, color: '#2B2D42' }}>Your Spend: {trip.personal.toFixed(2)}</Typography>
                              <TableContainer>
                                  <Table>
                                      <TableHead>
                                          <TableRow>
                                              <TableCell style={{ fontWeight: 600, color: '#2B2D42' }}>Category</TableCell>
                                              <TableCell align="right" style={{ fontWeight: 600, color: '#2B2D42' }}>Amount</TableCell>
                                          </TableRow>
                                      </TableHead>
                                      <TableBody>
                                          {categories.map(cat => (
                                              <TableRow key={cat}>
                                                  <TableCell style={{ color: '#2B2D42' }}>{cat}</TableCell>
                                                  <TableCell align="right" style={{ color: '#2B2D42' }}>
                                                      ${trip.categories[cat]?.toFixed(2) || '0.00'}
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>
                                  </Table>
                              </TableContainer>
                          </Paper>
                      </Grid>
                  ))}
          </Grid>
      </div>
  );
};

export default CompareTrips;
