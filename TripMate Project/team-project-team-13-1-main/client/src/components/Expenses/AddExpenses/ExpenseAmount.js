import * as React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';


const ExpenseAmount = (props) => {

  return (
    <>
      <FormControl fullWidth>
        <TextField 
          id="expense-amount"
          label="Amount" 
          variant="outlined"
          type="text"
          onChange={props.handleExpenseAmount}
          value={props.expenseAmount}
          />
        {props.error && <Typography variant="body2" color="error" mt="5px">{props.error}</Typography>}
      </FormControl>
    </>
  );
}

export default ExpenseAmount;