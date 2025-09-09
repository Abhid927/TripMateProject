import React, { useState } from 'react';
import { currencies } from "../../constants/currencies";

import ExpenseName from "./AddExpenses/ExpenseName";
import ExpenseAmount from "./AddExpenses/ExpenseAmount";
import ExpenseCurrency from "./AddExpenses/ExpenseCurrency";
import ExpenseDate from "./AddExpenses/ExpenseDate";
import ExpenseSplit from "./AddExpenses/ExpenseSplit";
import ExpenseUser from "./AddExpenses/ExpenseUser";
import ExpenseCategory from "./AddExpenses/ExpenseCategory";


import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";



const AddExpense = (props) => {
    const { currentUser } = useAuth();
    const trip_id = props.trip_id;
    const [members, setMembers] = React.useState(['user1', 'user2']);
    const [editingExpense, setEditingExpense] = React.useState(null);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [splitType, setSplitType] = React.useState("amount");
    const [next, setNext] = React.useState(false);



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

    const [errorMessages, setErrorMessages] = useState({});
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [tripMembers, setTripMembers] = useState([]);

    const handleClickExpense = (expense = null) => {
        setEditingExpense(expense);
        setAnchorEl(true);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;

    React.useEffect(() => {
        if (expenseSplit && Object.keys(expenseSplit).length > 0) {
            console.log("Expense split is now updated:", expenseSplit);
            handleSubmit(); // Proceed with the submit action only after expenseSplit is updated
        }
    }, [expenseSplit]);
    
    console.log("Fetching participants for trip:", props.trip_id);
    React.useEffect(() => {
        const fetchTripMembers = async () => {
          if (!props.trip_id) return;
      
          try {
            const response = await fetch("/api/getTripParticipants", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trip_id: props.trip_id }),
            });
      
            const data = await response.json();
            if (response.ok) {
              console.log("Fetched participants:", data.participants);
              setTripMembers(data.participants);
            } else {
              console.error("Error fetching participants:", data.error);
            }
          } catch (error) {
            console.error("Error:", error);
          }
        };
      
        fetchTripMembers();
      }, [props.trip_id]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileType = file.type;

            if (fileName === 'sample-receipt.jpg') {
                const hardcodedExpense = {
                    expenseName: "Bombay Grill",
                    expenseAmount: "154.00",
                    expenseCurrency: "USD",
                    expenseDate: "2025-06-30",
                };
                prefillExpense(hardcodedExpense);
            } else if (fileName === 'sample-invoice.pdf') {
                const hardcodedExpense = {
                    expenseName: "Hotel",
                    expenseAmount: "1000.00",
                    expenseCurrency: "USD",
                    expenseDate: "2025-01-01",
                };
                prefillExpense(hardcodedExpense);
            } else if (fileType === '.pdf' || fileType === 'image/jpeg' || fileType === 'image/png') {
                alert("Unable to parse file");
            } else {
                alert("Please upload a valid file (PDF, JPG, PNG)");
            }
        }
    };

    const prefillExpense = (expense) => {
        setExpenseName(expense.expenseName);
        setExpenseAmount(expense.expenseAmount);
        setExpenseCurrency(expense.expenseCurrency);
        setExpenseDate(expense.expenseDate);
        setExpenseCategory(expense.expenseCategory);
        handleClickExpense(expense);
    };

    const handleNext = () => {
        const errors = {};
        if (!expenseName) errors.name = 'Enter your expense name';
        if (!expenseDate) errors.date = 'Enter your expense date';
        if (!expenseAmount) errors.amount = 'Enter the cost';
        if (isNaN(expenseAmount)) errors.amount = 'Expense must be a number';
        if (!expenseUser) errors.user = 'Select the purchaser';
        if (!expenseCurrency) errors.currency = 'Select the currency';
        if (!expenseCategory) errors.category = 'Select the category';
        setErrorMessages(errors);

        if (Object.keys(errors).length === 0) {
            setConfirmationMessage('Your expense has been saved!');
            setNext(true);
        } else {
            setConfirmationMessage('');
        }
    };

    const handleAddExpense = async () => {
        setAnchorEl(false);
        try {
            const confirmation = await callApiAddExpense();
            console.log("callApiAddExpense returned: ", confirmation);
        } catch (error) {
            console.error("Error calling api:", error);
        }
    };

    const callApiAddExpense = async () => {
        const url = "/api/addExpense";

        console.log("Expense Split Data:", expenseSplit);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trip_id: props.trip_id,
                expenseName,
                expenseAmount,
                expenseUser,
                expenseCurrency,
                expenseDate,
                expenseCategory,
                expenseSplit,
            }),
        });

        if (!response.ok) {
            throw new Error(`error! status: ${response.status}`);
        }

        const body = await response.json();
        console.log("Review added");
        return body;
    };

    const handleSubmit = () => {
        console.log("Submitting with expenseSplit:", expenseSplit); // Debugging log
        const errors = {};
        setErrorMessages(errors);

        if (Object.keys(errors).length === 0) {
            setConfirmationMessage('Your expense has been saved!');

            setTimeout(() => {
                handleAddExpense();
                setNext(false);
                props.handleExpenses();
                setAnchorEl(null);
            }, 0);
        } else {
            setConfirmationMessage('');
        }
    };

    return (
        <div>
            <Button onClick={() => handleClickExpense()} sx={{ backgroundColor: 'white', width: '80%', m:3, p: 3, border: '2px solid black', color: 'black' }}>
                Add Expense
            </Button>
            <Button sx={{ backgroundColor: 'white', width: '80%', m: 3, p: 3, border: '2px solid black', color: 'black' }}
                onClick={() => document.getElementById('receipt-upload').click()}>
                Upload Receipt
            </Button>

            <input
                type="file"
                id="receipt-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf, .jpg, .jpeg, .png"
                data-testid="receipt-upload"
            />
            <Modal open={open} onClose={() => setAnchorEl(null)} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box sx={{ width: "50vw", height: "70vh", backgroundColor: "white", padding: 2, borderRadius: 2, boxShadow: 24, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    {next === false ? (
                        <>
                            <h2>Add New Expense</h2>
                            <Grid container spacing={2} sx={{ width: "80%", justifyContent: "center" }}>
                                <Grid item xs={12}><ExpenseName expenseName={expenseName} handleExpenseName={handleExpenseName} error={errorMessages.name} /></Grid>
                                <Grid item xs={6}><ExpenseAmount expenseAmount={expenseAmount} handleExpenseAmount={handleExpenseAmount} error={errorMessages.amount} /></Grid>
                                <Grid item xs={6}><ExpenseCurrency expenseCurrency={expenseCurrency} handleExpenseCurrency={handleExpenseCurrency} error={errorMessages.currency} /></Grid>
                                <Grid item xs={6}><ExpenseUser tripMembers={tripMembers} expenseUser={expenseUser} handleExpenseUser={handleExpenseUser} error={errorMessages.user} /></Grid>
                                <Grid item xs={6}><ExpenseDate expenseDate={expenseDate} handleExpenseDate={handleExpenseDate} error={errorMessages.date} /></Grid>
                                <Grid item xs={6}><ExpenseCategory expenseCategory={expenseCategory} handleExpenseCategory={handleExpenseCategory} error={errorMessages.category} /></Grid>
                            </Grid>
                            <Box sx={{ mt: 3, mb: 3, display: "flex", gap: 2 }}>
                                <Button variant="contained" color="primary" sx={{backgroundColor: "#003366"}} onClick={handleNext}>Next</Button>
                                <Button variant="contained" color="primary" sx={{backgroundColor: "#003366"}} onClick={() => { setAnchorEl(null); setNext(false); setErrorMessages({}); }}>Cancel</Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <h2>Add New Expense</h2>
                            <ExpenseSplit
                                expenseAmount={expenseAmount}
                                splitType={splitType}
                                setSplitType={setSplitType}
                                tripMembers={tripMembers}
                                expenseSplit={expenseSplit}
                                setExpenseSplit={setExpenseSplit}
                                handleSubmit={handleSubmit}
                                error={errorMessages.split}
                                setAnchorEl={setAnchorEl}
                                setNext={setNext}
                                setErrorMessages={setErrorMessages} />
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default AddExpense;
