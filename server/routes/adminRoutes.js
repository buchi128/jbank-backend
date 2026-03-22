const express = require ("express");
const{
  getAllUsers,
  getSingleUser,
  freezeAccount,
  unfreezeAccount,
  getAllTransactions
} = require ("../controllers/adminController");
const { getDashboard } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getSingleUser);

router.put("/freeze/:id", protect, adminOnly, freezeAccount);
router.put("/unfreeze/:id", protect, adminOnly, unfreezeAccount);

router.get("/transactions", protect, adminOnly, getAllTransactions);

router.get("/dashboard", protect, adminOnly, getDashboard);



module.exports = router;