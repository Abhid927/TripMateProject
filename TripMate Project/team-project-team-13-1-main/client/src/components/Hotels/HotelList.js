import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, CircularProgress, Alert, Container, Grid, FormControlLabel, Checkbox, Box } from "@mui/material";

const capitalizeWords = (text) => {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const HotelList = ({ latitude, longitude, map }) => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortByPrice, setSortByPrice] = useState(false);
    const [sortByDistance, setSortByDistance] = useState(false);

    useEffect(() => {
        if (!latitude || !longitude) return;

        const fetchHotels = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/hotels?latitude=${latitude}&longitude=${longitude}`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch hotels");
                }
                const data = await response.json();
                const hotelsData = data.data || [];

                const updatedHotels = await Promise.all(hotelsData.map(async (hotel) => {
                    let price = "N/A";

                    try {
                        const priceResponse = await fetch(`/api/hotels/hotel-prices?hotelId=${hotel.hotelId}`);
                        if (priceResponse.ok) {
                            const priceData = await priceResponse.json();
                            const offer = priceData.data[0]?.offers[0];
                            if (offer && offer.price) {
                                const basePrice = offer.price.base;
                                const currency = offer.price.currency;
                                price = `${basePrice} ${currency}`;
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to fetch price for hotel ${hotel.hotelId}`, err);
                    }

                    return {
                        ...hotel,
                        price,
                    };
                }));

                if (map) {
                    hotelsData.forEach((hotel) => {
                        const hotelLat = hotel.geoCode.latitude;
                        const hotelLon = hotel.geoCode.longitude;

                        const marker = new window.google.maps.Marker({
                            position: { lat: hotelLat, lng: hotelLon },
                            map: map,
                            title: hotel.name,
                        });

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `<div><strong>${hotel.name}</strong></div>`,
                        });

                        marker.addListener("mouseover", () => {
                            infoWindow.open(map, marker);
                        });

                        marker.addListener("mouseout", () => {
                            infoWindow.close();
                        });
                    });
                }

                setHotels(updatedHotels);
            } catch (err) {
                setError(err.message || err.error || "An error occurred");
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [latitude, longitude]);

    const sortHotels = (hotels) => {
        let sortedHotels = [...hotels];
        if (sortByPrice) {
            sortedHotels = sortedHotels.sort((a, b) => {
                const priceA = a.price !== "N/A" ? parseFloat(a.price.split(" ")[0]) : Infinity;
                const priceB = b.price !== "N/A" ? parseFloat(b.price.split(" ")[0]) : Infinity;
                return priceA - priceB;
            });
        }
        if (sortByDistance) {
            sortedHotels = sortedHotels.sort((a, b) => a.distance.value - b.distance.value);
        }
        return sortedHotels;
    };

    const handleSortChange = (event) => {
        const { name, checked } = event.target;
        if (name === "price") {
            setSortByPrice(checked);
        } else if (name === "distance") {
            setSortByDistance(checked);
        }
    };

    const filteredHotels = sortHotels(hotels);

    return (
        <Container sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" gutterBottom>
                    Nearby Hotels
                </Typography>
                <Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={sortByPrice}
                                onChange={handleSortChange}
                                name="price"
                            />
                        }
                        label="Sort by Price"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={sortByDistance}
                                onChange={handleSortChange}
                                name="distance"
                            />
                        }
                        label="Sort by Distance"
                    />
                </Box>
            </Box>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2}>
                {filteredHotels.map((hotel) => (
                    <Grid item xs={12} key={hotel.hotelId}>
                        <Card sx={{ minHeight: 120 }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    <a href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name)}`} target="_blank" rel="noopener noreferrer">
                                        {capitalizeWords(hotel.name)}
                                    </a>
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    Distance from location: {hotel.distance.value}km
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    Price: {hotel.price !== "N/A" ? `${hotel.price}` : "Price not available"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default HotelList;
