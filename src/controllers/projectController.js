const pool = require("../config/db");

// ==========================================
// GET ALL PUBLISHED PROJECTS
// Public
// ==========================================

const getProjects = async (req, res) => {
  try {
    const { category, featured } = req.query;

    let query = `
      SELECT *
      FROM projects
      WHERE published = TRUE
    `;

    const values = [];

    if (category) {
      values.push(category);

      query += `
        AND LOWER(category) = LOWER($${values.length})
      `;
    }

    if (featured === "true") {
      query += `
        AND featured = TRUE
      `;
    }

    query += `
      ORDER BY display_order ASC, created_at DESC
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve projects",
    });
  }
};


// ==========================================
// GET PROJECT BY SLUG
// Public
// ==========================================

const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM projects
      WHERE slug = $1
      AND published = TRUE
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve project",
    });
  }
};


// ==========================================
// GET ALL PROJECTS
// Admin only
// Includes unpublished projects
// ==========================================

const getAdminProjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM projects
      ORDER BY display_order ASC, created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get admin projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve projects",
    });
  }
};


// ==========================================
// CREATE PROJECT
// Admin only
// ==========================================

const createProject = async (req, res) => {
  try {
    const {
      title,
      slug,
      short_description,
      full_description,
      category,

      thumbnail,
      banner_image,

      github_frontend_url,
      github_backend_url,
      github_repo_url,
      github_repo_id,
      github_imported,

      live_frontend_url,
      live_backend_url,
      demo_video_url,

      problem,
      solution,
      my_role,
      challenges,
      learnings,

      technologies,
      features,
      screenshots,

      featured,
      published,
      display_order,
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        message: "Title and slug are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO projects (
        title,
        slug,
        short_description,
        full_description,
        category,

        thumbnail,
        banner_image,

        github_frontend_url,
        github_backend_url,
        github_repo_url,
        github_repo_id,
        github_imported,

        live_frontend_url,
        live_backend_url,
        demo_video_url,

        problem,
        solution,
        my_role,
        challenges,
        learnings,

        technologies,
        features,
        screenshots,

        featured,
        published,
        display_order
      )

      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23,
        $24, $25, $26
      )

      RETURNING *
      `,
      [
        title,
        slug,
        short_description || null,
        full_description || null,
        category || null,

        thumbnail || null,
        banner_image || null,

        github_frontend_url || null,
        github_backend_url || null,
        github_repo_url || null,
        github_repo_id || null,
        github_imported ?? false,

        live_frontend_url || null,
        live_backend_url || null,
        demo_video_url || null,

        problem || null,
        solution || null,
        my_role || null,
        challenges || null,
        learnings || null,

        JSON.stringify(technologies || []),
        JSON.stringify(features || []),
        JSON.stringify(screenshots || []),

        featured ?? false,
        published ?? true,
        display_order ?? 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A project with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create project",
    });
  }
};


// ==========================================
// UPDATE PROJECT
// Admin only
// ==========================================

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const current = existing.rows[0];

    const {
      title,
      slug,
      short_description,
      full_description,
      category,

      thumbnail,
      banner_image,

      github_frontend_url,
      github_backend_url,
      github_repo_url,
      github_repo_id,
      github_imported,

      live_frontend_url,
      live_backend_url,
      demo_video_url,

      problem,
      solution,
      my_role,
      challenges,
      learnings,

      technologies,
      features,
      screenshots,

      featured,
      published,
      display_order,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE projects
      SET
        title = $1,
        slug = $2,
        short_description = $3,
        full_description = $4,
        category = $5,

        thumbnail = $6,
        banner_image = $7,

        github_frontend_url = $8,
        github_backend_url = $9,
        github_repo_url = $10,
        github_repo_id = $11,
        github_imported = $12,

        live_frontend_url = $13,
        live_backend_url = $14,
        demo_video_url = $15,

        problem = $16,
        solution = $17,
        my_role = $18,
        challenges = $19,
        learnings = $20,

        technologies = $21,
        features = $22,
        screenshots = $23,

        featured = $24,
        published = $25,
        display_order = $26,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = $27

      RETURNING *
      `,
      [
        title ?? current.title,
        slug ?? current.slug,
        short_description ?? current.short_description,
        full_description ?? current.full_description,
        category ?? current.category,

        thumbnail ?? current.thumbnail,
        banner_image ?? current.banner_image,

        github_frontend_url ?? current.github_frontend_url,
        github_backend_url ?? current.github_backend_url,
        github_repo_url ?? current.github_repo_url,
        github_repo_id ?? current.github_repo_id,
        github_imported ?? current.github_imported,

        live_frontend_url ?? current.live_frontend_url,
        live_backend_url ?? current.live_backend_url,
        demo_video_url ?? current.demo_video_url,

        problem ?? current.problem,
        solution ?? current.solution,
        my_role ?? current.my_role,
        challenges ?? current.challenges,
        learnings ?? current.learnings,

        technologies
          ? JSON.stringify(technologies)
          : current.technologies,

        features
          ? JSON.stringify(features)
          : current.features,

        screenshots
          ? JSON.stringify(screenshots)
          : current.screenshots,

        featured ?? current.featured,
        published ?? current.published,
        display_order ?? current.display_order,

        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update project error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A project with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update project",
    });
  }
};


// ==========================================
// DELETE PROJECT
// Admin only
// ==========================================

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM projects
      WHERE id = $1
      RETURNING id, title
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete project",
    });
  }
};


module.exports = {
  getProjects,
  getProjectBySlug,
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
};