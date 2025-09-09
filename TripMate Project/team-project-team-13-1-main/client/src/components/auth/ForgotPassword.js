import React, { useRef, useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for further instructions");
    } catch {
      setError("Failed to reset password");
    }

    setLoading(false);
  }

  return (
    <>
      <Card sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Password Reset
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              inputRef={emailRef}
              required
              fullWidth
              margin="normal"
            />
            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Reset Password
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            <Link to="/login" style={{ textDecoration: "none" }}>Login</Link>
          </Typography>
        </CardContent>
      </Card>
      <Typography align="center" sx={{ mt: 2 }}>
        Need an account? <Link to="/signup" style={{ textDecoration: "none" }}>Sign Up</Link>
      </Typography>
    </>
  );
}
