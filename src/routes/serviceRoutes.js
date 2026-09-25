const express = require("express");
const router = express.Router();

const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/", getServices);

// Admin
router.post("/", protect, createService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;