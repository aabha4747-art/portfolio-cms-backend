const pool = require("../config/db");

const {
  getRepositories,
  getRepository,
} = require("../services/githubService");

// ==========================================
// GET GITHUB REPOSITORIES
// Admin only
// ==========================================

const getGithubRepos = async (req, res) => {
  try {
    const repositories = await getRepositories();

    const cleanedRepositories = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }));

    return res.status(200).json({
      success: true,
      count: cleanedRepositories.length,
      data: cleanedRepositories,
    });
  } catch (error) {
    console.error(
      "GitHub repositories error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve GitHub repositories",
    });
  }
};

// ==========================================
// IMPORT GITHUB REPOSITORY
// Admin only
// ==========================================

const importGithubRepo = async (req, res) => {
  try {
    const { repoName } = req.params;

    const repo = await getRepository(repoName);

    // Prevent the same GitHub repository
    // from being imported twice.
    const existing = await pool.query(
      "SELECT id FROM projects WHERE github_repo_id = $1",
      [repo.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This GitHub repository has already been imported",
      });
    }

    let baseSlug = repo.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) {
      baseSlug = `github-project-${repo.id}`;
    }

    // Avoid collisions with manually-created projects
    // that may already use the same slug.
    let slug = baseSlug;

    const slugCheck = await pool.query(
      "SELECT id FROM projects WHERE slug = $1",
      [slug]
    );

    if (slugCheck.rows.length > 0) {
      slug = `${baseSlug}-${repo.id}`;
    }

    const technologies = [];

    if (repo.language) {
      technologies.push(repo.language);
    }

    if (Array.isArray(repo.topics)) {
      for (const topic of repo.topics) {
        if (!technologies.includes(topic)) {
          technologies.push(topic);
        }
      }
    }

    const result = await pool.query(
      `
      INSERT INTO projects (
        title,
        slug,
        short_description,
        full_description,
        category,

        github_repo_url,
        github_repo_id,
        github_imported,

        live_frontend_url,

        technologies,
        features,
        screenshots,

        featured,
        published,
        display_order
      )

      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9,
        $10, $11, $12,
        $13, $14, $15
      )

      RETURNING *
      `,
      [
        repo.name,
        slug,
        repo.description || "Imported from GitHub",
        repo.description || null,
        "GitHub Project",

        repo.html_url,
        repo.id,
        true,

        repo.homepage || null,

        JSON.stringify(technologies),
        JSON.stringify([]),
        JSON.stringify([]),

        false,

        // Keep imports hidden until you review them.
        false,

        0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "GitHub repository imported successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GitHub import error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "GitHub repository not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to import GitHub repository",
    });
  }
};

module.exports = {
  getGithubRepos,
  importGithubRepo,
};