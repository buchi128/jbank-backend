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


const allowedOrigins = [
  'http://localhost:5173', 
    'https://jbankplc-sv7e.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by JBank Security CORS Policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] 
}));


let isConnected = false;

const connectDB = async () => {
  if (isConnected === 1) {
    return;
  }
  
  if (!process.env.DATABASE_URI) {
    console.error("CRITICAL CONFIG ERROR: DATABASE_URI is missing from Vercel settings.");
    return;
  }
  
  try {
  
    await mongoose.connect(process.env.DATABASE_URI);
    isConnected = mongoose.connection.readyState; 
    console.log("DATABASE connected successfully");
  } catch (error) {
    console.error("DATABASE connection failure:", error.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
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


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
});


app.use((err, req, res, next) => {
  console.error("SERVER ERROR STACK:", err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});


module.exports = app;

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}
