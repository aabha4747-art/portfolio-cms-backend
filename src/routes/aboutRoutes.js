const express = require("express");

const router = express.Router();

const {
  getAbout,
  updateAbout,
} = require("../controllers/aboutController");

const {
  protect,
} = require("../middleware/authMiddleware");

// Public
router.get("/", getAbout);

// Admin only
router.put("/", protect, updateAbout);

module.exports = router;