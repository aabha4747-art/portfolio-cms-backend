const express = require("express");

const router = express.Router();

const {
  getGithubRepos,
  importGithubRepo,
} = require("../controllers/githubController");

const {
  protect,
} = require("../middleware/authMiddleware");

// All GitHub CMS operations require admin authentication.

router.get("/repos", protect, getGithubRepos);

router.post(
  "/import/:repoName",
  protect,
  importGithubRepo
);

module.exports = router;