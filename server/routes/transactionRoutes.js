const express = require("express");
const {
  deposit,
  withdraw,
  transfer,
  history
} = require("../controllers/transactionController");

const{ protect } = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/deposit", protect, deposit);
router.post("/withdraw", protect, withdraw);
router.post("/transfer", protect, transfer);
router.get("/history", protect, history);


module.exports = router;