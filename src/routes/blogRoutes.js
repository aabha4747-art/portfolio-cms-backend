const express = require("express");
const router = express.Router();

const {
  getBlogs,
  getBlogBySlug,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const { protect } = require("../middleware/authMiddleware");

// Admin routes MUST come before /:slug
router.get("/admin/all", protect, getAdminBlogs);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

module.exports = router;