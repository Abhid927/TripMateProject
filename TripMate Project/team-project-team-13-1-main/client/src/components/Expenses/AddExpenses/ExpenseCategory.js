import * as React from 'react';
import { currencies } from "../../../constants/currencies";

import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";


const ExpenseCategory = (props) => {

  const [categories, setCategories] = React.useState(['Food', 'Groceries', 'Entertainment', 'Accomodation', 'Transportation', 'Other']);
  
  
  return (
    <>
      <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
            label="Category" 
            id="expense-category"
            value={props.expenseCategory}
            onChange={props.handleExpenseCategory}
            >
            {categories.map((category) => (
                <MenuItem key={category} value={category}>
                    {category}
                </MenuItem>
            ))}
            </Select>
            {props.error && <Typography variant="body2" color="error" mt="5px">{props.error}</Typography>}
        </FormControl>
    </>
  );
}

export default ExpenseCategory;