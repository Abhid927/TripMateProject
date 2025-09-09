import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container, Typography, Button } from "@mui/material";

const localizer = momentLocalizer(moment);

const TripCalendar = () => {
  const { tripID } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    console.log("Fetching itinerary for tripID:", tripID);

    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/getItinerary/${tripID}`);
        console.log("API Response Status:", response.status);

        if (!response.ok) {
          console.error("API call failed with status:", response.status);
          return;
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        if (!data.itinerary || !Array.isArray(data.itinerary)) {
          console.error("Invalid itinerary format received:", data);
          return;
        }

  const formattedEvents = data.itinerary
  .map((event) => {
    console.log("Processing Event:", event);

    if (!event.date || !event.time) {
      console.warn("Skipping event due to missing date or time:", event);
      return null;
    }

    const dateOnly = event.date.split("T")[0]; // Extract YYYY-MM-DD
    const dateTimeString = `${dateOnly}T${event.time}`;
    const startDateTime = new Date(dateTimeString);

    if (isNaN(startDateTime.getTime())) {
      console.error("Invalid Date:", dateTimeString);
      return null;
    }

    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1-hour duration

    return {
      title: typeof event.name === "string" ? event.name : "Unnamed Event",
      start: startDateTime,
      end: endDateTime,
      allDay: false,
      id: event.id,
    };
  })
  .filter((event) => event !== null);

console.log("FINAL Formatted Events:", formattedEvents);
setEvents(formattedEvents);


      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchItinerary();
  }, [tripID]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Trip Calendar
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: 20 }}
      >
        Back to Trip
      </Button>

      {events.length > 0 ? (
        <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        views={["month", "week", "day", "agenda"]}
        step={30}
        timeslots={2}
        defaultView="week"
        style={{ height: 600 }}
        onSelectEvent={(event) => {
          if (!event || !event.start) {
            console.error("Invalid event clicked:", event);
            return;
          }
      
          const eventDate = event.start.toISOString().split("T")[0]; // Extract YYYY-MM-DD
          console.log("Navigating to:", `/trip-calendar/${tripID}/day/${eventDate}`);
      
          navigate(`/trip-calendar/${tripID}/day/${eventDate}`);
        }}
      />
      
      ) : (
        <Typography variant="h6" color="error">
          No events found. Try adding an event!
        </Typography>
      )}
    </Container>
  );
};

export default TripCalendar;
