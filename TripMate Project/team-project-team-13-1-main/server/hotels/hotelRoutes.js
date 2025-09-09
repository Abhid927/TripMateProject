import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

let authToken = null;
let tokenExpiration = null;

// Function to get an Amadeus Auth Token
const getAuthToken = async () => {
    if (authToken && tokenExpiration && tokenExpiration > Date.now()) {
        return authToken;
    }

    try {
        const response = await axios.post(
            "https://test.api.amadeus.com/v1/security/oauth2/token",
            `grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}`,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        authToken = response.data.access_token;
        tokenExpiration = Date.now() + response.data.expires_in * 1000;
        return authToken;
    } catch (error) {
        console.error("Error fetching auth token:", error);
        throw new Error("Failed to authenticate with Amadeus API");
    }
};

// Endpoint to get hotels by location
router.get("/", async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        const token = await getAuthToken();
        const response = await axios.get(
            "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode",
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { latitude, longitude, radius: 10 },
            }
        );

        res.json(response.data);
    } catch (error) {
        const errorMessage = error.response.data?.errors?.[0]?.detail || "Unknown error has occurred.";
        return res.status(400).json({ error: errorMessage });
    }
});

// Endpoint to get hotel prices
router.get("/hotel-prices", async (req, res) => {
    try {
        const { hotelId } = req.query;
        if (!hotelId) {
            return res.status(400).json({ error: "Hotel ID is required" });
        }

        const token = await getAuthToken();
        const response = await axios.get(
            `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        res.json(response.data);
    } catch (error) {
        const errorMessage = error.response.data?.errors?.[0]?.detail || "Unknown error has occurred.";
        res.status(400).json({ error: errorMessage });
    }
});

router.get("/coord-by-address", async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const response = await axios.get(
            `https://geocode.maps.co/search?q=${address}&api_key=${GEOCODE_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(400);
    }
});

export default router;
