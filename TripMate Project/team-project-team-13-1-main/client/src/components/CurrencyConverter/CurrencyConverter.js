import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(null);

  const API_URL = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
      setCurrencies(Object.keys(response.data.rates));
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const convertCurrency = async () => {
    try {
      const response = await axios.get(API_URL);
      const exchangeRate = response.data.rates[toCurrency];
      setConvertedAmount((amount * exchangeRate).toFixed(2));
    } catch (error) {
      console.error("Error converting currency:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 2 }}>
        <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} fullWidth>
          {currencies.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </Select>

        <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} fullWidth>
          {currencies.map((currency) => (
            <MenuItem key={currency} value={currency}>
              {currency}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Button variant="contained" color="primary" onClick={convertCurrency} sx={{mt:3, backgroundColor: "#003366"}}>
        Convert
      </Button>

      {convertedAmount !== null && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          Converted Amount: {convertedAmount} {toCurrency}
        </Typography>
      )}
    </Box>
  );
};

export default CurrencyConverter;
