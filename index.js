const dotenv = require ("dotenv");
dotenv.config();
const express = require ("express");
 const cors = require ("cors");
const mongoose = require("mongoose")

 const authRoutes = require("./server/routes/authRoutes");
 const transactionRoutes = require("./server/routes/transactionRoutes");
 const adminRoutes = require("./server/routes/adminRoutes");
 const accountRoutes = require("./server/routes/accountRoutes");

 

const app = express();
const MY_FRONTEND_ORIGIN = 'http://localhost:5173';
app.use(cors({
      origin:MY_FRONTEND_ORIGIN,
      credentials: true,
      methods:['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowheaders: ['Content-type', 'Authorization', 'X-Requested-With']
}))
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date()
  });
});














 const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
 .then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => console.log(`Server running on ${PORT} successfully`));
  })
  .catch(err => console.log(err.message));

