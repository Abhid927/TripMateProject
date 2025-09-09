import * as React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

const ExpenseDate = (props) => {
  return (
    <FormControl fullWidth>
      <TextField
        label="Date"
        type="date"
        value={props.expenseDate}
        onChange={props.handleExpenseDate}
        InputLabelProps={{ shrink: true }}
      />
        {props.error && <Typography variant="body2" color="error" mt="5px">{props.error}</Typography>}
    </FormControl>
  );
};

export default ExpenseDate;
