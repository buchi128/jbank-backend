const express = require("express")
const jwt = require("jsonwebtoken");


 const protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json("No token");

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};

 const adminOnly = (req, res, next) => {
  console.log(req.user);
  if (req.user.role !== "admin")
    return res.status(403).json("Admin access only");

  next();
};


module.exports = {protect, adminOnly}

//You can update one user in MongoDB:
//db.users.updateOne(
//   { email: "admin@email.com" },
//   { $set: { role: "admin" } }
// )