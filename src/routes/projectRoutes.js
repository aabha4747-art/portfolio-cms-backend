const express = require("express");
const router = express.Router();

const {
  getProjects,
  getProjectBySlug,
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");


// ==========================================
// ADMIN ROUTES
// ==========================================

router.get("/admin/all", protect, getAdminProjects);

router.post("/", protect, createProject);

router.put("/:id", protect, updateProject);

router.delete("/:id", protect, deleteProject);

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get("/", getProjects);

router.get("/:slug", getProjectBySlug);

module.exports = router;