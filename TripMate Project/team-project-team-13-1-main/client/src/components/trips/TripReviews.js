import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Box, MenuItem, Select, TextField, Button,
  CircularProgress, Rating, Paper, Divider, Avatar
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";

export default function TripReviews() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [completedTrips, setCompletedTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [review, setReview] = useState({
    overall_rating: 0,
    favorite_memory: "",
    personal_notes: "",
    activity_ratings: {},
  });

  const [myTripReviews, setMyTripReviews] = useState([]);
  const [groupReviews, setGroupReviews] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchTrips = async () => {
      setLoading(true);
      const res = await fetch(`/api/getCompletedTrips/${currentUser.uid}`);
      const data = await res.json();
      setCompletedTrips(data.trips || []);
      setLoading(false);
    };

    fetchTrips();
  }, [currentUser]);

  const handleTripChange = async (tripID) => {
    setSelectedTrip(tripID);
    setLoading(true);

    try {
      const [itineraryRes, userReviewRes, groupReviewRes] = await Promise.all([
        fetch(`/api/getItinerary/${tripID}`),
        fetch(`/api/getUserTripReviews/${currentUser.uid}`),
        fetch(`/api/getGroupTripReviews/${tripID}`),
      ]);

      const itineraryData = await itineraryRes.json();
      const userReviewData = await userReviewRes.json();
      const groupReviewData = await groupReviewRes.json();

      setActivities(itineraryData.itinerary || []);
      setMyTripReviews(userReviewData.reviews || []);
      setGroupReviews(groupReviewData.groupReviews || []);
    } catch (err) {
      console.error("Error fetching trip data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    const { overall_rating, favorite_memory, personal_notes, activity_ratings } = review;

    if (!selectedTrip || !overall_rating || !favorite_memory.trim() || !personal_notes.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const allActivitiesRated = Object.values(activity_ratings).every((val) => val > 0);
    if (!allActivitiesRated) {
      alert("Please rate all activities.");
      return;
    }

    try {
      const res = await fetch("/api/submitTripReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripID: selectedTrip,
          userID: currentUser.uid,
          ...review,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 Review submitted successfully!");
        setSelectedTrip(null);
        setReview({
          overall_rating: 0,
          favorite_memory: "",
          personal_notes: "",
          activity_ratings: {},
        });
      } else {
        alert(data.error || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getActivityRating = (userID, activityID) => {
    const userReview = groupReviews.find((r) => r.user_id === userID);
    if (!userReview?.activity_ratings) return null;
    const rating = userReview.activity_ratings.find((a) => a.activity_id === activityID);
    return rating ? Number(rating.rating) : null;
  };

  return (
    <Container maxWidth="md" sx={{ pb: 28, pt: 4 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        📝 Trip Reviews
      </Typography>

      <Box mb={3}>
        <Typography variant="subtitle1">
          ✈️ Select a completed trip to leave or view feedback:
        </Typography>
        <Select
          fullWidth
          value={selectedTrip || ""}
          onChange={(e) => handleTripChange(e.target.value)}
        >
          {completedTrips.map((trip) => (
            <MenuItem key={trip.id} value={trip.id}>
              {trip.trip_name} ({trip.destination})
            </MenuItem>
          ))}
        </Select>
      </Box>

      {loading && <CircularProgress />}

      {selectedTrip && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Submit Your Review
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <StarIcon />
            <Rating
              max={10}
              value={review.overall_rating}
              onChange={(e, newValue) =>
                setReview({ ...review, overall_rating: newValue })
              }
            />
            <Typography>{review.overall_rating}/10</Typography>
          </Box>

          <Box mt={3}>
            <Typography variant="h6">Rate Each Activity</Typography>
            {activities.map((activity) => (
              <Box key={activity.id} mt={2} display="flex" alignItems="center" gap={1}>
                <Typography sx={{ minWidth: "120px" }}>{activity.name}</Typography>
                <Rating
                  max={10}
                  value={review.activity_ratings[activity.id] || 0}
                  onChange={(e, newValue) =>
                    setReview((prev) => ({
                      ...prev,
                      activity_ratings: {
                        ...prev.activity_ratings,
                        [activity.id]: newValue,
                      },
                    }))
                  }
                />
                <Typography>{review.activity_ratings[activity.id] || 0}/10</Typography>
              </Box>
            ))}
          </Box>

          <TextField
            label="❤️ Favorite Memory"
            fullWidth
            multiline
            sx={{ mt: 3 }}
            value={review.favorite_memory}
            onChange={(e) => setReview({ ...review, favorite_memory: e.target.value })}
          />

          <TextField
            label="🔒 Private Notes (only visible to you)"
            fullWidth
            multiline
            sx={{ mt: 2 }}
            value={review.personal_notes}
            onChange={(e) => setReview({ ...review, personal_notes: e.target.value })}
          />

          <Button
            variant="contained"
            color="success"
            sx={{mt:3, backgroundColor: "#003366", color:"white"}}
            onClick={handleReviewSubmit}
          >
            ✅ Submit Review
          </Button>
        </Paper>
      )}

      {myTripReviews.length > 0 && (
        <Box mt={5}>
          <Typography variant="h5">My Trip Review</Typography>
          {myTripReviews
            .filter((r) => r.trip_id === selectedTrip)
            .map((r) => (
              <Paper key={r.id} elevation={2} sx={{ p: 3, mt: 2, borderRadius: 2 }}>
                <Typography>🌟 Overall Rating: {r.overall_rating}/10</Typography>
                <Typography>❤️ Favorite Memory: {r.favorite_memory}</Typography>
                <Typography>
                  🔒 Private Notes: <i>{r.personal_notes}</i>
                </Typography>
              </Paper>
            ))}
        </Box>
      )}

      {groupReviews.length > 0 && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            <GroupIcon sx={{ mb: -0.5 }} /> Group Feedback
          </Typography>

          {groupReviews.map((review, idx) => (
            <Paper key={idx} elevation={1} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar>{review.first_name[0]}</Avatar>
                <Typography variant="h6">
                  {review.first_name} {review.last_name}
                </Typography>
              </Box>

              <Typography>🌟 Overall Rating: {review.overall_rating}/10</Typography>
              <Typography>❤️ Favorite Memory: {review.favorite_memory}</Typography>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2">Activity Ratings:</Typography>

              {activities.map((activity) => {
                const rating = getActivityRating(review.user_id, activity.id);
                return (
                  <Box key={activity.id} display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography sx={{ minWidth: "120px" }}>{activity.name}</Typography>
                    <Rating value={rating || 0} max={10} readOnly />
                    <Typography variant="body2">
                      {rating ? `${rating}/10` : "N/A"}
                    </Typography>
                  </Box>
                );
              })}
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}
