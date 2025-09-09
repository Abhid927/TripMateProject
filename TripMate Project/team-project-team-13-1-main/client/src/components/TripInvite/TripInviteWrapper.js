import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TripInvite from "./TripInvite";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

const TripInviteWrapper = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTripID, setSelectedTripID] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/getUserTrips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID: currentUser.uid }),
          });
        const data = await response.json();

        if (response.ok) {
            const ownedTrips = data.trips.filter((trip) => trip.role === "owner");
            setTrips(ownedTrips);
        } else {
          console.error("Failed to load trips:", data.error);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTrips();
    }
  }, [currentUser]);

  return (
    <Container sx={{ mt: 8, mb: 35 }}>
     
      <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42' }}>
        Select a Trip to Invite Friends
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <FormControl fullWidth sx={{ mb: 5 }}>
          <InputLabel id="trip-select-label">Select Trip</InputLabel>
          <Select
            labelId="trip-select-label"
            value={selectedTripID}
            label="Select Trip"
            onChange={(e) => setSelectedTripID(e.target.value)}
          >
            {trips.map((trip) => (
              <MenuItem key={trip.id} value={trip.id}>
                {trip.trip_name} ({trip.destination})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {selectedTripID && <TripInvite tripID={selectedTripID} />}
    </Container>
  );
};

export default TripInviteWrapper;
