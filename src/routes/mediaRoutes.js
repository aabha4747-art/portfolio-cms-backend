const express = require("express");
const router = express.Router();

const {
  getMedia,
  uploadMedia,
  deleteMedia,
} = require("../controllers/mediaController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public media library
router.get("/", getMedia);

// Protected admin upload
router.post("/", protect, upload.single("image"), uploadMedia);

// Protected admin delete
router.delete("/:id", protect, deleteMedia);

module.exports = router;