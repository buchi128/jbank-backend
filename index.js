require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Import Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoute');
const transactionRouter = require('./routes/transactionRoutes');
const adminRouter = require('./routes/adminRoutes');
const accountRouter = require('./routes/accounts');
const dashboardRouter = require('./routes/dashboardRoute');
const apiRouter = require('./routes/apiRouter');

// Request Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clean static validation array
const allowedOrigins = [
  'http://localhost:5173', 
  'https://jbankplc-sv7e.vercel.app'
];

app.use(cors({
  origin: allowedOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  if (!process.env.DATABASE_URI) {
    throw new Error("CRITICAL CONFIG ERROR: DATABASE_URI is missing from Vercel settings.");
  }
  

  await mongoose.connect(process.env.DATABASE_URI, {
    serverSelectionTimeoutMS: 5000, 
    bufferCommands: false 
  });
  
  console.log("DATABASE connected successfully");
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DATABASE connection failure:", error.message);
    return res.status(500).json({ error: "Database unavailable", details: error.message });
  }
});

app.use("/", authRouter);          
app.use("/api", authRouter);       
app.use("/api/auth", authRouter);  
app.use("/api/users", userRouter); 
app.use("/api/admin", adminRouter);    
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter); 
app.use("/api/dashboard", dashboardRouter);
app.use("/api/api", apiRouter);

app.use("/transactions", transactionRouter);   
app.use("/accounts", accountRouter);            



app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
});


app.use((err, req, res, next) => {
  console.error("SERVER ERROR STACK:", err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;
