import React, { useRef, useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate("/");
    } catch {
      setError("Failed to log in");
    }

    setLoading(false);
  }

  return (
    <>
      <Card sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 2 }}> {/* MUI card styling */}
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42' }}>
            Login
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              inputRef={emailRef}
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
            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#003366'}}
            >
              Log In
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: "none" }}>Forgot Password?</Link>
          </Typography>
        </CardContent>
      </Card>
      <Typography align="center" sx={{ mt: 2 }}>
        Need an account? <Link to="/signup" style={{ textDecoration: "none" }}>Sign Up</Link>
      </Typography>
    </>
  );
}
