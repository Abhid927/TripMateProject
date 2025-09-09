import React from 'react';

import AddExpense from './AddExpense';
import ViewExpense from './ViewExpense';
import Breakdown from './Breakdown';

import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

document.body.style.backgroundColor = "#F4F7FA"; // Light background for the page

const Expenses = (props) => {

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // User Information
    const [trip_id, setTrip] = React.useState("");
    const [userTrips, setTrips] = React.useState([])
    const [u_id, setUser] = React.useState("");
    const [expenses, setExpenses] = React.useState([]);
    const [viewExpense, setView] = React.useState([]);

    // Triggers
    const [open, setOpen] = React.useState(false);
    const [edit, setEdit] = React.useState(false);

    // Errors
    const [tripError, setTripError] = React.useState(false);


    React.useEffect(() => {
        if (!currentUser) {
          navigate("/login");
          return;
        }
    
        const fetchTrips = async () => {
          try {
            const response = await fetch("/api/getUserTrips", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userID: currentUser.uid }),
            });
    
            const data = await response.json();
            if (response.ok) {
              setTrips(data.trips);
              setTrip(data.trips.length > 0 ? data.trips[0].id : "");
            } else {
              console.error("Error fetching trips:", data.error);
            }
          } catch (error) {
            console.error("Error:", error);
          } 
        };
    
        fetchTrips();
      }, [currentUser, navigate]);


    React.useEffect(() => {
        if (currentUser?.uid) {
            setUser(currentUser.uid);
        }
    }, [currentUser]);

    const handleOpen = (expense) => {
        setView(expense);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setView(null);
        setEdit(false)
    };

    const handleTripSelection = (event) => {
        setTrip(event.target.value)
    };

    const handleBreakdown = (event) => {
        navigate(`/expenses/${trip_id}`, {
            state: { u_id, trip_id, userTrips}
        });
    };

    const handleExpenses = async () => {
        try {
            const expenses = await callApiGetExpenses();
            console.log("callApiGetExpenses returned: ", expenses);
            setExpenses(Array.isArray(expenses) ? expenses : []);
        } catch (error) {
            console.error("Error calling API:", error);
        }
    };
    
    const callApiGetExpenses = async () => {
        const url = '/api/getExpenses';

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trip_id: trip_id,
                u_id: u_id
            })
        });

        if (!response.ok) {
            throw new Error(`error! status: ${response.status}`);
        }

        const body = await response.json();
        console.log("API Response:", body);
        return JSON.parse(body.express); // The correct property to access the data
    };

    React.useEffect(() => {
        handleExpenses();
    }, [trip_id]);

    const handleEdit = () => {
        setEdit(true);
    };

    return (
        <div>
            {/* Title */}
            <Box sx={{ p: 4, fontFamily: 'Roboto', color: 'black', backgroundColor: '#F7F9FC'}}>
                <Typography variant="h4" color="inherit" noWrap fontWeight='bold'>
                    EXPENSES
                    <Select
                        label="Trip"
                        value={trip_id}
                        onChange={handleTripSelection}
                        sx={{
                            minWidth: 200,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            boxShadow: 1,
                            ml: 3,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                        }}
                    >
                   {[...new Set(userTrips.map((trip) => trip.id))]
                        .map((uniqueId) => {
                            const trip = userTrips.find((t) => t.id === uniqueId);
                            return (
                            <MenuItem key={trip.id} value={trip.id}>
                                {trip.trip_name}
                            </MenuItem>
                            );
                        })}
                    </Select>
                </Typography>
                {/* Error message when no trip is selected */}
                {tripError && (
                    <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                        Please select a trip to add expenses.
                    </Typography>
                )}
            </Box>

            {/* List of Expenses */}
            <Grid container spacing={3}>
                <Grid item xs={9}>
                    <Box
                        sx={{
                            backgroundColor: 'white',
                            height: '350px',
                            overflowY: 'auto',
                            border: 'black',
                            borderRadius: 2,
                            boxShadow: 2,
                            ml: 4,
                            mr: 3,
                        }}
                    >
                        <Table stickyHeader sx={{ textAlign: 'center' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Currency</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Owed</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <TableRow
                                            key={expense.exp_id}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { backgroundColor: '#f5f5f5' },
                                            }}
                                            onClick={() => handleOpen(expense)}
                                        >
                                            <TableCell align="center">{new Date(expense.exp_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                                            <TableCell align="center">{expense.exp_name}</TableCell>
                                            <TableCell align="center">{expense.u_name}</TableCell>
                                            <TableCell align="center">${expense.exp_amount}</TableCell>
                                            <TableCell align="center">{expense.currency_id}</TableCell>
                                            <TableCell align="center">${expense.exp_owed}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Typography variant="body1" textAlign="center">No expenses found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <ViewExpense 
                            u_id={u_id}
                            trip_id={trip_id}
                            userTrips={userTrips}
                            open={open}
                            handleClose={handleClose}
                            viewExpense={viewExpense}
                            edit={edit}
                            setEdit={setEdit}
                            handleEdit={handleEdit}
                            setOpen={setOpen}
                            setView={setView}
                        />
                    </Box>
                </Grid>

                {/* Buttons */}
                <Grid item xs={3}>
                    <Button
                        onClick={() => handleBreakdown()}
                        sx={{
                            backgroundColor: '#003366',
                            width: '80%',
                            mt: 1,
                            mb: 3,
                            mr: 3,
                            ml: 3,
                            p: 3,
                            border: '2px solid black',
                            color: 'white',
                            '&:hover': { backgroundColor: '#388E3C' },
                        }}
                    >
                        Breakdown
                    </Button>
                    <AddExpense 
                        u_id={u_id}
                        trip_id={trip_id}
                        userTrips={userTrips}
                        handleExpenses={handleExpenses} 
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default Expenses;
