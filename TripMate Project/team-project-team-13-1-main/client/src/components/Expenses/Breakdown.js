// import React, { useState, useEffect } from 'react';
// import { useLocation } from "react-router-dom";
// import WeeklyCalendarView from './WeeklyExpenses';


// import Modal from "@mui/material/Modal";
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import Grid from '@mui/material/Grid';
// import Typography from '@mui/material/Typography'
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
// import Paper from '@mui/material/Paper';
// import Table from '@mui/material/Table';
// import TableHead from '@mui/material/TableHead';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableRow from '@mui/material/TableRow';
// import TableContainer from '@mui/material/TableContainer';


// const Breakdown = (props) => {
//     const location = useLocation();
//     const { u_id, trip_id, userTrips} = location.state || {};

//     const [expenses, setExpenses] = useState([]);
//     const [compareTripId, setCompareTripId] = useState(null);
//     const [comparisonExpenses, setComparisonExpenses] = useState(null);
//     const [compareMode, setCompareMode] = useState(false);

//     React.useEffect(() => {
//         fetchExpenses(trip_id, setExpenses);
//         if (compareTripId) {
//             fetchExpenses(compareTripId, setComparisonExpenses);
//         }
//     }, [trip_id, compareTripId]);

//     const fetchExpenses = async (tripId, setExpensesFn) => {
//         try {
//             const response = await fetch('/api/getExpenses', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ trip_id: tripId, u_id }),
//             });
//             const data = await response.json();
//             setExpensesFn(JSON.parse(data.express));
//         } catch (error) {
//             console.error('Error fetching expenses:', error);
//         }
//     };

//     const groupExpenses = (expenses) => {
//         const grouped = {};
//         const categories = ['Groceries', 'Food', 'Entertainment', 'Accommodation', 'Other'];
//         let totalTripCost = 0;
//         let categoryTotals = { Groceries: 0, Food: 0, Entertainment: 0, Accommodation: 0, Other: 0 };
        
//         expenses.forEach(exp => {
//             totalTripCost += exp.exp_amount;
//             if (categories.includes(exp.exp_category)) {
//                 categoryTotals[exp.exp_category] += exp.exp_amount;
//             } else {
//                 categoryTotals['Other'] += exp.exp_amount;
//             }
            
//             const date = new Date(exp.exp_date).toLocaleDateString();
//             if (!grouped[date]) grouped[date] = { total: 0, categories: { ...categoryTotals } };
//             grouped[date].total += exp.exp_amount;
//             grouped[date].categories[exp.exp_category] += exp.exp_amount;
//         });
        
//         return { grouped, totalTripCost, categoryTotals };
//     };

//     const calculatePersonalExpense = (expenses) => {
//         return expenses.reduce((sum, exp) => sum + (exp.exp_owed || 0), 0);
//       };
      
//       const groupByCategory = (expenses, u_id) => {
//         const totals = { Groceries: 0, Food: 0, Entertainment: 0, Accommodation: 0, Other: 0 };
//         expenses.forEach(exp => {
//           if (exp.exp_owed && exp.u_id === u_id) {
//             const cat = totals[exp.exp_category] !== undefined ? exp.exp_category : 'Other';
//             totals[cat] += exp.exp_owed;
//           }
//         });
//         return totals;
//       };
      
//       const calculateBalances = (expenses, u_id) => {
//         const balances = {};
//         expenses.forEach(exp => {
//           if (exp.u_id !== u_id) {
//             const key = exp.u_name;
//             if (!balances[key]) balances[key] = 0;
//             balances[key] += exp.exp_owed || 0;
//           }
//         });
      
//         return Object.entries(balances).map(([user, amount]) => ({ user, amount }));
//       };      

//     const categories = ['Groceries', 'Food', 'Entertainment', 'Accommodation', 'Other'];

//     // Avoid re-calling groupExpenses multiple times, just call once here
//     const { grouped, totalTripCost, categoryTotals } = groupExpenses(expenses);
    
//     // Personal breakdown for "You"
//     const personalCategoryTotals = groupByCategory(expenses, u_id);



//     return (
//         <div style={{ padding: 20 }}>
//           <Typography variant="h4" align="center" gutterBottom>
//             {userTrips.find(trip => trip.trip_id === trip_id)?.trip_name || "Trip not found"} Summary
//           </Typography>
      
