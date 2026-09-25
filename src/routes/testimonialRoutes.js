const express = require("express");
const router = express.Router();

const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");

const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/", getTestimonials);

// Admin
router.post("/", protect, createTestimonial);
router.put("/:id", protect, updateTestimonial);
router.delete("/:id", protect, deleteTestimonial);

module.exports = router;