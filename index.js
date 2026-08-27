require('dotenv').config() // Always load configurations at the absolute top
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

// Core Router Imports
const userRouter = require('./routes/userRoute')
const adminRouter = require('./routes/adminRoutes')
const authRouter = require('./routes/authRoutes')
const transactionRouter = require('./routes/transactionRoutes')
const accountRouter = require('./routes/accounts')
const dashboardRouter = require('./routes/dashboardRoute')
const apiRouter = require('./routes/apiRouter')

// Request Parsing Middlewares (Placed BEFORE routers)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const allowedOrigins = [
  'http://localhost:5173', 
  'https://jbankplc-sv7e.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by JBank Security CORS Policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] 
}));


// Main Application Route Pipelines
app.use("/", authRouter);          
app.use("/api", authRouter);       
app.use("/api/auth", authRouter); 

app.use("/api/users", userRouter); 


app.use("/api/admin", adminRouter)    
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRouter) 
app.use("/api/dashboard", dashboardRouter)
app.use("/api/api", apiRouter)



// 404 Route Catch Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error("SERVER ERROR STACK:", err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
})

// Database Lifecycle Pipeline Connection
mongoose.connect(process.env.DATABASE_URI)
  .then(() => {
    console.log("DATABASE connected successfully")
  })
  .catch((error) => {
    console.error("DATABASE failed to connect:", error.message)
  })

// Server Daemon Initialization
const PORT = process.env.PORT || 5000
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error in running the server: ${err}`)
  } else {
    console.log(`Server started running on port ${PORT} successfully`)
  }
})
