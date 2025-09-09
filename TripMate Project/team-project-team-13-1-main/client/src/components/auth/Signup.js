import React, { useRef, useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const navigate = useNavigate();

  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  const handleEmailChange = (event) => {
    const value = event.target.value;
    
    if (isValidEmail(value)) {
      setEmailError(false);
      setEmailErrorMessage('');
    } else {
      setEmailError(true);
      setEmailErrorMessage('Enter a valid email');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValidEmail(emailRef.current.value)){
      return setError("Please enter a valid email.")
    } else if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    } else if (passwordRef.current.value.length < 8){
      return setError("Password must be 8 characters or longer.")
    }

    try {
      setError("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      navigate("/create-profile");
      //TODO navigate to profile creation
    } catch(error) {
      console.error(error);
      if (error.message === "Firebase: Error (auth/email-already-in-use)."){
        setError("Email already in use.")
      } else {
        setError("Failed to create an account.")
      }
    }

    setLoading(false);
  }

  return (
    <>
      <Card sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 2 }}> {/* MUI card styling */}
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42' }}>
            Sign Up
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              inputRef={emailRef}
              onChange={handleEmailChange}
              error={emailError}
              helperText={emailError ? emailErrorMessage : ""}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              inputRef={passwordRef}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password Confirmation"
              type="password"
              inputRef={passwordConfirmRef}
              required
              fullWidth
              margin="normal"
            />
            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#003366' }}
            >
              Sign Up
            </Button>
          </form>
        </CardContent>
      </Card>
      <Typography align="center" sx={{ mt: 2 }}>
        Already have an account? <Link to="/login" style={{ textDecoration: "none" }}>Log In</Link>
      </Typography>
    </>
  );
}
