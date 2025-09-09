import * as React from 'react';
import { useAuth } from "../../../context/AuthContext";

import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const ExpenseUser = ({ expenseUser, handleExpenseUser, error, tripMembers }) => {
  const { currentUser } = useAuth();

  return (
    <FormControl fullWidth>
      <InputLabel>Purchaser</InputLabel>
      <Select
  label="Purchaser"
  value={expenseUser}
  onChange={handleExpenseUser}
>
  <MenuItem key={currentUser.uid} value={currentUser.uid}>
    You
  </MenuItem>

  {tripMembers
    .filter((member) => member.uid !== currentUser.uid)
    .map((member) => (
      <MenuItem key={member.uid} value={member.uid}>
        {member.name}
      </MenuItem>
  ))}
</Select>

      {/* Error display */}
      {error && (
        <Typography variant="body2" color="error" mt="5px">
          {error}
        </Typography>
      )}
    </FormControl>
  );
};

export default ExpenseUser;