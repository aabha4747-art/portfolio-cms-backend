const pool = require("../config/db");

// ======================================================
// GET PUBLISHED BLOGS - PUBLIC
// ======================================================
const getBlogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM blogs
      WHERE published = true
      ORDER BY published_at DESC NULLS LAST, created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blogs",
    });
  }
};

// ======================================================
// GET ONE PUBLISHED BLOG BY SLUG - PUBLIC
// ======================================================
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM blogs
      WHERE slug = $1
        AND published = true
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blog",
    });
  }
};

// ======================================================
// GET ALL BLOGS INCLUDING DRAFTS - ADMIN
// ======================================================
const getAdminBlogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM blogs
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get admin blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blogs",
    });
  }
};

// ======================================================
// CREATE BLOG - ADMIN
// ======================================================
const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      cover_image,
      tags,
      published,
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug and content are required",
      });
    }

    const tagsJson = JSON.stringify(
      Array.isArray(tags) ? tags : []
    );

    const isPublished = published ?? false;

    const result = await pool.query(
      `
      INSERT INTO blogs (
        title,
        slug,
        excerpt,
        content,
        cover_image,
        tags,
        published,
        published_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6::jsonb, $7,
        CASE WHEN $7 = true THEN CURRENT_TIMESTAMP ELSE NULL END
      )
      RETURNING *
      `,
      [
        title,
        slug,
        excerpt || null,
        content,
        cover_image || null,
        tagsJson,
        isPublished,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create blog error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create blog",
    });
  }
};

// ======================================================
// UPDATE BLOG - ADMIN
// ======================================================
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      "SELECT * FROM blogs WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const current = existingResult.rows[0];

    const {
      title,
      slug,
      excerpt,
      content,
      cover_image,
      tags,
      published,
    } = req.body;

    const finalTags =
      tags !== undefined
        ? tags
        : current.tags;

    const tagsJson = JSON.stringify(
      Array.isArray(finalTags) ? finalTags : []
    );

    const finalPublished =
      published ?? current.published;

    let publishedAt = current.published_at;

    // Draft -> Published
    if (finalPublished === true && current.published === false) {
      publishedAt = new Date();
    }

    // Published -> Draft
    if (finalPublished === false) {
      publishedAt = null;
    }

    const result = await pool.query(
      `
      UPDATE blogs
      SET
        title = $1,
        slug = $2,
        excerpt = $3,
        content = $4,
        cover_image = $5,
        tags = $6::jsonb,
        published = $7,
        published_at = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
      `,
      [
        title ?? current.title,
        slug ?? current.slug,
        excerpt ?? current.excerpt,
        content ?? current.content,
        cover_image ?? current.cover_image,
        tagsJson,
        finalPublished,
        publishedAt,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update blog error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update blog",
    });
  }
};

// ======================================================
// DELETE BLOG - ADMIN
// ======================================================
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM blogs
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete blog",
    });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};