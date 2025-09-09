import * as React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';


const ExpenseName = (props) => {

  return (
    <>
      <FormControl fullWidth>
        <TextField 
          id="expense-name"
          label="Name" 
          variant="outlined"
          type="text"
          value={props.expenseName}
          onChange={props.handleExpenseName}
        />
        {props.error && <Typography variant="body2" color="error" mt="5px">{props.error}</Typography>}
      </FormControl>
    </>
  );
}

export default ExpenseName;