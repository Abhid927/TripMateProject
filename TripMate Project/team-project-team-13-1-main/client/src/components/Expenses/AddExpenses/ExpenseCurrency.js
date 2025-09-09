import * as React from 'react';
import { currencies } from "../../../constants/currencies";

import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";


const ExpenseCurrency = (props) => {

  return (
    <>
      <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
            label="Currency" 
            value={props.expenseCurrency}
            onChange={props.handleExpenseCurrency}
            >
            {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                {currency.name} ({currency.code})
                </MenuItem>
            ))}
            </Select>
            {props.error && <Typography variant="body2" color="error" mt="5px">{props.error}</Typography>}
        </FormControl>
    </>
  );
}

export default ExpenseCurrency;