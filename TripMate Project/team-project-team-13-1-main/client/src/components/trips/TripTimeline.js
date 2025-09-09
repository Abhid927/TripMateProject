import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { Container, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { format, parseISO, isWithinInterval } from "date-fns";
import moment from "moment";
import { toZonedTime } from "date-fns-tz";

const TripTimeline = () => {
  const { tripID } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [tripDetails, setTripDetails] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [notes, setNotes] = useState({});
  const [editingNotes, setEditingNotes] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    console.log("Fetching trip details and activities for tripID:", tripID);

    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`/api/getTrip/${tripID}`);
        const data = await response.json();
        if (response.ok) {
          setTripDetails(data);
        } else {
          console.error("Error fetching trip details:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/getItinerary/${tripID}`);
        const data = await response.json();
        if (response.ok) {
          const sortedActivities = data.itinerary.sort((a, b) =>
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
          );
          setActivities(sortedActivities);
          setFilteredActivities(sortedActivities);

          // Initialize notes state
          const notesData = {};
          const editingState = {};
          sortedActivities.forEach((activity) => {
            notesData[activity.id] = activity.notes || "";
            editingState[activity.id] = false;
          });
          setNotes(notesData);
          setEditingNotes(editingState);
        } else {
          console.error("Error fetching activities:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchTripDetails();
    fetchActivities();
  }, [tripID]);

  const handleFilterChange = () => {
    let filtered = activities;
  
    if (categoryFilter) {
      filtered = filtered.filter((activity) => activity.category === categoryFilter);
    }
  
    if (startDateFilter && endDateFilter) {
      filtered = filtered.filter((activity) => {
        const activityDate = parseISO(activity.date);
  
        return isWithinInterval(activityDate, {
          start: parseISO(startDateFilter),
          end: new Date(parseISO(endDateFilter).getTime() + 24 * 60 * 60 * 1000),
        });
      });
    }
  
    setFilteredActivities(filtered);
  };  

  useEffect(() => {
    handleFilterChange();
  }, [categoryFilter, startDateFilter, endDateFilter, activities]);

  // Handle note changes
  const handleNoteChange = (activityID, newNote) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [activityID]: newNote,
    }));
    setEditingNotes((prevEditing) => ({
      ...prevEditing,
      [activityID]: true, //Show "Save Note" when editing
    }));
  };

  // Save notes to the database
  const saveNote = async (activityID) => {
    try {
      const response = await fetch("/api/updateActivityNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityID, notes: notes[activityID] }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Notes saved successfully");
        setEditingNotes((prevEditing) => ({
          ...prevEditing,
          [activityID]: false, //Hide "Save Note" button after saving
        }));
        setSnackbarOpen(true);
      } else {
        console.error("Error saving note:", data.error);
      }
    } catch (error) {
      console.error("Fetch error while saving note:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Trip Timeline
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        Back to Trip Details
      </Button>

      {tripDetails && (
        <Typography variant="h6" color="textSecondary">
          {tripDetails.trip_name}: {tripDetails.start_date} → {tripDetails.end_date}
        </Typography>
      )}

      {/* Filters Section */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Dining">Dining</MenuItem>
            <MenuItem value="Sightseeing">Sightseeing</MenuItem>
            <MenuItem value="Travel">Travel</MenuItem>
            <MenuItem value="Entertainment">Entertainment</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
        />

        {/* Reset Filters Button */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setCategoryFilter("");
            setStartDateFilter("");
            setEndDateFilter("");
            setFilteredActivities(activities);
          }}
        >
          Reset Filters
        </Button>
      </div>

      <VerticalTimeline>
        <VerticalTimelineElement
            iconStyle={{ background: "#4CAF50", color: "#fff" }} // Green start marker
            icon={<EventIcon />}
        >
            <Typography variant="h6">🚀 Trip Starts</Typography>
            <Typography variant="body2">📆 {tripDetails?.start_date
            ? format(
                new Date(parseISO(tripDetails.start_date).getTime() + new Date().getTimezoneOffset() * 60000),
                "yyyy-MM-dd"
            )
            : "Loading..."}</Typography>
        </VerticalTimelineElement>
        {filteredActivities.map((activity) => (
          <VerticalTimelineElement key={activity.id} icon={<EventIcon />}>
            <Typography variant="h6">{activity.name}</Typography>
            <Typography variant="body2">📆 {format(new Date(parseISO(activity.date).getTime() + new Date().getTimezoneOffset() * 60000), "yyyy-MM-dd")} ⏰ {activity.time} </Typography>
            <Typography variant="body2">🛑 {activity.category}</Typography>

            <TextField
                label="Personal Notes"
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={notes[activity.id] || ""}
                onChange={(e) => handleNoteChange(activity.id, e.target.value)}
                onFocus={() => setEditingNotes((prev) => ({ ...prev, [activity.id]: true }))} // Show "Save Note" when editing starts
                style={{ marginTop: 10 }}
            />
                {editingNotes[activity.id] && ( // Show button only when editing
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => saveNote(activity.id)} 
                        style={{ marginTop: 5 }}
                    >
                        Save Note
                    </Button>
                )}
          </VerticalTimelineElement>
        ))}
        <VerticalTimelineElement
            iconStyle={{ background: "#F44336", color: "#fff" }}
            icon={<EventIcon />}
        >
            <Typography variant="h6">🏁 Trip Ends</Typography>
            <Typography variant="body2">📆 {tripDetails?.end_date
            ? format(
                new Date(parseISO(tripDetails.end_date).getTime() + new Date().getTimezoneOffset() * 60000),
                "yyyy-MM-dd"
            )
            : "Loading..."}</Typography>
        </VerticalTimelineElement>
      </VerticalTimeline>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success">✅ Note saved successfully!</Alert>
      </Snackbar>
    </Container>
  );
};

export default TripTimeline;
