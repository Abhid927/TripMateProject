import React, { useEffect, useRef, useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import HotelList from "./HotelList";

const HotelSearchPage = () => {
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [error, setError] = useState(null);

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${''}&callback=initMap`;
        script.async = true;
        document.head.appendChild(script);

        window.initMap = initMap;

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initMap = () => {
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: 22.54992, lng: 0 },
            zoom: 3,
            gestureHandling: "greedy",
            disableDefaultUI: true,
        });
    };

    const handleSearch = async () => {
        if (!address) {
            alert("Please enter an address.");
            return;
        }

        try {
            const response = await fetch(`/api/hotels/coord-by-address?address=${encodeURIComponent(address)}`);
            const data = await response.json();

            if (response.ok && data && data.length > 0) {
                const firstResult = data[0];
                const lat = parseFloat(firstResult.lat);
                const lon = parseFloat(firstResult.lon);

                setLatitude(lat);
                setLongitude(lon);
                setSearchTriggered(true);
                setError(null);

                if (mapRef.current) {
                    mapRef.current.setCenter({ lat, lng: lon });
                    mapRef.current.setZoom(12);
                }
            } else {
                setError("Unable to fetch coordinates for the given address.");
                setSearchTriggered(false);
            }
        } catch (err) {
            setError("An error occurred while fetching the coordinates.");
            setSearchTriggered(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42' }}>
                Hotel Search
            </Typography>

            <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "400px", marginBottom: "20px" }}
            ></div>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Address"
                    variant="outlined"
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                        setSearchTriggered(false);
                    }}
                    fullWidth
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: 1,
                        '& .MuiInputBase-root': {
                            padding: '10px 14px',
                        },
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}

                    sx={{
                        backgroundColor: '#003366',
                        '&:hover': { backgroundColor: '#002a4c' },
                        padding: '10px 20px',
                        borderRadius: 2,
                        width: '550px'
                    }}
                >
                    Search
                </Button>
            </Box>

            {error && <Typography color="error">{error}</Typography>}

            {searchTriggered && latitude && longitude && (
                <HotelList
                    latitude={latitude}
                    longitude={longitude}
                    map={mapRef.current}
                />
            )}
        </Container>
    );
};

export default HotelSearchPage;
