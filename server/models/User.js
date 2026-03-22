const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  status: { type: String, default: "active" }
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);




module.exports = userModel