//           {/* Top section: Make heights match */}
//           <Grid container spacing={2}>
//             {/* Top Left: Totals */}
//             <Grid item xs={12} md={3}>
//               <Paper style={{ padding: 16, height: 150 }}>
//                 <Typography variant="h7">Total Expenses</Typography>
//                 <Typography variant="body1">${totalTripCost.toFixed(2)}</Typography>
//                 <Typography variant="h7" style={{ marginTop: 16 }}>Your Personal Expense</Typography>
//                 <Typography variant="body1">${calculatePersonalExpense(expenses).toFixed(2)}</Typography>
//               </Paper>
//             </Grid>
      
//             {/* Top Right: Category Breakdown Table */}
//             <Grid item xs={12} md={9}>
//               <Paper style={{ padding: 16, height: 150 }}>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell> </TableCell>
//                       {categories.map(cat => <TableCell key={cat}>{cat}</TableCell>)}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     <TableRow>
//                       <TableCell>Group</TableCell>
//                       {categories.map(cat => (
//                         <TableCell key={cat}>${categoryTotals[cat].toFixed(2)}</TableCell>
//                       ))}
//                     </TableRow>
//                     <TableRow>
//                       <TableCell>You</TableCell>
//                       {categories.map(cat => (
//                         <TableCell key={cat}>${personalCategoryTotals[cat].toFixed(2)}</TableCell>
//                       ))}
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Paper>
//             </Grid>
//           </Grid>
      
//           {/* Bottom section */}
//           <Grid container spacing={2} style={{ marginTop: 6 }}>
//             {/* Bottom Left: Owe/Owed Summary */}
//             <Grid item xs={12} md={3}>
//               <Paper style={{ m: 2, padding: 16, height: 175, overflowY: 'auto' }}>
//                 <Typography variant="h6">Owe/Owed Summary</Typography>
//                 {calculateBalances(expenses, u_id).map(({ user, amount }) => (
//                   <Typography key={user}>
//                     {user}: {amount >= 0 ? `Owes You $${amount.toFixed(2)}` : `You Owe $${Math.abs(amount).toFixed(2)}`}
//                   </Typography>
//                 ))}
//               </Paper>
//             </Grid>
      
//             <Grid item xs={12} md={9}>
//                 <Paper style={{ padding: 16, height: 175 }}>
//                     <WeeklyCalendarView expenses={expenses} />
//                 </Paper>
//             </Grid>
//           </Grid>
//         </div>
//       );           

// };

// export default Breakdown;
import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import WeeklyCalendarView from './WeeklyExpenses';

