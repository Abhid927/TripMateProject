import * as React from 'react';
import { useAuth } from "../../../context/AuthContext";
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const ExpenseSplit = ({ trip_id, expenseAmount, userTrips, expenseSplit, setExpenseSplit, handleSubmit, splitType, setSplitType, setAnchorEl, setNext, setErrorMessages, tripMembers }) => {
    const { currentUser } = useAuth();
    const [error, setError] = React.useState("");

const [splits, setSplits] = React.useState([]);

console.log("tripMembers in ExpenseSplit:", tripMembers);
React.useEffect(() => {
    if (Array.isArray(tripMembers) && tripMembers.length > 0) {
      const initialSplits = tripMembers.map((member) => ({
        id: member.uid,
        name: member.name,
        value: member.uid === currentUser.uid ? parseFloat(expenseAmount) : 0,
      }));
      setSplits(initialSplits);
    } else {
      console.warn("No trip members found or data malformed");
    }
  }, [tripMembers, expenseAmount]);

    const handleChange = (index, value) => {
        setSplits(prevSplits => {
            const updatedSplits = [...prevSplits];
            updatedSplits[index] = { ...updatedSplits[index], value: value || "0" };
            console.log("Updated Splits:", updatedSplits); 
            return updatedSplits;
        });
    };    

    const validateSplit = () => {
        let total = splits.reduce((sum, user) => sum + (parseFloat(user.value) || 0), 0);
    
        if (splitType === "amount" && total !== parseFloat(expenseAmount)) {
            setError(`Total amount must equal ${expenseAmount}`);
            return false;
        }
        if (splitType === "percentage" && total !== 100) {
            setError("Total percentage must equal 100%");
            return false;
        }
    
        setError("");
        return true;
    };
    

    const handleConfirm = () => {
        if (!validateSplit()) {
            console.log("invalid");
            return;
        }
    
        const finalSplits = splits.map(user => {
            const amount = splitType === "percentage"
                ? (parseFloat(user.value) / 100) * expenseAmount
                : parseFloat(user.value);
            console.log(`User ${user.id} - Amount: ${amount}`);
            return {
                userID: user.id,
                amount: amount
            };
        });        
    
        const updatedExpenseSplit = finalSplits.reduce((acc, user) => {
            acc[user.userID] = user.amount;
            return acc;
        }, {});
    
        console.log("Final expense split:", updatedExpenseSplit);
        setExpenseSplit(updatedExpenseSplit);
        };   
    

    return (
        <Box>
            {/* Expense Amount and Split Type in One Line */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ fontWeight: "bold" }}>Expense Amount: ${expenseAmount}</Box>
                <Select value={splitType} onChange={(e) => setSplitType(e.target.value)} size="small">
                    <MenuItem value="amount">Amount</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                </Select>
            </Box>
            <Box
                sx={{
                    backgroundColor: 'white',
                    height: '200px',
                    overflowY: 'auto',
                    border: '3px solid black',
                    borderRadius: 1,
                    ml: 4,
                    mr: 3,
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>{splitType === "amount" ? "Amount ($)" : "Percentage (%)"}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {splits.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={user.value}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {error && <Box sx={{ color: "red", mt: 1 }}>{error}</Box>}

            <Box sx={{ display: "flex", justifyContent: "center", alignContent: 'center', mt: 2 }}>
                <Button sx={{mr: 2}} variant="contained" color="primary" onClick={handleConfirm}>Submit</Button>
                <Button variant="outlined" color="error" onClick={() => {setAnchorEl(null);setNext(false);setErrorMessages({});}}>Cancel</Button>
            </Box>
        </Box>
    );
};

export default ExpenseSplit;