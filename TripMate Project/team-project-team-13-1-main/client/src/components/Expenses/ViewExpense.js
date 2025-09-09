import React, { useState, useEffect } from 'react';
import { currencies } from "../../constants/currencies";
import { useAuth } from "../../context/AuthContext";

import ExpenseName from "./AddExpenses/ExpenseName";
import ExpenseAmount from "./AddExpenses/ExpenseAmount";
import ExpenseCurrency from "./AddExpenses/ExpenseCurrency";
import ExpenseDate from "./AddExpenses/ExpenseDate";
import ExpenseSplit from "./AddExpenses/ExpenseSplit";
import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const ViewExpense = (props) => {
    const { currentUser } = useAuth();
    
    const [errorMessages, setErrorMessages] = React.useState({});
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [members, setMembers] = useState(['user1', 'user2']);
    

   // Expense Name
    const [expenseName, setExpenseName] = React.useState("");
    const handleExpenseName = (event) => {
        setExpenseName(event.target.value)
        setConfirmationMessage('');
    };

    // Expense Cost
    const [expenseAmount, setExpenseAmount] = React.useState("");
    const handleExpenseAmount = (event) => {
        setExpenseAmount(event.target.value)
        setConfirmationMessage('');
    };

    // Expense Currency
    const [expenseCurrency, setExpenseCurrency] = React.useState("");
    const handleExpenseCurrency = (event) => {
        setExpenseCurrency(event.target.value)
        setConfirmationMessage('');
    };

    // Expense Date
    const [expenseDate, setExpenseDate] = React.useState("");
    const handleExpenseDate = (event) => {
        setExpenseDate(event.target.value)
        setConfirmationMessage('');
    };

    // Expense Split By
        const [expenseSplit, setExpenseSplit] = React.useState({});
        const handleExpenseSplit = (event, userID) => {
            setConfirmationMessage('');
            setExpenseSplit({
                ...expenseSplit,
                [userID]: event.target.value,
            });
        };

    // Expense User
    const [expenseUser, setExpenseUser] = React.useState("");
    const handleExpenseUser = (event) => {
        setExpenseUser(event.target.value)
        setConfirmationMessage('');
    };

    // Expense Category
    const [expenseCategory, setExpenseCategory] = React.useState("");
    const handleExpenseCategory = (event) => {
        setExpenseCategory(event.target.value)
        setConfirmationMessage('');
    };

    React.useEffect(() => {
        if (props.viewExpense) {
            setExpenseName(props.viewExpense.exp_name || "");
            setExpenseAmount(props.viewExpense.exp_amount || "");
            setExpenseCurrency(props.viewExpense.currency_id || "");
            setExpenseUser(props.viewExpense.u_id || "");
            setExpenseCategory(props.viewExpense.exp_category || "");
            if (props.viewExpense?.exp_date?.date) {
                const date = new Date(props.viewExpense.exp_date.date); // Convert to Date object
                const formattedDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
                setExpenseDate(formattedDate); // Set the formatted date
              }
        }

        // const fetchExpenseSplit = async () => {
        //     try {
        //         const response = await fetch(`/api/getExpenseSplit/${props.viewExpense.exp_id}`);
        //         if (!response.ok) {
        //             throw new Error("Failed to fetch expense split");
        //         }
        //         const data = await response.json();
        //         console.log("Fetched Expense Split:", data); // Debugging
        
        //         // Parse the response properly
        //         const expenseData = JSON.parse(data.express); 
        
        //         // Convert the array into an object with user IDs as keys and amounts as values
        //         const formattedExpenseSplit = expenseData.reduce((acc, entry) => {
        //             acc[entry.split_by] = entry.amount;
        //             return acc;
        //         }, {});
        
        //         setExpenseSplit(formattedExpenseSplit);
        //     } catch (error) {
        //         console.error("Error fetching expense split:", error);
        //     }
        // };

        if (props.viewExpense?.exp_id) {
            fetchExpenseSplit();
        }
    }, [props.viewExpense]);

    const fetchExpenseSplit = async () => {
        try {
            const response = await fetch(`/api/getExpenseSplit/${props.viewExpense.exp_id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch expense split");
            }
            const data = await response.json();
            console.log("Fetched Expense Split:", data);
    
            const expenseData = JSON.parse(data.express); 
    
            const formattedExpenseSplit = expenseData.reduce((acc, entry) => {
                acc[entry.split_by] = entry.amount;
                return acc;
            }, {});
    
            setExpenseSplit(formattedExpenseSplit);
        } catch (error) {
            console.error("Error fetching expense split:", error);
        }
    };

    const handleSaveChanges = async() => {

        try {
            const confirmation = await callApiEditExpense();
            console.log("callApiEditExpense returned: ", confirmation);
          } catch (error) {
            console.error("Error calling api:", error);
          }
        props.setEdit(false);
        props.setView(null);
        props.setOpen(false);
        };

    const callApiEditExpense = async () => {
        const url = "/api/editExpense";
    
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
                exp_id: props.viewExpense.exp_id,
                u_id : props.u_id,
                trip_id : props.trip_id,
                expenseName, 
                expenseAmount, 
                expenseCurrency, 
                expenseDate, 
                expenseSplit
          }),
        });
    
        if (!response.ok) {
          throw new Error(`error! status: ${response.status}`);
        }
    
        const body = await response.json();
        console.log("Expense edited");
        return body;
      };



    return (
        <Modal open={props.open} onClose={props.handleClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 400, backgroundColor: 'white', padding: 2, borderRadius: 2
            }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <h2>View Expense</h2>
                </Box>

                {props.edit === false ? (
                    props.viewExpense && (
                        <div>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography><b>Date:</b> {new Date(props.viewExpense.exp_date).toLocaleDateString()}</Typography>
                                    <Typography><b>Name:</b> {props.viewExpense.exp_name}</Typography>
                                    <Typography>
                                    <b>User: </b> 
                                    {props.viewExpense.u_id === currentUser.uid
                                        ? props.userTrips[0].name_on_trip
                                        : props.userTrips.find(user => user.member_on_same_trip === props.viewExpense.u_id)?.name_member_on_same_trip || props.viewExpense.u_id}
                                    </Typography>                                    
                                    <Typography><b>Category:</b> {props.viewExpense.exp_category}</Typography>
                                    <Typography><b>Amount:</b> ${props.viewExpense.exp_amount} {props.viewExpense.currency_id}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                <Typography><b>Expense Split:</b></Typography>
                                    {Object.entries(expenseSplit).length > 0 ? (
                                        Object.entries(expenseSplit).map(([user, amount]) => {
                                            console.log('Expense Split Entry:', user, amount);  // Debugging line to see if user and amount are correct
                                            
                                            // Check if the user is the current user
                                            const userName = user === currentUser.uid
                                                ? props.userTrips[0]?.name_on_trip // If the user is the current user, show the name from userTrips[0]
                                                : props.userTrips.find(u => u.member_on_same_trip === user)?.name_member_on_same_trip || user; // Otherwise, match the user to member_on_same_trip and display name_member_on_same_trip or fallback to user ID
                                            
                                            return (
                                                <Typography key={user}>
                                                    {userName}: ${amount}
                                                </Typography>
                                            );
                                        })
                                    ) : (
                                        <Typography>No expense split available.</Typography>  // Display message if no split
                                    )}
                                <Button onClick={fetchExpenseSplit}>Get Split</Button>
                            </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, display: 'flex' }}>
                                <Button onClick={() => props.setEdit(true)} sx={{ mt: 2, backgroundColor: 'black', color: 'white' }}>Edit</Button>
                                <Button onClick={props.handleClose} sx={{ mt: 2, backgroundColor: 'black', color: 'white' }}>Close</Button>
                            </Box>
                        </div>

                    )
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <ExpenseName expenseName={expenseName} handleExpenseName={setExpenseName} />
                        </Grid>
                        <Grid item xs={6}>
                            <ExpenseAmount expenseAmount={expenseAmount} handleExpenseAmount={handleExpenseAmount} />
                        </Grid>
                        <Grid item xs={6}>
                            <ExpenseCurrency expenseCurrency={expenseCurrency} handleExpenseCurrency={setExpenseCurrency} />
                        </Grid>
                        <Grid item xs={6}>
                            <ExpenseDate expenseDate={expenseDate} handleExpenseDate={setExpenseDate} />
                        </Grid>
                    </Grid>
                )}

                {props.edit === true && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={handleSaveChanges} variant="contained" color="primary">Save Changes</Button>
                        <Button onClick={props.handleClose} sx={{ mt: 2, backgroundColor: 'black', color: 'white' }}>Close</Button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default ViewExpense;