import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define the custom theme with a better font (Roboto or Poppins)
const theme = createTheme({
  typography: {
    fontFamily: ['Poppins', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    primary: {
      main: '#4BB543', // Green for Owe/Owed section
    },
    secondary: {
      main: '#E94E77', // Red for negative balance
    },
  },
});

const Breakdown = (props) => {
  const location = useLocation();
  const { u_id, trip_id, userTrips } = location.state || {};

  const [expenses, setExpenses] = useState([]);
  const [compareTripId, setCompareTripId] = useState(null);
  const [comparisonExpenses, setComparisonExpenses] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetchExpenses(trip_id, setExpenses);
    if (compareTripId) {
      fetchExpenses(compareTripId, setComparisonExpenses);
    }
  }, [trip_id, compareTripId]);

  const fetchExpenses = async (tripId, setExpensesFn) => {
    try {
      const response = await fetch('/api/getExpenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: tripId, u_id }),
      });
      const data = await response.json();
      setExpensesFn(JSON.parse(data.express));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const groupExpenses = (expenses) => {
    const grouped = {};
    const categories = ['Groceries', 'Food', 'Entertainment', 'Accommodation', 'Other'];
    let totalTripCost = 0;
    let categoryTotals = { Groceries: 0, Food: 0, Entertainment: 0, Accommodation: 0, Other: 0 };

    expenses.forEach(exp => {
      totalTripCost += exp.exp_amount;
      if (categories.includes(exp.exp_category)) {
        categoryTotals[exp.exp_category] += exp.exp_amount;
      } else {
        categoryTotals['Other'] += exp.exp_amount;
      }

      const date = new Date(exp.exp_date).toLocaleDateString();
      if (!grouped[date]) grouped[date] = { total: 0, categories: { ...categoryTotals } };
      grouped[date].total += exp.exp_amount;
      grouped[date].categories[exp.exp_category] += exp.exp_amount;
    });

    return { grouped, totalTripCost, categoryTotals };
  };

  const calculatePersonalExpense = (expenses) => {
    return expenses.reduce((sum, exp) => sum + (exp.exp_owed || 0), 0);
  };

  const groupByCategory = (expenses, u_id) => {
    const totals = { Groceries: 0, Food: 0, Entertainment: 0, Accommodation: 0, Other: 0 };
    expenses.forEach(exp => {
      if (exp.exp_owed && exp.u_id === u_id) {
        const cat = totals[exp.exp_category] !== undefined ? exp.exp_category : 'Other';
        totals[cat] += exp.exp_owed;
      }
    });
    return totals;
  };

  const calculateBalances = (expenses, u_id) => {
    const balances = {};
    expenses.forEach(exp => {
      if (exp.u_id !== u_id) {
        const key = exp.u_name;
        if (!balances[key]) balances[key] = 0;
        balances[key] += exp.exp_owed || 0;
      }
    });

    return Object.entries(balances).map(([user, amount]) => ({ user, amount }));
  };

  const categories = ['Groceries', 'Food', 'Entertainment', 'Accommodation', 'Other'];

  const { grouped, totalTripCost, categoryTotals } = groupExpenses(expenses);
  const personalCategoryTotals = groupByCategory(expenses, u_id);

  // Function to format the number with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24, backgroundColor: '#F7F9FC', borderRadius: '12px' }}>
        <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 600, color: '#2B2D42', marginBottom: '24px' }}>
          {userTrips.find(trip => trip.trip_id === trip_id)?.trip_name || "Trip Summary"}
        </Typography>

        {/* Top section: Totals and Category Breakdown */}
        <Grid container spacing={3}>
          {/* Total Expenses Section */}
          <Grid item xs={12} md={4}>
            <Paper style={{ height: 200, padding: 24, borderRadius: '12px', backgroundColor: '#D0E6F3', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" style={{ fontWeight: 600, color: '#4A4A4A' }}>Total Expenses</Typography>
              <Typography variant="h4" style={{ color: '#4BB543', fontWeight: 600 }}>{formatCurrency(totalTripCost)}</Typography>
              <Typography variant="h6" style={{ marginTop: 16, fontWeight: 600 }}>Your Personal Expense</Typography>
              <Typography variant="h5" style={{ color: '#E94E77', fontWeight: 600 }}>{formatCurrency(calculatePersonalExpense(expenses))}</Typography>
            </Paper>
          </Grid>

          {/* Category Breakdown Table */}
          <Grid item xs={12} md={8}>
            <Paper style={{ height: 200, padding: 24, borderRadius: '12px', backgroundColor: '#D0E6F3', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, color: '#2B2D42', backgroundColor: '#003366', color: 'white' }}> </TableCell>
                      {categories.map(cat => <TableCell key={cat} align="center" style={{ fontWeight: 600, color: 'white', backgroundColor: '#003366' }}>{cat}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow style={{ backgroundColor: '#F1F1F1' }}>
                      <TableCell style={{ fontWeight: 600, color: '#4A4A4A' }}>Group</TableCell>
                      {categories.map(cat => (
                        <TableCell key={cat} align="center" style={{ fontWeight: 600, color: '#4A4A4A' }}>{formatCurrency(categoryTotals[cat])}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600, color: '#4A4A4A' }}>You</TableCell>
                      {categories.map(cat => (
                        <TableCell key={cat} align="center" style={{ fontWeight: 600, color: '#4A4A4A' }}>{formatCurrency(personalCategoryTotals[cat])}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Section: Owe/Owed Summary and Calendar */}
        <Grid container spacing={3} style={{ marginTop: 24 }}>
          {/* Owe/Owed Summary */}
          <Grid item xs={12} md={4}>
            <Paper style={{ padding: 24, height: 200, borderRadius: '12px', backgroundColor: '#D0E6F3', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" style={{ fontWeight: 600, color: '#2B2D42' }}>Owe/Owed Summary</Typography>
              {calculateBalances(expenses, u_id).map(({ user, amount }) => (
                <Typography key={user} style={{ marginTop: 4, fontWeight: 600, color: amount >= 0 ? '#4BB543' : '#E94E77' }}>
                  {user}: {amount >= 0 ? `Owes You ${formatCurrency(amount)}` : `You Owe ${formatCurrency(Math.abs(amount))}`}
                </Typography>
              ))}
            </Paper>
          </Grid>

          {/* Weekly Calendar View */}
          <Grid item xs={12} md={8}>
            <Paper style={{ padding: 24, height: 200, borderRadius: '12px', backgroundColor: '#D0E6F3', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <WeeklyCalendarView expenses={expenses} />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

export default Breakdown;
