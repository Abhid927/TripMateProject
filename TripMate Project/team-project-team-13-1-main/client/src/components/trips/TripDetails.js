"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Box,
  Collapse,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Checkbox,
  Chip,
} from "@mui/material"
import {
  Bookmark,
  BookmarkBorder,
  Delete,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ThumbUp,
  ThumbDown,
  Refresh,
  Edit,
  Add,
  CalendarMonth,
  Notifications,
  Place,
  AccessTime,
  LocationOn,
  Check,
  Close,
} from "@mui/icons-material"

const TripDetails = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [updatedTrip, setUpdatedTrip] = useState(null)
  const [expandedTrip, setExpandedTrip] = useState(null) // Track only one expanded trip
  const [itinerary, setItinerary] = useState({})
  const [newActivity, setNewActivity] = useState({ name: "", date: "", time: "", location: "", category: "" })
  const [showAddActivity, setShowAddActivity] = useState({})
  const [selectedActivities, setSelectedActivities] = useState([])
  const [editingActivity, setEditingActivity] = useState(null)
  // Changed from array to object to store suggestions per trip
  const [suggestedPlaces, setSuggestedPlaces] = useState({})
  // Changed from boolean to object to track visibility per trip
  const [showSuggestedPlaces, setShowSuggestedPlaces] = useState({})
  // State for saved recommendations
  const [savedRecommendations, setSavedRecommendations] = useState([])
  // State for notification
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  // Track which trips have their saved recommendations visible
  const [showSavedRecommendationsForTrip, setShowSavedRecommendationsForTrip] = useState({})
  // Track which recommendations are currently being voted on
  const [votingInProgress, setVotingInProgress] = useState({})
  // Track if we're refreshing vote counts
  const [refreshingVotes, setRefreshingVotes] = useState(false)

  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false)

  // Modify the fetchSavedRecommendations function to also get vote counts
  const fetchSavedRecommendations = async () => {
    if (!currentUser || !currentUser.uid) return

    setIsFetchingRecommendations(true)

    try {
      // Modified to include userID as query parameter to get vote information
      const response = await fetch(`/api/getSavedRecommendations/${currentUser.uid}?userID=${currentUser.uid}`)
      const data = await response.json()
      if (response.ok) {
        console.log("Fetched saved recommendations with votes:", data)
        setSavedRecommendations(data)
      } else {
        console.error("Error fetching saved recommendations:", data.error)
      }
    } catch (error) {
      console.error("Error fetching saved recommendations:", error)
    } finally {
      setIsFetchingRecommendations(false)
    }
  }

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/getUserTrips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID: currentUser.uid }),
        })

        const data = await response.json()
        if (response.ok) {
          setTrips(data.trips)
        } else {
          console.error("Error fetching trips:", data.error)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
    // Fetch saved recommendations
    fetchSavedRecommendations()
  }, [currentUser, navigate])

  // Function to check if a recommendation is saved
  const isRecommendationSaved = (recommendation, tripId) => {
    return savedRecommendations.some((saved) => saved.name === recommendation.name && saved.trip_id === tripId)
  }

  // Get saved recommendations for a specific trip
  const getSavedRecommendationsForTrip = (tripId) => {
    return savedRecommendations.filter((rec) => rec.trip_id === tripId)
  }

  // Group suggestions by category
  const groupSuggestionsByCategory = (suggestions) => {
    return suggestions.reduce((groups, suggestion) => {
      const category = suggestion.category || "Other"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(suggestion)
      return groups
    }, {})
  }

  // Handle vote (upvote, downvote, or reset vote)
  const handleVote = async (tripID, recommendationID, voteValue) => {
    if (!currentUser || !currentUser.uid) {
      setNotification({
        open: true,
        message: "You must be logged in to vote",
        severity: "error",
      })
      return
    }

    setVotingInProgress((prev) => ({ ...prev, [recommendationID]: true }))

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: currentUser.uid,
          tripID,
          recommendationID,
          voteValue,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the vote count in the UI
        setSuggestedPlaces((prev) => {
          const updatedPlaces = { ...prev }
          if (updatedPlaces[tripID]) {
            updatedPlaces[tripID] = updatedPlaces[tripID].map((place) => {
              if (place.id === recommendationID) {
                console.log(
                  `Updating vote for ${place.name}: Total votes = ${data.totalVotes}, User vote = ${data.userVote}`,
                )
                return {
                  ...place,
                  total_votes: data.totalVotes,
                  user_vote: data.userVote || 0,
                }
              }
              return place
            })
          }
          return updatedPlaces
        })

        setNotification({
          open: true,
          message: `Your vote has been recorded. Total votes: ${data.totalVotes}`,
          severity: "success",
        })
      } else {
        setNotification({
          open: true,
          message: data.error || "Failed to submit your vote",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error submitting vote:", error)
      setNotification({
        open: true,
        message: "An error occurred while submitting your vote",
        severity: "error",
      })
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [recommendationID]: false }))
    }
  }

  const sendActivityReminder = async () => {
    if (!currentUser || !currentUser.uid) {
      alert("Error: No logged-in user found. Please log in again.")
      return
    }

    const requestBody = {
      userID: currentUser.uid,
      userEmail: currentUser.email,
    }

    try {
      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        alert("If you have any upcoming activities in the next 24 hours, a reminder has been sent successfully!")
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Failed to send the reminder. Please try again.")
    }
  }

  const toggleItinerary = async (tripID) => {
    // If the trip is already expanded, collapse it
    // If a different trip is clicked, collapse the current one and expand the new one
    if (expandedTrip === tripID) {
      setExpandedTrip(null)
    } else {
      setExpandedTrip(tripID)

      // Fetch itinerary data if not already loaded
      if (!itinerary[tripID]) {
        const response = await fetch(`/api/getItinerary/${tripID}`)
        const data = await response.json()
        setItinerary((prev) => ({ ...prev, [tripID]: data.itinerary || [] }))
      }
    }

    // Hide suggested places when toggling itinerary
    setShowSuggestedPlaces((prev) => ({
      ...prev,
      [tripID]: false,
    }))
  }

  const toggleAddActivity = (tripID) => {
    setShowAddActivity((prev) => ({
      ...prev,
      [tripID]: !prev[tripID],
    }))
  }

  // Toggle saved recommendations visibility for a specific trip
  const toggleSavedRecommendationsForTrip = (tripID) => {
    setShowSavedRecommendationsForTrip((prev) => ({
      ...prev,
      [tripID]: !prev[tripID],
    }))
  }

  // Update the fetchSuggestedPlaces function to include tripID when fetching recommendations
  const fetchSuggestedPlaces = async (destination, tripID) => {
    try {
      // Add userID and tripID as query parameters
      const response = await fetch(`/api/getSuggestedPlaces/${destination}?userID=${currentUser.uid}&tripID=${tripID}`)
      const data = await response.json()

      if (response.ok) {
        console.log("Fetched trip-specific suggestions:", data.recommendations) // For debugging
        setSuggestedPlaces((prev) => ({
          ...prev,
          [tripID]: data.recommendations || [], // Save suggestions for the current trip
        }))

        // Toggle visibility for this specific trip
        setShowSuggestedPlaces((prev) => {
          const newState = { ...prev }
          // Hide for all trips first
          Object.keys(newState).forEach((id) => {
            newState[id] = false
          })
          // Then show only for this trip
          newState[tripID] = !prev[tripID]
          return newState
        })
      } else {
        console.error("Error fetching suggested places:", data.error)
        setNotification({
          open: true,
          message: data.error || "Failed to fetch suggested places",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error fetching suggested places:", error)
      setNotification({
        open: true,
        message: "An error occurred while fetching suggested places",
        severity: "error",
      })
    }
  }

  // Update refreshVoteCounts to include tripID parameter
  const refreshVoteCounts = async (destination, tripID) => {
    if (!currentUser || !currentUser.uid) return

    setRefreshingVotes(true)

    try {
      // Include tripID when fetching updated vote counts
      const response = await fetch(`/api/getSuggestedPlaces/${destination}?userID=${currentUser.uid}&tripID=${tripID}`)
      const data = await response.json()

      if (response.ok) {
        console.log("Refreshed vote counts for trip", tripID, ":", data.recommendations)

        // Update the vote counts in the UI
        setSuggestedPlaces((prev) => {
          const updatedPlaces = { ...prev }
          if (updatedPlaces[tripID] && data.recommendations) {
            // Create a lookup for the new vote data
            const voteLookup = data.recommendations.reduce((acc, rec) => {
              acc[rec.id] = {
                user_vote: rec.user_vote || 0,
                total_votes: rec.total_votes || 0,
              }
              return acc
            }, {})

            // Update the vote information in our existing places
            updatedPlaces[tripID] = updatedPlaces[tripID].map((place) => {
              if (voteLookup[place.id]) {
                return {
                  ...place,
                  user_vote: voteLookup[place.id].user_vote,
                  total_votes: voteLookup[place.id].total_votes,
                }
              }
              return place
            })
          }
          return updatedPlaces
        })

        // Also refresh saved recommendations to update their vote counts
        await fetchSavedRecommendations()

        setNotification({
          open: true,
          message: "Vote counts have been refreshed with the latest data for this trip",
          severity: "success",
        })
      } else {
        console.error("Error refreshing vote counts:", data.error)
        setNotification({
          open: true,
          message: data.error || "Failed to refresh vote counts",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error refreshing vote counts:", error)
      setNotification({
        open: true,
        message: "Error refreshing vote counts",
        severity: "error",
      })
    } finally {
      setRefreshingVotes(false)
    }
  }

  // Function to save a recommendation
  const saveRecommendation = async (recommendation, tripID) => {
    if (!currentUser || !currentUser.uid) {
      setNotification({
        open: true,
        message: "You must be logged in to save recommendations",
        severity: "error",
      })
      return
    }

    try {
      const response = await fetch("/api/saveRecommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: currentUser.uid,
          tripID: tripID,
          location: recommendation.location || tripID.destination,
          category: recommendation.category || "Sightseeing",
          name: recommendation.name,
          description: recommendation.description || "No description available",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Add the newly saved recommendation to the state
        setSavedRecommendations((prev) => [
          ...prev,
          {
            user_id: currentUser.uid,
            trip_id: tripID,
            location: recommendation.location || tripID.destination,
            category: recommendation.category || "Sightseeing",
            name: recommendation.name,
            description: recommendation.description || "No description available",
          },
        ])

        setNotification({
          open: true,
          message: "Recommendation saved successfully!",
          severity: "success",
        })
      } else {
        setNotification({
          open: true,
          message: data.error || "Failed to save recommendation",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error saving recommendation:", error)
      setNotification({
        open: true,
        message: "An error occurred while saving the recommendation",
        severity: "error",
      })
    }
  }

  // Function to unsave a recommendation
  const unsaveRecommendation = async (recommendation, tripID) => {
    if (!currentUser || !currentUser.uid) return

    try {
      const response = await fetch("/api/unsaveRecommendation", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: currentUser.uid,
          tripID: tripID,
          name: recommendation.name,
        }),
      })

      if (response.ok) {
        // Remove the unsaved recommendation from the state
        setSavedRecommendations((prev) =>
          prev.filter((saved) => !(saved.name === recommendation.name && saved.trip_id === tripID)),
        )

        setNotification({
          open: true,
          message: "Recommendation removed from saved list",
          severity: "success",
        })
      } else {
        const data = await response.json()
        setNotification({
          open: true,
          message: data.error || "Failed to remove recommendation",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error unsaving recommendation:", error)
      setNotification({
        open: true,
        message: "An error occurred while removing the recommendation",
        severity: "error",
      })
    }
  }

  const handleAddActivity = async (tripID) => {
    if (!newActivity.name || !newActivity.date || !newActivity.time || !newActivity.category) {
      alert("Please fill in all required fields.")
      return
    }

    // Find the trip by ID to get its start and end date
    const selectedTrip = trips.find((trip) => trip.id === tripID)
    if (!selectedTrip) {
      alert("Error: Trip not found.")
      return
    }

    const activityDate = new Date(newActivity.date)
    const tripStartDate = new Date(selectedTrip.start_date)
    const tripEndDate = new Date(selectedTrip.end_date)

    if (activityDate < tripStartDate || activityDate > tripEndDate) {
      alert(`Error: Activities must be between ${selectedTrip.start_date} and ${selectedTrip.end_date}.`)
      return
    }

    try {
      const response = await fetch("/api/addActivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newActivity, tripID, userID: currentUser.uid }),
      })

      const data = await response.json()

      if (response.ok) {
        setItinerary((prev) => ({ ...prev, [tripID]: [...prev[tripID], newActivity] }))
        setNewActivity({ name: "", date: "", time: "", location: "", category: "" })
        setShowAddActivity((prev) => ({ ...prev, [tripID]: false }))
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleEditClick = async (trip) => {
    try {
      const response = await fetch(`/api/getTrip/${trip.id}`)
      const data = await response.json()

      if (response.ok) {
        setSelectedTrip(trip)
        setUpdatedTrip({
          ...trip,
          tripID: trip.id,
          trip_name: data.trip_name,
          start_date: data.start_date.split("T")[0], // Auto-fill start date
          end_date: data.end_date.split("T")[0], // Auto-fill end date
          destination: data.destination,
        })
        setIsEditing(true)
      } else {
        console.error("Error fetching trip details:", data.error)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleSaveChanges = async () => {
    if (!updatedTrip.trip_name || !updatedTrip.start_date || !updatedTrip.end_date || !updatedTrip.destination) {
      alert("All fields are required. Please fill out all fields before saving.")
      return
    }

    if (new Date(updatedTrip.start_date) > new Date(updatedTrip.end_date)) {
      alert("End date cannot be earlier than the start date.")
      return
    }

    const changes = []
    if (updatedTrip.trip_name !== selectedTrip.trip_name)
      changes.push(`Trip Name: ${selectedTrip.trip_name} ➝ ${updatedTrip.trip_name}`)
    if (updatedTrip.start_date !== selectedTrip.start_date)
      changes.push(`Start Date: ${selectedTrip.start_date} ➝ ${updatedTrip.start_date}`)
    if (updatedTrip.end_date !== selectedTrip.end_date)
      changes.push(`End Date: ${selectedTrip.end_date} ➝ ${updatedTrip.end_date}`)
    if (updatedTrip.destination !== selectedTrip.destination)
      changes.push(`Destination: ${selectedTrip.destination} ➝ ${updatedTrip.destination}`)

    // Show review prompt
    const confirmMessage = `Please review your changes before saving:

${changes.join("\n")}

Do you want to proceed?`
    if (!window.confirm(confirmMessage)) {
      return // User clicked "Cancel", so stop the function
    }

    try {
      const response = await fetch("/api/updateTrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTrip),
      })

      const data = await response.json()

      if (response.ok) {
        setTrips(trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)))
        setIsEditing(false)
        setSelectedTrip(null)
        alert("Your trip details have been successfully updated!")
      } else {
        console.error("Error updating trip:", data.error)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedTrip(null)
  }

  const handleBulkDelete = async (tripID) => {
    if (selectedActivities.length === 0) {
      alert("No activities selected for deletion.")
      return
    }

    if (!window.confirm("Are you sure you want to delete the selected activities?")) {
      return
    }

    try {
      for (const activityID of selectedActivities) {
        await fetch(`/api/deleteActivity/${activityID}`, { method: "DELETE" })
      }

      setItinerary((prev) => ({
        ...prev,
        [tripID]: prev[tripID].filter((activity) => !selectedActivities.includes(activity.id)),
      }))

      setSelectedActivities([])
      alert("Selected activities deleted successfully!")
    } catch (error) {
      console.error("Error in bulk deletion:", error)
      alert("An error occurred while deleting")
    }
  }

  const toggleActivitySelection = (activityID) => {
    setSelectedActivities((prevSelected) =>
      prevSelected.includes(activityID)
        ? prevSelected.filter((id) => id !== activityID)
        : [...prevSelected, activityID],
    )
  }

  const handleSaveActivityChanges = async () => {
    if (!editingActivity) return

    const formattedActivity = {
      ...editingActivity,
      date: editingActivity.date.split("T")[0], //make sure data displayed in proper format
      time: editingActivity.time.length === 5 ? `${editingActivity.time}:00` : editingActivity.time, //make sure time displayed in proper format
    }

    const existingActivities = itinerary[expandedTrip] || []

    // check if any overlap w other activites
    const hasConflict = existingActivities.some((activity) => {
      const existingDate = activity.date.split("T")[0] // Normalize date
      const existingTime = activity.time.length === 5 ? `${activity.time}:00` : activity.time // Normalize time

      return (
        activity.id !== formattedActivity.id && // dont include activity being edited
        existingDate === formattedActivity.date &&
        existingTime === formattedActivity.time
      )
    })

    if (hasConflict) {
      const confirmProceed = window.confirm(
        "⚠ Warning: Another activity is already scheduled at this time! Do you still want to proceed?",
      )
      if (!confirmProceed) {
        return
      }
    }

    try {
      const response = await fetch("/api/updateActivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedActivity),
      })

      const data = await response.json()

      if (response.ok) {
        setItinerary((prev) => ({
          ...prev,
          [expandedTrip]: prev[expandedTrip].map((activity) =>
            activity.id === editingActivity.id ? formattedActivity : activity,
          ),
        }))

        setEditingActivity(null)
        alert("Activity updated successfully!")
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating activity:", error)
      alert("Failed to update the activity. Please try again.")
    }
  }

  const handleEditActivityChange = (e) => {
    const { name, value } = e.target
    setEditingActivity((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSuggestionToItinerary = async (suggestion, tripID) => {
    // If the suggestion is a saved recommendation, it might have a different structure
    const name = suggestion.name
    const location = suggestion.location || suggestion.name
    const category = suggestion.category || "Sightseeing"
    const description = suggestion.description || "No description available"

    // Set the new activity with suggestion data
    setNewActivity({
      name: name,
      date: "", // User needs to select date
      time: "", // User needs to select time
      location: location,
      category: category,
    })

    // Expand the trip itinerary section if it's not already expanded
    if (expandedTrip !== tripID) {
      // Fetch itinerary data if not already loaded
      if (!itinerary[tripID]) {
        try {
          const response = await fetch(`/api/getItinerary/${tripID}`)
          const data = await response.json()
          setItinerary((prev) => ({ ...prev, [tripID]: data.itinerary || [] }))
        } catch (error) {
          console.error("Error fetching itinerary:", error)
        }
      }

      // Set the expanded trip to this trip
      setExpandedTrip(tripID)
    }

    // Open the add activity form
    setShowAddActivity((prev) => ({
      ...prev,
      [tripID]: true,
    }))

    // Hide suggested places to focus on the itinerary
    setShowSuggestedPlaces((prev) => ({
      ...prev,
      [tripID]: false,
    }))

    // Hide saved recommendations to focus on the itinerary
    setShowSavedRecommendationsForTrip((prev) => ({
      ...prev,
      [tripID]: false,
    }))

    // Scroll to the form
    setTimeout(() => {
      const formElement = document.getElementById(`add-activity-form-${tripID}`)
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Function to toggle suggested places visibility for a specific trip
  const toggleSuggestedPlaces = (tripID) => {
    // If we're closing the suggested places, also close saved recommendations
    if (showSuggestedPlaces[tripID]) {
      setShowSavedRecommendationsForTrip((prev) => ({
        ...prev,
        [tripID]: false,
      }))
    }

    setShowSuggestedPlaces((prev) => ({
      ...prev,
      [tripID]: !prev[tripID],
    }))
  }

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case "Dining":
        return "#2575fc" // Blue
      case "Sightseeing":
        return "#2575fc" // Blue
      case "Travel":
        return "#2575fc" // Blue
      case "Entertainment":
        return "#2575fc" // Blue
      default:
        return "#2575fc" // Blue
    }
  }

  // Make the cards smaller by adjusting padding and spacing
  // Update the vote display colors based on vote count
  // Improve the buttons on the trip details page

  // Update the getVoteColor function to handle the vote colors properly
  const getVoteColor = (votes) => {
    if (votes > 0) return "#4caf50" // Green for positive votes
    if (votes < 0) return "#f44336" // Red for negative votes
    return "#000000" // Black for zero votes
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header Section - Matching the image exactly */}
      <Box
        sx={{
          textAlign: "center",
          mb: 5,
          background: "linear-gradient(90deg, #8a4bdb 0%, #2575fc 100%)",
          borderRadius: "20px",
          padding: 4,
          color: "white",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          My Trips
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            mb: 3,
          }}
        >
          Manage your trips and activities in one place
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={sendActivityReminder}
          startIcon={<Notifications />}
          sx={{
            borderRadius: "30px",
            padding: "12px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontWeight: "bold",
            backgroundColor: "white",
            color: "#8a4bdb",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.9)",
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            },
          }}
        >
          SEND ACTIVITY REMINDERS
        </Button>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" my={10}>
          <CircularProgress size={60} thickness={5} sx={{ color: "#6a11cb" }} />
          <Typography variant="h6" sx={{ mt: 3, color: "#666" }}>
            Loading your trips...
          </Typography>
        </Box>
      ) : trips.length === 0 ? (
        <Card
          elevation={3}
          sx={{
            padding: 5,
            textAlign: "center",
            borderRadius: "20px",
            backgroundColor: "#f8f9ff",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <Typography variant="h5" sx={{ color: "#6a11cb", fontWeight: 600, mb: 2 }}>
            No trips found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "#666" }}>
            Create your first trip to get started with planning your adventures!
          </Typography>
          <Button
            variant="contained"
            sx={{
              borderRadius: "30px",
              padding: "10px 24px",
              backgroundColor: "#8a4bdb",
            }}
          >
            Create New Trip
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {[...new Set(trips.map((trip) => trip.id))]
          .map((uniqueId) => {
            const trip = trips.find((t) => t.id === uniqueId);
            // Get saved recommendations for this trip
            const tripSavedRecommendations = getSavedRecommendationsForTrip(trip.id)
            const hasSavedRecommendations = tripSavedRecommendations.length > 0

            return (
              <Grid item xs={12} key={trip.id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  {/* Trip Header */}
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: "#f5f7ff",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
                          {trip.trip_name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <Place sx={{ color: "#6a11cb", mr: 1, fontSize: 20 }} />
                          <Typography variant="subtitle1" sx={{ color: "#666", fontWeight: 500 }}>
                            {trip.destination}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <CalendarMonth sx={{ color: "#6a11cb", mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            {trip.start_date.split("T")[0]} → {trip.end_date.split("T")[0]}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            justifyContent: { xs: "flex-start", md: "flex-end" },
                          }}
                        >
                          <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(trip)
                            }}
                            sx={{
                              borderRadius: "30px",
                              mb: 1,
                              borderColor: "#8a4bdb",
                              color: "#8a4bdb",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              px: 3,
                              "&:hover": {
                                borderColor: "#8a4bdb",
                                backgroundColor: "rgba(138, 75, 219, 0.05)",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            EDIT TRIP
                          </Button>
                          <Button
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleItinerary(trip.id)
                            }}
                            sx={{
                              borderRadius: "30px",
                              mb: 1,
                              backgroundColor: expandedTrip === trip.id ? "#000000" : "#8a4bdb",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              px: 3,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              "&:hover": {
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                backgroundColor: expandedTrip === trip.id ? "#333333" : "#9b5de5",
                              },
                            }}
                          >
                            {expandedTrip === trip.id ? "HIDE ITINERARY" : "TRIP ITINERARY"}
                          </Button>
                          <Button
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation()
                              fetchSuggestedPlaces(trip.destination, trip.id)
                            }}
                            sx={{
                              borderRadius: "30px",
                              mb: 1,
                              backgroundColor: showSuggestedPlaces[trip.id] ? "#000000" : "#8a4bdb",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              px: 3,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              "&:hover": {
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                backgroundColor: showSuggestedPlaces[trip.id] ? "#333333" : "#9b5de5",
                              },
                            }}
                          >
                            {showSuggestedPlaces[trip.id] ? "HIDE SUGGESTIONS" : "SUGGESTED PLACES"}
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => navigate(`/trip-calendar/${trip.id}`)}
                            sx={{
                              borderRadius: "30px",
                              mb: 1,
                              backgroundColor: "#2575fc",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              px: 3,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              "&:hover": {
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                backgroundColor: "#1c68e3",
                              },
                            }}
                          >
                            CALENDAR VIEW
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => navigate(`/trip-timeline/${trip.id}`)}
                            sx={{
                              borderRadius: "30px",
                              mb: 1,
                              backgroundColor: "#2575fc",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              px: 3,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              "&:hover": {
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                backgroundColor: "#1c68e3",
                              },
                            }}
                          >
                            TIMELINE
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Suggested Places Section */}
                  <Collapse in={showSuggestedPlaces[trip.id]}>
                    <Box sx={{ p: 3, backgroundColor: "#f8f9ff" }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#000000" }}>
                          Suggested Places for {trip.destination}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          {hasSavedRecommendations && (
                            <Button
                              variant="outlined"
                              startIcon={
                                showSavedRecommendationsForTrip[trip.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />
                              }
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSavedRecommendationsForTrip(trip.id)
                              }}
                              sx={{
                                borderRadius: "30px",
                                borderColor: "#6a11cb",
                                color: "#6a11cb",
                                "&:hover": {
                                  borderColor: "#6a11cb",
                                  backgroundColor: "rgba(106, 17, 203, 0.05)",
                                },
                              }}
                            >
                              {showSavedRecommendationsForTrip[trip.id] ? "HIDE SAVED PLACES" : "VIEW SAVED PLACES"}
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            disabled={refreshingVotes}
                            onClick={(e) => {
                              e.stopPropagation()
                              refreshVoteCounts(trip.destination, trip.id)
                            }}
                            sx={{
                              borderRadius: "30px",
                              borderColor: "#6a11cb",
                              color: "#6a11cb",
                              "&:hover": {
                                borderColor: "#6a11cb",
                                backgroundColor: "rgba(106, 17, 203, 0.05)",
                              },
                            }}
                          >
                            {refreshingVotes ? "REFRESHING..." : "REFRESH VOTES"}
                          </Button>
                        </Box>
                      </Box>

                      {/* Saved Recommendations Section */}
                      <Collapse in={showSavedRecommendationsForTrip[trip.id]}>
                        <Card
                          elevation={1}
                          sx={{
                            borderRadius: "15px",
                            border: "1px solid #e0e0e0",
                            overflow: "hidden",
                            position: "relative",
                            p: 1.5,
                            backgroundColor: "#f0f0f0", // Added grey tint to the saved recommendations section
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              mb: 2,
                              display: "flex",
                              alignItems: "center",
                              color: "#2575fc", // Changed to blue to match the new color scheme
                            }}
                          >
                            <Bookmark sx={{ mr: 1 }} />
                            Your Saved Places
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          {getSavedRecommendationsForTrip(trip.id).length > 0 ? (
                            <Grid container spacing={2}>
                              {/* Group saved recommendations by category */}
                              {Object.entries(groupSuggestionsByCategory(getSavedRecommendationsForTrip(trip.id))).map(
                                ([category, recommendations]) => (
                                  <Grid item xs={12} key={category}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 700, // Increased from 600 to 700 for bolder text
                                        color: "#000000", // Changed from blue to black
                                        mb: 2,
                                        borderBottom: `2px solid ${getCategoryColor(category)}`,
                                        paddingBottom: 1,
                                      }}
                                    >
                                      {category}
                                    </Typography>
                                    <Grid container spacing={2}>
                                      {recommendations.map((recommendation, index) => {
                                        const totalVotes = Number.parseInt(recommendation.total_votes) || 0

                                        return (
                                          <Grid item xs={12} md={6} key={index}>
                                            <Card
                                              elevation={1}
                                              sx={{
                                                borderRadius: "15px",
                                                border: "1px solid #e0e0e0",
                                                overflow: "hidden",
                                                position: "relative",
                                                p: 1.5,
                                              }}
                                            >
                                              {/* Bookmark icon */}
                                              <IconButton
                                                size="small"
                                                sx={{
                                                  position: "absolute",
                                                  top: 12,
                                                  right: 12,
                                                  color: "#2575fc",
                                                }}
                                                onClick={() => unsaveRecommendation(recommendation, trip.id)}
                                              >
                                                <Bookmark />
                                              </IconButton>

                                              {/* Title and description */}
                                              <Typography
                                                variant="subtitle1" // Changed from h5 to subtitle1 to match suggestion cards
                                                sx={{
                                                  color: "#2575fc",
                                                  fontWeight: 600,
                                                  mb: 0.5, // Reduced margin
                                                  pr: 4,
                                                }}
                                              >
                                                {recommendation.name}
                                              </Typography>
                                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {recommendation.description}
                                              </Typography>

                                              {/* Location and category */}
                                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <LocationOn sx={{ color: "#666", mr: 1, fontSize: 16 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                  {recommendation.location}
                                                </Typography>
                                              </Box>

                                              <Box sx={{ display: "flex", mb: 3 }}>
                                                <Chip
                                                  label={recommendation.category}
                                                  size="medium"
                                                  sx={{
                                                    borderRadius: "30px",
                                                    border: "1px solid #e0e0e0",
                                                    backgroundColor: "transparent",
                                                    color: "#666",
                                                    px: 1,
                                                  }}
                                                />
                                              </Box>

                                              {/* Vote count display */}
                                              <Box
                                                sx={{
                                                  p: 1, // Reduced padding
                                                  mb: 2, // Reduced margin
                                                  backgroundColor:
                                                    totalVotes > 0
                                                      ? "rgba(76, 175, 80, 0.1)"
                                                      : totalVotes < 0
                                                        ? "rgba(244, 67, 54, 0.1)"
                                                        : "rgba(0, 0, 0, 0.05)",
                                                  borderRadius: "8px",
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                {totalVotes > 0 ? (
                                                  <ThumbUp sx={{ color: "#4caf50", mr: 1, fontSize: 16 }} /> // Smaller icon
                                                ) : totalVotes < 0 ? (
                                                  <ThumbDown sx={{ color: "#f44336", mr: 1, fontSize: 16 }} /> // Smaller icon
                                                ) : null}
                                                <Typography
                                                  variant="body2" // Changed from body1 to body2
                                                  sx={{
                                                    fontWeight: 500,
                                                    color:
                                                      totalVotes > 0
                                                        ? "#4caf50"
                                                        : totalVotes < 0
                                                          ? "#f44336"
                                                          : "#000000", // Black for zero votes
                                                  }}
                                                >
                                                  Total Votes: {totalVotes > 0 ? `+${totalVotes}` : totalVotes}
                                                </Typography>
                                              </Box>

                                              {/* Action buttons */}
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  gap: 1, // Reduced gap
                                                }}
                                              >
                                                <Button
                                                  fullWidth
                                                  variant="contained"
                                                  onClick={() =>
                                                    handleAddSuggestionToItinerary(recommendation, trip.id)
                                                  }
                                                  sx={{
                                                    borderRadius: "30px",
                                                    py: 1, // Reduced padding
                                                    fontSize: "0.8rem", // Smaller font
                                                    backgroundColor: "#2575fc",
                                                    color: "white",
                                                    "&:hover": {
                                                      backgroundColor: "#1c68e3",
                                                    },
                                                  }}
                                                >
                                                  ADD TO ITINERARY
                                                </Button>
                                                <Button
                                                  fullWidth
                                                  variant="outlined"
                                                  onClick={() => unsaveRecommendation(recommendation, trip.id)}
                                                  sx={{
                                                    borderRadius: "30px",
                                                    py: 1, // Reduced padding
                                                    fontSize: "0.8rem", // Smaller font
                                                    borderColor: "#f44336",
                                                    color: "#f44336",
                                                    "&:hover": {
                                                      backgroundColor: "rgba(244, 67, 54, 0.04)",
                                                      borderColor: "#f44336",
                                                    },
                                                  }}
                                                >
                                                  UNSAVE
                                                </Button>
                                              </Box>
                                            </Card>
                                          </Grid>
                                        )
                                      })}
                                    </Grid>
                                  </Grid>
                                ),
                              )}
                            </Grid>
                          ) : (
                            <Typography variant="body1" align="center" p={3}>
                              You haven't saved any recommendations yet.
                            </Typography>
                          )}
                        </Card>
                      </Collapse>

                      {/* Suggested Places Section */}
                      {suggestedPlaces[trip.id] && suggestedPlaces[trip.id].length > 0 ? (
                        <>
                          {/* Group suggestions by category */}
                          {Object.entries(groupSuggestionsByCategory(suggestedPlaces[trip.id])).map(
                            ([category, suggestions]) => (
                              <Box key={category} mb={4}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700, // Increased from 600 to 700 for bolder text
                                    color: "#000000", // Changed from blue to black
                                    mb: 2,
                                    borderBottom: `2px solid ${getCategoryColor(category)}`,
                                    paddingBottom: 1,
                                  }}
                                >
                                  {category}
                                </Typography>
                                <Grid container spacing={2}>
                                  {suggestions.map((place, index) => {
                                    const isSaved = isRecommendationSaved(place, trip.id)
                                    const totalVotes = Number.parseInt(place.total_votes) || 0
                                    const userVote = Number.parseInt(place.user_vote) || 0
                                    const isVoting = votingInProgress[place.id] || false

                                    return (
                                      <Grid item xs={12} md={6} key={index}>
                                        {/* In the return statement, update the suggestion cards to be smaller */}
                                        {/* Find the Card component in the suggestions section and update its sx prop: */}
                                        <Card
                                          elevation={1}
                                          sx={{
                                            borderRadius: "15px",
                                            border: "1px solid #e0e0e0",
                                            overflow: "hidden",
                                            position: "relative",
                                            p: 1.5, // Further reduced padding from 2 to 1.5
                                          }}
                                        >
                                          {/* Bookmark icon */}
                                          <IconButton
                                            size="small"
                                            sx={{
                                              position: "absolute",
                                              top: 12,
                                              right: 12,
                                              color: isSaved ? "#2575fc" : "rgba(0, 0, 0, 0.54)",
                                            }}
                                            onClick={() =>
                                              isSaved
                                                ? unsaveRecommendation(place, trip.id)
                                                : saveRecommendation(place, trip.id)
                                            }
                                          >
                                            {isSaved ? <Bookmark /> : <BookmarkBorder />}
                                          </IconButton>

                                          {/* Title and description */}
                                          {/* Update the Typography components to use smaller font sizes */}
                                          <Typography
                                            variant="subtitle1" // Changed from h6 to subtitle1 for even smaller title
                                            sx={{
                                              color: "#2575fc",
                                              fontWeight: 600,
                                              mb: 0.5, // Reduced margin
                                              pr: 4,
                                            }}
                                          >
                                            {place.name}
                                          </Typography>
                                          <Typography
                                            variant="body2" // Changed from body1 to body2 for smaller description
                                            color="text.secondary"
                                            sx={{ mb: 2 }} // Reduced margin
                                          >
                                            {place.description}
                                          </Typography>

                                          {/* Location and category */}
                                          {/* Update the location and category display to be more compact */}
                                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            {/* Reduced margin */}
                                            <LocationOn sx={{ color: "#666", mr: 1, fontSize: 16 }} />
                                            {/* Smaller icon */}
                                            <Typography variant="body2" color="text.secondary">
                                              {place.location || trip.destination}
                                            </Typography>
                                          </Box>

                                          <Box sx={{ display: "flex", mb: 3 }}>
                                            <Chip
                                              label={place.category || "Sightseeing"}
                                              size="medium"
                                              sx={{
                                                borderRadius: "30px",
                                                border: "1px solid #e0e0e0",
                                                backgroundColor: "transparent",
                                                color: "#666",
                                                px: 1,
                                              }}
                                            />
                                          </Box>

                                          {/* Vote count display */}
                                          {/* Update the vote count display to use the correct colors based on vote count */}
                                          <Box
                                            sx={{
                                              p: 1, // Reduced padding
                                              mb: 2, // Reduced margin
                                              backgroundColor:
                                                totalVotes > 0
                                                  ? "rgba(76, 175, 80, 0.1)"
                                                  : totalVotes < 0
                                                    ? "rgba(244, 67, 54, 0.1)"
                                                    : "rgba(0, 0, 0, 0.05)",
                                              borderRadius: "8px",
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            {totalVotes > 0 ? (
                                              <ThumbUp sx={{ color: "#4caf50", mr: 1, fontSize: 16 }} />
                                            ) : totalVotes < 0 ? (
                                              <ThumbDown sx={{ color: "#f44336", mr: 1, fontSize: 16 }} />
                                            ) : null}
                                            <Typography
                                              variant="body2" // Smaller text
                                              sx={{
                                                fontWeight: 500,
                                                color:
                                                  totalVotes > 0 ? "#4caf50" : totalVotes < 0 ? "#f44336" : "#000000", // Black for zero votes
                                              }}
                                            >
                                              Total Votes: {totalVotes > 0 ? `+${totalVotes}` : totalVotes}
                                            </Typography>
                                          </Box>

                                          {/* Voting buttons */}
                                          {/* Update the buttons to be more compact */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 1, // Reduced gap
                                              mb: 2, // Reduced margin
                                            }}
                                          >
                                            <Button
                                              fullWidth
                                              variant={userVote === 1 ? "contained" : "outlined"}
                                              disabled={isVoting}
                                              startIcon={<ThumbUp />}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                const newVoteValue = userVote === 1 ? 0 : 1
                                                handleVote(trip.id, place.id, newVoteValue)
                                              }}
                                              sx={{
                                                borderRadius: "30px",
                                                py: 1, // Reduced padding
                                                fontSize: "0.8rem", // Smaller font
                                                color: userVote === 1 ? "white" : "#2575fc",
                                                borderColor: "#2575fc",
                                                backgroundColor: userVote === 1 ? "#2575fc" : "transparent",
                                                "&:hover": {
                                                  backgroundColor:
                                                    userVote === 1 ? "#2575fc" : "rgba(37, 117, 252, 0.04)",
                                                  borderColor: "#2575fc",
                                                },
                                              }}
                                            >
                                              UPVOTE
                                            </Button>
                                            <Button
                                              fullWidth
                                              variant={userVote === -1 ? "contained" : "outlined"}
                                              disabled={isVoting}
                                              startIcon={<ThumbDown />}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                const newVoteValue = userVote === -1 ? 0 : -1
                                                handleVote(trip.id, place.id, newVoteValue)
                                              }}
                                              sx={{
                                                borderRadius: "30px",
                                                py: 1, // Reduced padding
                                                fontSize: "0.8rem", // Smaller font
                                                color: userVote === -1 ? "white" : "#000",
                                                borderColor: "#e0e0e0",
                                                backgroundColor: userVote === -1 ? "#000" : "transparent",
                                                "&:hover": {
                                                  backgroundColor: userVote === -1 ? "#000" : "rgba(0, 0, 0, 0.04)",
                                                  borderColor: "#000",
                                                },
                                              }}
                                            >
                                              DOWNVOTE
                                            </Button>
                                          </Box>

                                          {/* Action buttons */}
                                          {/* Update the action buttons to be more compact */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 1, // Reduced gap
                                            }}
                                          >
                                            <Button
                                              fullWidth
                                              variant="contained"
                                              onClick={() => handleAddSuggestionToItinerary(place, trip.id)}
                                              sx={{
                                                borderRadius: "30px",
                                                py: 1, // Reduced padding
                                                fontSize: "0.8rem", // Smaller font
                                                backgroundColor: "#2575fc",
                                                color: "white",
                                                "&:hover": {
                                                  backgroundColor: "#1c68e3",
                                                },
                                              }}
                                            >
                                              ADD TO ITINERARY
                                            </Button>
                                            <Button
                                              fullWidth
                                              variant="outlined"
                                              onClick={() =>
                                                isSaved
                                                  ? unsaveRecommendation(place, trip.id)
                                                  : saveRecommendation(place, trip.id)
                                              }
                                              sx={{
                                                borderRadius: "30px",
                                                py: 1, // Reduced padding
                                                fontSize: "0.8rem", // Smaller font
                                                borderColor: isSaved ? "#f44336" : "#4caf50",
                                                color: isSaved ? "#f44336" : "#4caf50",
                                                "&:hover": {
                                                  backgroundColor: isSaved
                                                    ? "rgba(244, 67, 54, 0.04)"
                                                    : "rgba(76, 175, 80, 0.04)",
                                                  borderColor: isSaved ? "#f44336" : "#4caf50",
                                                },
                                              }}
                                            >
                                              {isSaved ? "UNSAVE" : "SAVE"}
                                            </Button>
                                          </Box>
                                        </Card>
                                      </Grid>
                                    )
                                  })}
                                </Grid>
                              </Box>
                            ),
                          )}
                        </>
                      ) : (
                        <Card sx={{ p: 4, borderRadius: "15px", textAlign: "center" }}>
                          <Typography sx={{ color: "#666" }}>
                            No suggested places available for this destination.
                          </Typography>
                        </Card>
                      )}
                    </Box>
                  </Collapse>

                  {/* Itinerary Section */}
                  <Collapse in={expandedTrip === trip.id}>
                    <Box sx={{ p: 3, backgroundColor: "#f8f9ff" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#000000", mb: 2 }}>
                        Trip Itinerary
                      </Typography>

                      {itinerary[trip.id] && itinerary[trip.id].length > 0 ? (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              Select activities to delete them
                            </Typography>

                            {selectedActivities.length > 0 && (
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleBulkDelete(trip.id)}
                                sx={{
                                  borderRadius: "30px",
                                  backgroundColor: "#f44336",
                                }}
                              >
                                Delete Selected ({selectedActivities.length})
                              </Button>
                            )}
                          </Box>

                          <Grid container spacing={2}>
                            {itinerary[trip.id].map((activity) => (
                              <Grid item xs={12} md={6} key={activity.id}>
                                <Card
                                  elevation={1}
                                  sx={{
                                    borderRadius: "15px",
                                    border: "1px solid #e0e0e0",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                      transform: "translateY(-2px)",
                                    },
                                    overflow: "hidden",
                                  }}
                                >
                                  {editingActivity && editingActivity.id === activity.id ? (
                                    <Box sx={{ p: 2 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#6a11cb" }}>
                                        Edit Activity
                                      </Typography>
                                      <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                          <TextField
                                            fullWidth
                                            name="name"
                                            label="Activity Name"
                                            variant="outlined"
                                            size="small"
                                            value={editingActivity.name}
                                            onChange={handleEditActivityChange}
                                            sx={{
                                              "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                              },
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                          <TextField
                                            fullWidth
                                            name="date"
                                            label="Date"
                                            type="date"
                                            variant="outlined"
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            value={editingActivity.date}
                                            onChange={handleEditActivityChange}
                                            sx={{
                                              "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                              },
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                          <TextField
                                            fullWidth
                                            name="time"
                                            label="Time"
                                            type="time"
                                            variant="outlined"
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            value={editingActivity.time}
                                            onChange={handleEditActivityChange}
                                            sx={{
                                              "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                              },
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12}>
                                          <TextField
                                            fullWidth
                                            name="location"
                                            label="Location"
                                            variant="outlined"
                                            size="small"
                                            value={editingActivity.location}
                                            onChange={handleEditActivityChange}
                                            sx={{
                                              "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                              },
                                            }}
                                          />
                                        </Grid>
                                        <Grid item xs={12}>
                                          <TextField
                                            fullWidth
                                            select
                                            name="category"
                                            label="Category"
                                            variant="outlined"
                                            size="small"
                                            value={editingActivity.category}
                                            onChange={handleEditActivityChange}
                                            sx={{
                                              "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                              },
                                            }}
                                          >
                                            <MenuItem value="Dining">Dining</MenuItem>
                                            <MenuItem value="Sightseeing">Sightseeing</MenuItem>
                                            <MenuItem value="Travel">Travel</MenuItem>
                                            <MenuItem value="Entertainment">Entertainment</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                          </TextField>
                                        </Grid>
                                      </Grid>
                                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          startIcon={<Close />}
                                          onClick={() => setEditingActivity(null)}
                                          sx={{ borderRadius: "30px" }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="contained"
                                          size="small"
                                          startIcon={<Check />}
                                          onClick={handleSaveActivityChanges}
                                          sx={{
                                            borderRadius: "30px",
                                            backgroundColor: "#8a4bdb",
                                          }}
                                        >
                                          Save Changes
                                        </Button>
                                      </Box>
                                    </Box>
                                  ) : (
                                    <>
                                      <Box
                                        sx={{
                                          p: 1,
                                          backgroundColor: getCategoryColor(activity.category),
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 500, pl: 1 }}>
                                          {activity.category}
                                        </Typography>
                                        <Checkbox
                                          checked={selectedActivities.includes(activity.id)}
                                          onChange={() => toggleActivitySelection(activity.id)}
                                          sx={{
                                            color: "white",
                                            "&.Mui-checked": {
                                              color: "white",
                                            },
                                          }}
                                        />
                                      </Box>
                                      <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                          {activity.name}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                          <CalendarMonth sx={{ color: "#6a11cb", mr: 1, fontSize: 18 }} />
                                          <Typography variant="body2">{activity.date.split("T")[0]}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                          <AccessTime sx={{ color: "#6a11cb", mr: 1, fontSize: 18 }} />
                                          <Typography variant="body2">{activity.time}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                          <LocationOn sx={{ color: "#6a11cb", mr: 1, fontSize: 18 }} />
                                          <Typography variant="body2">{activity.location || "N/A"}</Typography>
                                        </Box>
                                      </CardContent>
                                      <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          size="small"
                                          startIcon={<Edit />}
                                          onClick={() => setEditingActivity({ ...activity })}
                                          sx={{
                                            borderRadius: "30px",
                                            backgroundColor: "#8a4bdb",
                                          }}
                                        >
                                          Edit
                                        </Button>
                                      </CardActions>
                                    </>
                                  )}
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      ) : (
                        <Card sx={{ p: 4, borderRadius: "15px", textAlign: "center" }}>
                          <Typography sx={{ color: "#666" }}>
                            No activities added yet. Start planning your trip by adding activities.
                          </Typography>
                        </Card>
                      )}

                      {/* Add Activity Button */}
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={showAddActivity[trip.id] ? <KeyboardArrowUp /> : <Add />}
                          onClick={() => toggleAddActivity(trip.id)}
                          sx={{
                            borderRadius: "30px",
                            backgroundColor: showAddActivity[trip.id] ? "#000000" : "#8a4bdb",
                            px: 3,
                          }}
                        >
                          {showAddActivity[trip.id] ? "Hide Add Activity" : "Add New Activity"}
                        </Button>
                      </Box>

                      {/* Add Activity Form */}
                      <Collapse in={showAddActivity[trip.id]}>
                        <Card
                          id={`add-activity-form-${trip.id}`}
                          elevation={2}
                          sx={{
                            p: 3,
                            mt: 3,
                            borderRadius: "15px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#6a11cb", mb: 2 }}>
                            Add New Activity
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Activity Name"
                                variant="outlined"
                                value={newActivity.name}
                                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                value={newActivity.date}
                                onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Time"
                                type="time"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                value={newActivity.time}
                                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Location"
                                variant="outlined"
                                value={newActivity.location}
                                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                select
                                label="Category"
                                variant="outlined"
                                value={newActivity.category}
                                onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                  },
                                }}
                              >
                                <MenuItem value="Dining">Dining</MenuItem>
                                <MenuItem value="Sightseeing">Sightseeing</MenuItem>
                                <MenuItem value="Travel">Travel</MenuItem>
                                <MenuItem value="Entertainment">Entertainment</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                              </TextField>
                            </Grid>
                          </Grid>
                          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() =>
                                setNewActivity({ name: "", date: "", time: "", location: "", category: "" })
                              }
                              sx={{ borderRadius: "30px" }}
                            >
                              Clear Form
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleAddActivity(trip.id)}
                              sx={{
                                borderRadius: "30px",
                                backgroundColor: "#8a4bdb",
                              }}
                            >
                              Add Activity
                            </Button>
                          </Box>
                        </Card>
                      </Collapse>
                    </Box>
                  </Collapse>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Selected Trip Details */}
      {selectedTrip && (
        <Card
          elevation={3}
          sx={{
            mt: 4,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          {!isEditing ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ color: "#6a11cb", fontWeight: 600, mb: 2 }}>
                {selectedTrip.trip_name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Place sx={{ color: "#6a11cb", mr: 1 }} />
                    <Typography>
                      <strong>Destination:</strong> {selectedTrip.destination}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarMonth sx={{ color: "#6a11cb", mr: 1 }} />
                    <Typography>
                      <strong>Start Date:</strong> {selectedTrip.start_date}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarMonth sx={{ color: "#6a11cb", mr: 1 }} />
                    <Typography>
                      <strong>End Date:</strong> {selectedTrip.end_date}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => handleEditClick(selectedTrip)}
                  sx={{
                    borderRadius: "30px",
                    backgroundColor: "#8a4bdb",
                  }}
                >
                  Edit Trip Details
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ color: "#6a11cb", fontWeight: 600, mb: 3 }}>
                Edit Trip
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Trip Name"
                    variant="outlined"
                    value={updatedTrip.trip_name}
                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, trip_name: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={updatedTrip.start_date}
                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, start_date: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={updatedTrip.end_date}
                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, end_date: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Destination"
                    variant="outlined"
                    value={updatedTrip.destination}
                    onChange={(e) => setUpdatedTrip({ ...updatedTrip, destination: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
                <Button variant="outlined" onClick={handleCancelEdit} sx={{ borderRadius: "30px" }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  sx={{
                    borderRadius: "30px",
                    backgroundColor: "#8a4bdb",
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          )}
        </Card>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{
            width: "100%",
            borderRadius: "15px",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default TripDetails

