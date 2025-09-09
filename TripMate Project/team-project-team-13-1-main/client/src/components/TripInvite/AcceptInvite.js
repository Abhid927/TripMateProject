import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Alert } from "@mui/material";
import { useNavigate, useSearchParams} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AcceptInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");

  const handleAccept = async () => {
    if (!token || !currentUser?.uid) {
      setErrorMessage("Missing token or user not logged in.");
      return;
    }

    try {
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userID: currentUser.uid }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(data.message || "You've successfully joined the trip!");
        setTimeout(() => navigate("/trip-details"), 2000); // Redirect after 2s
      } else {
        setErrorMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleDecline = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        A user has invited you to join a trip!
      </Typography>

      {statusMessage && <Alert severity="success">{statusMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
          onClick={handleAccept}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleDecline}
        >
          Decline
        </Button>
      </Box>
    </Container>
  );
};

export default AcceptInvite;
