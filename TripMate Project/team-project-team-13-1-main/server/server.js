import mysql from "mysql"
import config from "../config.js"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import bodyParser from "body-parser"
import inviteRoutes from "./invites/invite.js"
import notificationsRouter from "./invites/notifications.js"
import hotelRoutes from "./hotels/hotelRoutes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 5000
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))

app.use(express.static(path.join(__dirname, "client/build")))

app.use("/api/invite", inviteRoutes)
app.use("/api", notificationsRouter)
app.use("/api/hotels", hotelRoutes)

// Route to save recommendation
app.post("/api/saveRecommendation", (req, res) => {
  const { userID, tripID, location, category, name, description } = req.body

  // Validate input data
  if (!userID || !tripID || !name) {
    return res.status(400).json({ error: "User ID, Trip ID, and Name are required" })
  }

  const connection = mysql.createConnection(config)
  const query = `
    INSERT INTO Saved_Recomendations (user_id, trip_id, location, category, name, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  const values = [
    userID,
    tripID,
    location || "",
    category || "Sightseeing",
    name,
    description || "No description available",
  ]

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error saving recommendation:", error)
      return res.status(500).json({ error: `Error saving recommendation: ${error.message}` })
    }

    console.log("Recommendation saved successfully:", results)
    res.status(201).json({ message: "Recommendation saved successfully!", id: results.insertId })
  })

  connection.end()
})

// Route to get saved recommendations for a user
app.post("/api/getSavedRecommendations", (req, res) => {
  const { userID } = req.body

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" })
  }

  const connection = mysql.createConnection(config)
  const query = "SELECT * FROM Saved_Recomendations WHERE user_id = ?"

  connection.query(query, [userID], (error, results) => {
    if (error) {
      console.error("Error fetching saved recommendations:", error)
      return res.status(500).json({ error: "Error fetching saved recommendations" })
    }

    console.log("Fetched saved recommendations:", results)
    res.status(200).json({ recommendations: results })
  })

  connection.end()
})

// Route to get saved recommendations for a user by ID
app.get("/api/getSavedRecommendations/:userID", (req, res) => {
  const { userID } = req.params
  const queryUserID = req.query.userID || userID // Use the query parameter if provided, otherwise use the path parameter

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" })
  }

  const connection = mysql.createConnection(config)

  // Improved query to get trip-specific vote counts for each saved recommendation
  const query = `
    SELECT sr.*, 
      (SELECT r.id FROM Recommendations r WHERE r.name = sr.name LIMIT 1) as recommendation_id,
      COALESCE((
        SELECT SUM(v.vote_value) 
        FROM Votes v 
        WHERE v.recommendation_id = (
          SELECT r.id FROM Recommendations r WHERE r.name = sr.name LIMIT 1
        ) AND v.trip_id = sr.trip_id
      ), 0) as total_votes,
      COALESCE((
        SELECT v.vote_value 
        FROM Votes v 
        WHERE v.recommendation_id = (
          SELECT r.id FROM Recommendations r WHERE r.name = sr.name LIMIT 1
        ) 
        AND v.user_id = ?
        AND v.trip_id = sr.trip_id
      ), 0) as user_vote
    FROM Saved_Recomendations sr
    WHERE sr.user_id = ?
  `

  connection.query(query, [queryUserID, userID], (error, results) => {
    if (error) {
      console.error("Error fetching saved recommendations:", error)
      return res.status(500).json({ error: "Error fetching saved recommendations" })
    }

    console.log("Fetched saved recommendations with trip-specific vote counts:", results)
    res.status(200).json(results)
  })

  connection.end()
})

// Route to delete a saved recommendation
app.delete("/api/unsaveRecommendation", (req, res) => {
  const { userID, tripID, name } = req.body

  if (!userID || !tripID || !name) {
    return res.status(400).json({ error: "User ID, Trip ID, and Name are required" })
  }

  const connection = mysql.createConnection(config)
  const query = "DELETE FROM Saved_Recomendations WHERE user_id = ? AND trip_id = ? AND name = ?"

  connection.query(query, [userID, tripID, name], (error, results) => {
    if (error) {
      console.error("Error removing saved recommendation:", error)
      return res.status(500).json({ error: "Error removing saved recommendation" })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Recommendation not found" })
    }

    console.log("Recommendation removed successfully:", results)
    res.status(200).json({ message: "Recommendation removed successfully!" })
  })

  connection.end()
})

app.delete("/api/deleteActivity/:activityID", async (req, res) => {
  const { activityID } = req.params

  if (!activityID) {
    return res.status(400).json({ error: "Missing activity ID." })
  }

  const connection = mysql.createConnection(config)
  const deleteActivitySQL = `DELETE FROM ItineraryActivities WHERE id = ?`

  connection.query(deleteActivitySQL, [activityID], (err, result) => {
    if (err) {
      console.error("Error deleting activity:", err)
      return res.status(500).json({ error: "Error deleting activity." })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Activity not found." })
    }
    res.json({ message: "Activity deleted successfully!" })
  })

  connection.end()
})

app.post("/api/loadUserSettings", (req, res) => {
  const connection = mysql.createConnection(config)
  const userID = req.body.userID

  const sql = `SELECT mode FROM user WHERE userID = ?`
  console.log(sql)
  const data = [userID]
  console.log(data)

  connection.query(sql, data, (error, results, fields) => {
    if (error) {
      return console.error(error.message)
    }

    const string = JSON.stringify(results)
    res.send({ express: string })
  })
  connection.end()
})

// Get User-Trip Expenses
app.post("/api/getExpenses", (req, res) => {
  const connection = mysql.createConnection(config)
  const { trip_id, u_id } = req.body

  const sql = `
    SELECT 
        E.exp_id, 
        E.u_id, 
        U.first_name as u_name,
        E.trip_id, 
        E.exp_name, 
        E.exp_date, 
        C.exp_amount, 
        E.exp_category,
        E.currency_id, 
        COALESCE(O.exp_owed, 0) AS exp_owed
    FROM Expenses E
    LEFT JOIN (
        -- Subquery to calculate total expense amount per expense
        SELECT 
            exp_id, 
            SUM(item_cost) AS exp_amount 
        FROM Receipt 
        GROUP BY exp_id
    ) C ON C.exp_id = E.exp_id
    LEFT JOIN (
        -- Subquery to calculate owed amount per user
        SELECT 
            R.exp_id, 
            SUM(RS.amount) AS exp_owed
        FROM Receipt R
        LEFT JOIN ReceiptSplit RS ON R.item_id = RS.item_id
        WHERE RS.split_by = ?
        GROUP BY R.exp_id
    ) O ON O.exp_id = E.exp_id
    LEFT JOIN UserProfile U on U.uid = E.u_id
    WHERE E.trip_id = ?
    ORDER BY E.exp_date, E.exp_name;
    `
  const data = [u_id, trip_id]
  connection.query(sql, data, (error, results, fields) => {
    if (error) {
      return console.error(error.message)
    }

    const string = JSON.stringify(results)
    res.send({ express: string })
  })
  connection.end()
})

// Get Expense-Split
app.post("/api/getExpenseSplit/:exp_id", (req, res) => {
  const connection = mysql.createConnection(config)
  const { exp_id } = req.params

  const sql = `
    SELECT r.exp_id, r.item_name, r.item_cost, rs.split_by, rs.amount
    FROM Receipt r
    JOIN ReceiptSplit rs ON r.item_id = rs.item_id
    WHERE r.exp_id = ?;
    `;
    console.log(sql)
    let data = [exp_id]
    connection.query(sql, data, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log(data)
        console.log(results)
        // let string = JSON.stringify(results);
        // res.send({ express: string });
        res.json(results);
    });
    connection.end();
});

// Add Expense
app.post("/api/addExpense", (req, res) => {
  const connection = mysql.createConnection(config)
  const {
    trip_id,
    expenseName,
    expenseAmount,
    expenseUser,
    expenseCurrency,
    expenseDate,
    expenseCategory,
    expenseSplit,
  } = req.body

  // Debugging: Check the request body
  console.log("Request Body:", req.body)

  const sql = `
    INSERT INTO Expenses (u_id, trip_id, exp_name, exp_date, currency_id, exp_category) 
    VALUES (?, ?, ?, ?, ?, ?)
    `
  const data = [expenseUser, trip_id, expenseName, expenseDate, expenseCurrency, expenseCategory]

  connection.query(sql, data, (error, results, fields) => {
    if (error) {
      console.error("Error in Expenses query:", error.message)
      return res.status(500).json({ error: error.message })
    }

    console.log("Expense Insert Results:", results) // Debugging
    const exp_id = results.insertId

    const sqlReceipt = `
                INSERT INTO Receipt (exp_id, item_name, item_cost) 
                VALUES (?, ?, ?)
        `
    const receiptData = [exp_id, expenseName, expenseAmount]

    connection.query(sqlReceipt, receiptData, (error, results, fields) => {
      if (error) {
        console.error("Error in Receipt query:", error.message)
        return res.status(500).json({ error: error.message })
      }

      console.log("Receipt Insert Results:", results) // Debugging
      const item_id = results.insertId

      const sqlReceiptSplit = `
                    INSERT INTO ReceiptSplit (item_id, split_by, amount) 
                    VALUES (?, ?, ?)
            `

      // Debugging: Check the ReceiptSplit SQL statement
      console.log("SQL for ReceiptSplit:", sqlReceiptSplit)

      // Check if expenseSplit contains data
      console.log("Expense Split Data:", expenseSplit)

      if (expenseSplit && Object.entries(expenseSplit).length > 0) {
        // Process splits
        Object.entries(expenseSplit).forEach(([userID, amount]) => {
          const receiptSplitData = [item_id, userID, amount]
          console.log("Inserting ReceiptSplit:", receiptSplitData)

          connection.query(sqlReceiptSplit, receiptSplitData, (error, results) => {
            if (error) {
              console.error("Error inserting ReceiptSplit:", error.message)
            } else {
              console.log("ReceiptSplit Insert Results:", results)
            }
          })
        })

        // Respond after all queries are done
        res.json("Success!")
      } else {
        // If no splits are provided
        console.log("No splits provided.")
        res.status(400).json({ error: "No split data provided" })
      }

      connection.end()
    })
  })
})

// Edit Expense
app.post("/api/editExpense", (req, res) => {
  const connection = mysql.createConnection(config)
  const { exp_id, expenseName, expenseAmount, expenseCurrency, expenseDate, expenseSplit, user_id } = req.body

  connection.beginTransaction((err) => {
    if (err) {
      console.log("Error in transaction start: ", err)
      return res.status(500).send({ message: "Error starting transaction", error: err })
    }

    const deleteReceiptSplitSql = `
            DELETE FROM ReceiptSplit 
            WHERE item_id IN (
                SELECT item_id 
                FROM Receipt 
                WHERE exp_id = ?
            );`

    connection.query(deleteReceiptSplitSql, [exp_id], (err, result) => {
      console.log(result)
      if (err) {
        console.log("Error deleting from ReceiptSplit: ", err)
        return connection.rollback(() => {
          res.status(500).send({ message: "Error deleting from ReceiptSplit", error: err })
        })
      }

      const updateReceiptSql = `UPDATE Receipt SET item_name = ?, item_cost = ? WHERE exp_id = ?`
      connection.query(updateReceiptSql, [expenseName, expenseAmount, exp_id], (err, result) => {
        console.log(result)
        if (err) {
          console.log("Error updating Receipt: ", err)
          return connection.rollback(() => {
            res.status(500).send({ message: "Error updating Receipt", error: err })
          })
        }

        const updateExpensesSql = `UPDATE Expenses SET exp_name = ?, exp_date = ?, currency_id = ? WHERE exp_id = ?`
        connection.query(updateExpensesSql, [expenseName, expenseDate, expenseCurrency, exp_id], (err, result) => {
          console.log(result)
          if (err) {
            console.log("Error updating Expenses: ", err)
            return connection.rollback(() => {
              res.status(500).send({ message: "Error updating Expenses", error: err })
            })
          }

          // Insert new data into ReceiptSplit table for each split
          const insertReceiptSplitSql = `
                        INSERT INTO ReceiptSplit (item_id, split_by)
                        VALUES (?, ?)
                    `

          // item_id was not declared, so we need to fetch it
          const getItemIdSql = `SELECT item_id FROM Receipt WHERE exp_id = ?`
          connection.query(getItemIdSql, [exp_id], (err, itemIdResult) => {
            if (err) {
              console.log("Error getting item_id: ", err)
              return connection.rollback(() => {
                res.status(500).send({ message: "Error getting item_id", error: err })
              })
            }

            if (itemIdResult.length === 0) {
              console.log("No item found for exp_id: ", exp_id)
              return connection.rollback(() => {
                res.status(404).send({ message: "No item found for exp_id" })
              })
            }

            const item_id = itemIdResult[0].item_id

            expenseSplit.forEach((splitBy) => {
              const receiptSplitData = [item_id, splitBy]
              connection.query(insertReceiptSplitSql, receiptSplitData, (error, results, fields) => {
                console.log(results)
                if (error) {
                  console.log("Error inserting into ReceiptSplit: ", error)
                  return connection.rollback(() => {
                    res.status(500).send({ message: "Error inserting into ReceiptSplit", error: error })
                  })
                }
              })
            })

            res.status(200).send({ message: "Expense updated successfully!" })
            connection.commit((err) => {
              if (err) {
                console.log("Error committing transaction: ", err)
                return connection.rollback(() => {
                  res.status(500).send({ message: "Error committing transaction", error: err })
                })
              }
              connection.end()
            })
          })
        })
      })
    })
  })
})

// Get Trip Information for Expenses
app.post("/api/getTripInfo", (req, res) => {
  const connection = mysql.createConnection(config)

  const { userID } = req.body

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" })
  }

    let sql = `
        SELECT 
            T.id AS trip_id, 
            T.trip_name, 
            T.user_ID AS user_on_trip, 
            U.first_name AS name_on_trip,
            null AS member_on_same_trip, 
            null AS name_member_on_same_trip
        FROM TripInfo T
        LEFT JOIN UserProfile U ON T.user_ID = U.uid
        WHERE T.user_ID = ?

        UNION ALL

        SELECT 
            T.id AS trip_id, 
            T.trip_name, 
            TM1.userID AS user_on_trip, 
            U1.first_name AS name_on_trip,
            TM2.userID AS member_on_same_trip, 
            U2.first_name AS name_member_on_same_trip
        FROM TripInfo T
        LEFT JOIN TripMembers TM1 ON T.id = TM1.tripID
        LEFT JOIN TripMembers TM2 ON T.id = TM2.tripID
        LEFT JOIN UserProfile U1 ON TM1.userID = U1.uid
        LEFT JOIN UserProfile U2 ON TM2.userID = U2.uid
        WHERE TM1.userID = ? AND TM2.userID != ?;`;

    let data = [userID, userID, userID];

  connection.query(sql, data, (error, results) => {
    if (error) {
      console.error("Error fetching trips:", error)
      return res.status(500).json({ error: "Database error" })
    }
    res.json({ trips: results })
  })
  connection.end()
})

app.post("/api/create-profile", (req, res) => {
  const { uid, email, firstName, lastName, country, province, city, currency } = req.body
  const db = mysql.createConnection(config)

  console.log(req.body)

  const query =
    "INSERT INTO UserProfile (uid, email, first_name, last_name, country, province, city, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  db.query(query, [uid, email, firstName, lastName, country, province, city, currency], (err, result) => {
    console.log(err)
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: "User profile saved successfully" })
  })
})

app.get("/api/user-profile/:uid", (req, res) => {
  const { uid } = req.params
  const query = "SELECT first_name, last_name, country, province, city, currency FROM UserProfile WHERE uid = ?"
  const db = mysql.createConnection(config)

  db.query(query, [uid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message })
    if (results.length === 0) return res.status(404).json({ error: "User not found" })
    res.json(results[0])
  })
})

app.put("/api/update-profile", (req, res) => {
  const { uid, firstName, lastName, country, province, city, currency } = req.body
  const db = mysql.createConnection(config)

  const query = `
        UPDATE UserProfile
        SET first_name = ?, last_name = ?, country = ?, province = ?, city = ?, currency = ?
        WHERE uid = ?
    `

  db.query(query, [firstName, lastName, country, province, city, currency, uid], (err, result) => {
    if (err) return res.status(500).json({ error: err.message })
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" })
    res.json({ message: "Profile updated successfully" })
  })
})

app.delete("/api/delete-user", (req, res) => {
  const { uid } = req.body
  const db = mysql.createConnection(config)

  if (!uid) return res.status(400).json({ error: "User ID is required" })

  db.query("DELETE FROM UserProfile WHERE uid = ?", [uid], (err, result) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: "Failed to delete user from database" })
    }
    res.json({ message: "User deleted successfully" })
  })
})

app.post("/api/createTrip", (req, res) => {
  const connection = mysql.createConnection(config)

  const { userID, tripName, startDate, endDate, destination } = req.body

  if (!userID || !tripName || !startDate || !endDate || !destination) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const sql = `INSERT INTO TripInfo (user_id, trip_name, start_date, end_date, destination) VALUES (?, ?, ?, ?, ?)`
  const data = [userID, tripName, startDate, endDate, destination]

  connection.query(sql, data, (error, results) => {
    if (error) {
      console.error("Error inserting trip:", error)
      return res.status(500).json({ error: "Database error" })
    }

    console.log("Trip inserted:", results)
    res.json({ message: "Trip saved successfully!", tripID: results.insertId })
  })

  connection.end()
})

app.post("/api/getUserTrips", (req, res) => {
  const connection = mysql.createConnection(config)

  const { userID } = req.body

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" })
  }

    let sql = `SELECT 
    ti.*, 
    CASE 
      WHEN ti.user_id = ? THEN 'owner' 
      ELSE 'member' 
    END AS role
  FROM TripInfo ti
  LEFT JOIN TripMembers tm ON ti.id = tm.tripID
  WHERE ti.user_id = ? OR tm.userID = ?
  ORDER BY ti.created_at DESC`;
    let data = [userID, userID, userID];


  connection.query(sql, data, (error, results) => {
    if (error) {
      console.error("Error fetching trips:", error)
      return res.status(500).json({ error: "Database error" })
    }

    res.json({ trips: results })
  })

  connection.end()
})

app.post("/api/updateTrip", (req, res) => {
  const connection = mysql.createConnection(config)

  console.log("Received update request:", req.body)

  const { tripID, trip_name, start_date, end_date, destination } = req.body

  if (!tripID || !trip_name || !start_date || !end_date || !destination) {
    console.error("Missing required fields:", req.body)
    return res.status(400).json({ error: "All fields are required" })
  }

  if (new Date(start_date) > new Date(end_date)) {
    console.error("Invalid date selection")
    return res.status(400).json({ error: "End date cannot be earlier than start date." })
  }

  const sql = `UPDATE TripInfo SET trip_name = ?, start_date = ?, end_date = ?, destination = ? WHERE id = ?`
  const data = [trip_name, start_date, end_date, destination, tripID]

  connection.query(sql, data, (error, results) => {
    if (error) {
      console.error("Error updating trip:", error)
      return res.status(500).json({ error: "Database error" })
    }

    res.json({ message: "Trip updated successfully!" })
  })

  connection.end()
})

app.post("/api/addActivity", (req, res) => {
  const connection = mysql.createConnection(config)

  const { tripID, name, date, time, location, category, userID } = req.body

  console.log("Received activity data:", req.body)

  if (!tripID || !name || !date || !time || !category || !userID) {
    console.error("Missing required fields:", req.body)
    return res.status(400).json({ error: "All fields including userID are required." })
  }

  // check for duplicate activity in same time slot
  const checkSQL = `SELECT * FROM ItineraryActivities WHERE trip_id = ? AND date = ? AND time = ?`
  connection.query(checkSQL, [tripID, date, time], (error, results) => {
    if (error) {
      console.error("Database error when checking duplicates:", error)
      connection.end()
      return res.status(500).json({ error: "Database error" })
    }

    if (results.length > 0) {
      console.warn("Activity conflict detected:", results)
      connection.end()
      return res.status(400).json({ error: "An activity already exists at this time. Please choose a different time." })
    }

    const insertSQL = `
            INSERT INTO ItineraryActivities (trip_id, name, date, time, location, category, userID)
            VALUES (?, ?, ?, ?, ?, ?, ?)`

    connection.query(insertSQL, [tripID, name, date, time, location || null, category, userID], (error) => {
      if (error) {
        console.error("Database error when inserting activity:", error)
        connection.end()
        return res.status(500).json({ error: "Database error" })
      }

      console.log("Activity added successfully!")
      res.json({ message: "Activity added successfully!" })
      connection.end()
    })
  })
})

app.get("/api/getItinerary/:tripID", (req, res) => {
  const connection = mysql.createConnection(config)

  const tripID = req.params.tripID
  const sql = `SELECT * FROM ItineraryActivities WHERE trip_id = ? ORDER BY date, time`

  connection.query(sql, [tripID], (error, results) => {
    if (error) {
      console.error("Error fetching itinerary:", error)
      return res.status(500).json({ error: "Database error" })
    }

    res.json({ itinerary: results })
  })

  connection.end()
})

app.get("/api/getTrip/:tripID", (req, res) => {
  const connection = mysql.createConnection(config)

  const tripID = req.params.tripID
  const sql = `SELECT * FROM TripInfo WHERE id = ?`

  connection.query(sql, [tripID], (error, results) => {
    if (error) {
      console.error("Database error when fetching trip details:", error)
      return res.status(500).json({ error: "Database error" })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Trip not found" })
    }

    res.json(results[0])
  })

  connection.end()
})

app.get("/api/getItinerary/:tripID", (req, res) => {
  const tripID = req.params.tripID
  const connection = mysql.createConnection(config)

  const sql = `SELECT id, name, date, time FROM ItineraryActivities WHERE trip_id = ?`

  connection.query(sql, [tripID], (error, results) => {
    if (error) {
      console.error("Database error:", error)
      return res.status(500).json({ error: "Database error" })
    }

    console.log("API Sending Itinerary Data:", results)
    res.json({ itinerary: results })
  })

  connection.end()
})

// API to fetch recommended places based on destination
app.get("/api/getSuggestedPlaces/:destination", (req, res) => {
  const { destination } = req.params
  const userID = req.query.userID
  const tripID = req.query.tripID // Get tripID from query params

  if (!tripID) {
    return res.status(400).json({ error: "Trip ID is required" })
  }

  const connection = mysql.createConnection(config)

  // Modified query to filter votes by trip_id
  const sql = `
  SELECT 
    r.id, 
    r.location, 
    r.category, 
    r.name, 
    r.description,
    COALESCE((SELECT SUM(vote_value) FROM Votes WHERE recommendation_id = r.id AND trip_id = ?), 0) as total_votes,
    COALESCE((SELECT vote_value FROM Votes WHERE user_id = ? AND recommendation_id = r.id AND trip_id = ?), 0) as user_vote
  FROM Recommendations r
  WHERE r.location = ?
`

  connection.query(sql, [tripID, userID, tripID, destination], (error, results) => {
    if (error) {
      console.error("Error fetching recommendations:", error)
      connection.end()
      return res.status(500).json({ error: "Database error while fetching recommendations" })
    }

    console.log("Recommendations with vote counts for trip:", tripID, results)
    res.json({ recommendations: results })
    connection.end()
  })
})

app.get("/api/getTotalBudget/:trip_id", (req, res) => {
  const connection = mysql.createConnection(config)
  const trip_id = req.params.trip_id

  const sql = `SELECT * FROM total_budget WHERE trip_id = ?`

  connection.query(sql, [trip_id], (error, results) => {
    if (error) {
      console.error("Database error while fetching budget:", error)
      return res.status(500).json({ error: "Database error while fetching budget" })
    }
    res.json(
      results.length
        ? results[0]
        : { total_budget: 0, food_budget: 0, transport_budget: 0, accommodation_budget: 0, activities_budget: 0 },
    )
  })

  connection.end()
})

app.post("/api/setTotalBudget", (req, res) => {
  const connection = mysql.createConnection(config)
  const { user_id, trip_id, total_budget } = req.body

  if (!user_id || !trip_id || total_budget === undefined) {
    return res.status(400).json({ error: "User ID, Trip ID, and Total Budget are required" })
  }

  if (total_budget < 0) {
    return res.status(400).json({ error: "Budget values cannot be negative." })
  }

  console.log(`🔹 Setting total budget: User ID = ${user_id}, Trip ID = ${trip_id}, Budget = ${total_budget}`)

  const sql = `
       INSERT INTO total_budget (user_id, trip_id, total_budget)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE total_budget = VALUES(total_budget)
   `

  connection.query(sql, [user_id, trip_id, total_budget], (error, results) => {
    if (error) {
      console.error("Database error while assigning total budget:", error.sqlMessage)
      return res.status(500).json({ error: "Database error while assigning total budget" })
    }

    console.log("Total budget assigned/updated successfully for trip:", trip_id)
    res.json({ message: "Total budget assigned successfully!" })
  })

  connection.end()
})

app.post("/api/setCategoryBudgets", (req, res) => {
  const connection = mysql.createConnection(config)
  const { user_id, trip_id, categories } = req.body

  if (!user_id || !trip_id || !categories) {
    return res.status(400).json({ error: "User ID, Trip ID, and category budgets are required" })
  }

  // Ensure no category has a negative value
  if (Object.values(categories).some((value) => value < 0)) {
    return res.status(400).json({ error: "Budget values cannot be negative." })
  }

  console.log(`🔹 Setting category budgets for trip ${trip_id}:`, categories)

  // Retrieve current total budget
  const totalBudgetSQL = `SELECT total_budget FROM total_budget WHERE user_id = ? AND trip_id = ?`

  connection.query(totalBudgetSQL, [user_id, trip_id], (error, results) => {
    if (error) {
      console.error("Error fetching total budget:", error.sqlMessage)
      return res.status(500).json({ error: "Database error fetching total budget" })
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Total budget must be set before assigning category budgets" })
    }

    const totalBudget = results[0].total_budget
    const totalAllocated = Object.values(categories).reduce((sum, val) => sum + Number(val || 0), 0)

    if (totalAllocated > totalBudget) {
      return res.status(400).json({ error: "Total allocated budgets exceed the total budget." })
    }

    const sql = `
           INSERT INTO total_budget (user_id, trip_id, total_budget, food_budget, transport_budget, accommodation_budget, activities_budget)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
               total_budget = VALUES(total_budget),
               food_budget = VALUES(food_budget),
               transport_budget = VALUES(transport_budget),
               accommodation_budget = VALUES(accommodation_budget),
               activities_budget = VALUES(activities_budget)
       `

    connection.query(
      sql,
      [
        user_id,
        trip_id,
        totalBudget,
        categories.food || 0,
        categories.transport || 0,
        categories.accommodation || 0,
        categories.activities || 0,
      ],
      (error, results) => {
        if (error) {
          console.error("❌ Database error while assigning category budgets:", error.sqlMessage)
          return res.status(500).json({ error: "Database error while assigning category budgets" })
        }

        console.log("Category budgets assigned/updated successfully for trip:", trip_id)
        res.json({ message: "Category budgets updated successfully!" })
      },
    )

    connection.end()
  })
})

app.get("/api/getBudgetStatus/:trip_id/:user_id", (req, res) => {
  const connection = mysql.createConnection(config)
  const { trip_id, user_id } = req.params

  const sql = `
        SELECT 
            tb.total_budget, tb.food_budget, tb.transport_budget, tb.accommodation_budget, tb.activities_budget,
            COALESCE(SUM(CASE WHEN e.exp_category = 'Food' THEN rs.amount ELSE 0 END), 0) AS food_spent,
            COALESCE(SUM(CASE WHEN e.exp_category = 'Transportation' THEN rs.amount ELSE 0 END), 0) AS transport_spent,
            COALESCE(SUM(CASE WHEN e.exp_category = 'Accommodation' THEN rs.amount ELSE 0 END), 0) AS accommodation_spent,
            COALESCE(SUM(CASE WHEN e.exp_category = 'Activities' THEN rs.amount ELSE 0 END), 0) AS activities_spent
        FROM total_budget tb
        LEFT JOIN Expenses e ON e.trip_id = tb.trip_id
        LEFT JOIN Receipt r ON r.exp_id = e.exp_id
        LEFT JOIN ReceiptSplit rs ON rs.item_id = r.item_id AND rs.split_by = ?
        WHERE tb.trip_id = ?
        GROUP BY tb.total_budget, tb.food_budget, tb.transport_budget, tb.accommodation_budget, tb.activities_budget
    `

  connection.query(sql, [user_id, trip_id], (error, results) => {
    if (error) {
      console.error("Database Error in getBudgetStatus:", error)
      return res.status(500).json({ error: "Database error while fetching budget status" })
    }

    if (results.length === 0) {
      return res.json({ budget: {} })
    }

    const data = results[0]
    res.json({
      budget: {
        total: data.total_budget || 0,
        food: data.food_budget || 0,
        transport: data.transport_budget || 0,
        accommodation: data.accommodation_budget || 0,
        activities: data.activities_budget || 0,
      },
      spent: {
        food: data.food_spent || 0,
        transport: data.transport_spent || 0,
        accommodation: data.accommodation_spent || 0,
        activities: data.activities_spent || 0,
      },
    })
  })
})

app.get("/api/getBudgetComparison/:trip_id/:user_id", (req, res) => {
  const connection = mysql.createConnection(config)
  const { trip_id, user_id } = req.params

  const sql = `
        SELECT 
            tb.total_budget, 
            COALESCE(SUM(rs.amount), 0) AS total_spent
        FROM total_budget tb
        LEFT JOIN Expenses e ON e.trip_id = tb.trip_id
        LEFT JOIN Receipt r ON r.exp_id = e.exp_id
        LEFT JOIN ReceiptSplit rs ON rs.item_id = r.item_id AND rs.split_by = ?
        WHERE tb.trip_id = ? 
        GROUP BY tb.total_budget
    `

  connection.query(sql, [user_id, trip_id], (error, results) => {
    if (error) {
      console.error("Database error while fetching budget comparison:", error)
      return res.status(500).json({ error: "Database error while fetching budget comparison" })
    }

    if (results.length === 0) {
      return res.json({ message: "No budget or expenses found for this trip." })
    }

    const budgetData = results[0]
    res.json({
      totalBudget: budgetData.total_budget,
      totalSpent: budgetData.total_spent,
    })
  })

  connection.end()
})

app.get("/api/getGroupBudgetStatus/:trip_id", (req, res) => {
  const connection = mysql.createConnection(config)
  const { trip_id } = req.params

  const sql = `
        SELECT 
            u.first_name, 
            u.last_name, 
            tb.total_budget, 
            COALESCE(SUM(
                CASE WHEN e.exp_category = 'Food' THEN rs.amount ELSE 0 END
            ), 0) AS food_spent,
            COALESCE(SUM(
                CASE WHEN e.exp_category = 'Transportation' THEN rs.amount ELSE 0 END
            ), 0) AS transport_spent,
            COALESCE(SUM(
                CASE WHEN e.exp_category = 'Accommodation' THEN rs.amount ELSE 0 END
            ), 0) AS accommodation_spent,
            COALESCE(SUM(
                CASE WHEN e.exp_category = 'Activities' THEN rs.amount ELSE 0 END
            ), 0) AS activities_spent,
            COALESCE(SUM(rs.amount), 0) AS total_spent
        FROM total_budget tb
        LEFT JOIN Expenses e ON e.trip_id = tb.trip_id AND e.u_id = tb.user_id
        LEFT JOIN Receipt r ON r.exp_id = e.exp_id
        LEFT JOIN ReceiptSplit rs ON rs.item_id = r.item_id
        LEFT JOIN UserProfile u ON tb.user_id = u.uid
        WHERE tb.trip_id = ?
        GROUP BY u.uid, tb.total_budget;
    `

  connection.query(sql, [trip_id], (error, results) => {
    if (error) {
      console.error("Database Error in getGroupBudgetStatus:", error)
      return res.status(500).json({ error: "Database error while fetching group budget status" })
    }

        res.json({
            groupBudgetStatus: results.map(user => ({
                name: `${user.first_name} ${user.last_name}`,
                total_budget: user.total_budget,
                total_spent: user.total_spent
            }))
        });
    });
});

app.post("/api/updateActivityNote", (req, res) => {
  const { activityID, notes } = req.body

  const connection = mysql.createConnection(config)
  const sql = `UPDATE ItineraryActivities SET notes = ? WHERE id = ?`

  connection.query(sql, [notes, activityID], (error, results) => {
    if (error) {
      console.error("Error updating notes:", error)
      res.status(500).json({ error: "Database error while updating notes" })
      return
    }
    res.json({ message: "Notes updated successfully" })
  })

  connection.end()
})

app.post("/api/updateActivity", (req, res) => {
  const connection = mysql.createConnection(config)

  try {
    const { id, name, date, time, location, category } = req.body
    const formattedDate = date.split("T")[0]
    if (!id || !name || !date || !time || !location || !category) {
      console.error("Missing fields:", req.body)
      return res.status(400).json({ error: "All fields are required" })
    }

    const sql = `UPDATE ItineraryActivities SET name = ?, date = ?, time = ?, location = ?, category = ? WHERE id = ?`
    const data = [name, formattedDate, time, location, category, id]

    connection.query(sql, data, (error, results) => {
      if (error) {
        console.error("Database error:", error)
        return res.status(500).json({ error: "Database error" })
      }

            res.json({ message: "Activity updated successfully!" });
        });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server crashed" });
    }
});

// Update the vote endpoint to confirm tripID is being stored and used correctly
app.post("/api/vote", (req, res) => {
  const { userID, tripID, recommendationID, voteValue } = req.body

  if (!userID || !recommendationID || !tripID) {
    return res
      .status(400)
      .json({ error: "Missing required parameters: userID, recommendationID, and tripID are all required" })
  }

  const connection = mysql.createConnection(config)

  // First check if the user has already voted for this recommendation in this trip
  const checkSQL = "SELECT * FROM Votes WHERE user_id = ? AND recommendation_id = ? AND trip_id = ?"

  connection.query(checkSQL, [userID, recommendationID, tripID], (error, results) => {
    if (error) {
      connection.end()
      return res.status(500).json({ error: "Database error" })
    }

    let sql
    let params

    if (results.length > 0) {
      // User has already voted on this recommendation in this trip, update their vote
      if (voteValue === 0) {
        // Remove vote if value is 0
        sql = "DELETE FROM Votes WHERE user_id = ? AND recommendation_id = ? AND trip_id = ?"
        params = [userID, recommendationID, tripID]
      } else {
        // Update existing vote
        sql = "UPDATE Votes SET vote_value = ? WHERE user_id = ? AND recommendation_id = ? AND trip_id = ?"
        params = [voteValue, userID, recommendationID, tripID]
      }
    } else if (voteValue !== 0) {
      // New vote
      sql = "INSERT INTO Votes (user_id, trip_id, recommendation_id, vote_value) VALUES (?, ?, ?, ?)"
      params = [userID, tripID, recommendationID, voteValue]
    } else {
      // Trying to remove a non-existent vote
      connection.end()
      return res.json({ success: true, message: "No change needed" })
    }

    connection.query(sql, params, (error, results) => {
      if (error) {
        console.error("Error updating vote:", error)
        connection.end()
        return res.status(500).json({ error: "Failed to update vote" })
      }

      // Get the updated total vote value and user's current vote for this trip specifically
      const countSQL = `
        SELECT 
          COALESCE(SUM(vote_value), 0) as total_votes,
          (SELECT vote_value FROM Votes WHERE user_id = ? AND recommendation_id = ? AND trip_id = ?) as user_vote
        FROM Votes 
        WHERE recommendation_id = ? AND trip_id = ?
      `

      connection.query(
        countSQL,
        [userID, recommendationID, tripID, recommendationID, tripID],
        (error, countResults) => {
          if (error) {
            console.error("Error getting vote counts:", error)
            connection.end()
            return res.status(500).json({ error: "Failed to get vote counts" })
          }

          const voteData = countResults[0] || { total_votes: 0, user_vote: 0 }
          console.log("Updated vote data for trip", tripID, ":", voteData)

          res.json({
            success: true,
            message: "Vote recorded",
            totalVotes: voteData.total_votes,
            userVote: voteData.user_vote,
          })

          connection.end()
        },
      )
    })
  })
})

app.post("/api/getTripParticipants", (req, res) => {
  const { trip_id } = req.body;

  const connection = mysql.createConnection(config);
  const sql = `
      SELECT u.uid, CONCAT(u.first_name, ' ', u.last_name) AS name
      FROM UserProfile u
      JOIN (
      SELECT user_id AS uid FROM TripInfo WHERE id = ?
      UNION
      SELECT userID AS uid FROM TripMembers WHERE tripID = ?
      ) AS participants ON u.uid = participants.uid
      `;

  connection.query(sql, [trip_id, trip_id], (error, results) => {
      if (error) {
          console.error("Error fetching participants:", error);
          res.status(500).json({ error: "Database error fetching participants" });
          return;
      }
      res.json({ participants: results });
  });

  connection.end();
});

app.post("/api/getTripParticipants", (req, res) => {
  const { trip_id } = req.body;

  const connection = mysql.createConnection(config);
  const sql = `
      SELECT u.uid, CONCAT(u.first_name, ' ', u.last_name) AS name
      FROM UserProfile u
      JOIN (
      SELECT user_id AS uid FROM TripInfo WHERE id = ?
      UNION
      SELECT userID AS uid FROM TripMembers WHERE tripID = ?
      ) AS participants ON u.uid = participants.uid
      `;

  connection.query(sql, [trip_id, trip_id], (error, results) => {
      if (error) {
          console.error("Error fetching participants:", error);
          res.status(500).json({ error: "Database error fetching participants" });
          return;
      }
      res.json({ participants: results });
  });

  connection.end();
});

//getting the trips that are completed (for trip reviews)
/*app.get('/api/getCompletedTrips/:userID', (req, res) => {
  const connection = mysql.createConnection(config);
  const { userID } = req.params;

  const sql = `
    SELECT T.*
    FROM TripInfo T
    JOIN TripMembers TM ON T.id = TM.tripID
    WHERE TM.userID = ? AND T.end_date < CURDATE()
    ORDER BY T.end_date DESC
  `;

  connection.query(sql, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching completed trips:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ trips: results });
  });

  connection.end();
});*/

app.get('/api/getCompletedTrips/:userID', (req, res) => {
    const connection = mysql.createConnection(config);
    const { userID } = req.params;
  
    const sql = `
      SELECT * FROM (
        SELECT * FROM TripInfo
        WHERE user_id = ?
          AND end_date < CURDATE()
  
        UNION
  
        SELECT T.* FROM TripInfo T
        JOIN TripMembers TM ON T.id = TM.tripID
        WHERE TM.userID = ? AND T.end_date < CURDATE()
      ) AS CompletedTrips
      ORDER BY end_date DESC
    `;
  
    connection.query(sql, [userID, userID], (err, results) => {
      if (err) {
        console.error("Error fetching completed trips:", err);
        return res.status(500).json({ error: "Database error" });
      }
  
      res.json({ trips: results });
    });
  
    connection.end();
});



// submitting general trip reviews
app.post('/api/submitTripReview', (req, res) => {
  const connection = mysql.createConnection(config);
  const { tripID, userID, overall_rating, favorite_memory, personal_notes, activity_ratings } = req.body;

  console.log("Incoming Review:", req.body);

  if (!tripID || !userID || !overall_rating || !favorite_memory || !personal_notes) {
      return res.status(400).json({ error: "All fields are required." });
  }

  const reviewQuery = `
  INSERT INTO TripReviews (trip_id, user_id, overall_rating, favorite_memory, personal_notes)
  VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(reviewQuery, [tripID, userID, overall_rating, favorite_memory, personal_notes], (err, results) => {
      if (err) {
          if (err.code === "ER_DUP_ENTRY") {
              return res.status(400).json({ error: "Review already submitted for this trip." });
          }
          console.error("Error inserting trip review:", err);
          return res.status(500).json({ error: "Database error while submitting trip review" });
      }

      const reviewID = results.insertId;
      const ratings = Object.entries(activity_ratings || {});

      if (ratings.length === 0){
          console.log("Review submitted successfully with no activity ratings.");
          return res.json({ message: "Review submitted successfully!" });
      }

      const ratingQuery = `
          INSERT INTO ActivityReviews (trip_review_id, activity_id, user_id, rating)
          VALUES ?
      `;
      const values = ratings.map(([activityID, rating]) => [reviewID, activityID, userID, rating]);

      connection.query(ratingQuery, [values], (err2) => {
          if (err2) {
              console.error("Error inserting activity ratings:", err2);
              return res.status(500).json({ error: "Database error while submitting activity ratings" });
          }

          console.log("Trip review and activity ratings submitted!");
          res.json({ message: "Review submitted successfully!" });

          connection.end();
      });
  });
});


          
//ratings for individual activities
app.post("/api/submitActivityRatings", (req, res) => {
  const { ratings, user_id } = req.body;

  if (!Array.isArray(ratings) || ratings.length === 0) {
    return res.status(400).json({ error: "No activity ratings provided" });
  }

  const connection = mysql.createConnection(config);

  const queries = ratings.map(({ activity_id, rating }) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO ActivityRatings (activity_id, user_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating)
      `;
      connection.query(query, [activity_id, user_id, rating], (error, results) => {
        if (error) {
          console.error("Error submitting activity rating:", error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  });

  Promise.all(queries)
    .then(() => {
      res.json({ message: "Activity ratings submitted successfully!" });
      connection.end();
    })
    .catch((error) => {
      res.status(500).json({ error: "Database error while submitting activity ratings" });
      connection.end();
    });
});

//get past reviews for a user
app.get("/api/getUserTripReviews/:user_id", (req, res) => {
  const { user_id } = req.params;

  const connection = mysql.createConnection(config);
  const query = `
    SELECT tr.*, ti.trip_name
    FROM TripReviews tr
    JOIN TripInfo ti ON tr.trip_id = ti.id
    WHERE tr.user_id = ?
    ORDER BY ti.end_date DESC
  `;

  connection.query(query, [user_id], (error, results) => {
    if (error) {
      console.error("Error fetching user trip reviews:", error);
      return res.status(500).json({ error: "Database error while fetching trip reviews" });
    }
    res.json({ reviews: results });
  });

  connection.end();
});

//get a group's reviews for a trip
app.get("/api/getGroupTripReviews/:trip_id", (req, res) => {
  const { trip_id } = req.params;
  const connection = mysql.createConnection(config);

  const query = `
    SELECT 
      tr.id AS review_id,
      tr.user_id,
      up.first_name,
      up.last_name,
      tr.overall_rating,
      tr.favorite_memory,
      ar.activity_id,
      ar.rating AS activity_rating
    FROM TripReviews tr
    JOIN UserProfile up ON tr.user_id = up.uid
    LEFT JOIN ActivityReviews ar ON tr.id = ar.trip_review_id
    WHERE tr.trip_id = ?
    ORDER BY tr.id, ar.activity_id
  `;

  connection.query(query, [trip_id], (error, results) => {
    if (error) {
      console.error("Error fetching group trip reviews:", error);
      return res.status(500).json({ error: "Database error while fetching group reviews" });
    }

    const reviewsMap = new Map();

    results.forEach(row => {
      if (!reviewsMap.has(row.review_id)) {
        reviewsMap.set(row.review_id, {
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          overall_rating: row.overall_rating,
          favorite_memory: row.favorite_memory,
          activity_ratings: []
        });
      }

      if (row.activity_id) {
        reviewsMap.get(row.review_id).activity_ratings.push({
          activity_id: row.activity_id,
          rating: row.activity_rating
        });
      }
    });

    const groupReviews = Array.from(reviewsMap.values());
    res.json({ groupReviews });
  });

  connection.end();
});

//get a group's ratings for different activities
app.get("/api/getGroupActivityRatings/:trip_id", (req, res) => {
  const connection = mysql.createConnection(config);
  const { trip_id } = req.params;

  const query = `
    SELECT 
      ar.activity_id,
      ar.user_id,
      up.first_name,
      up.last_name,
      ia.name AS activity_name,
      ia.date,
      ar.rating
    FROM ActivityReviews ar
    JOIN ItineraryActivities ia ON ar.activity_id = ia.id
    JOIN UserProfile up ON ar.user_id = up.uid
    WHERE ia.trip_id = ?
    ORDER BY ia.date, ar.activity_id, up.first_name
  `;

  connection.query(query, [trip_id], (error, results) => {
    if (error) {
      console.error("Error fetching group activity ratings:", error);
      return res.status(500).json({ error: "Database error while fetching group activity ratings" });
    }

    res.json({ ratings: results });
  });

  connection.end();
});


app.listen(port, () => console.log(`Listening on port ${port}`));
