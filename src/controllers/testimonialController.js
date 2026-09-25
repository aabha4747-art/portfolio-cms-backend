const pool = require("../config/db");

// ============================================
// GET ALL TESTIMONIALS - PUBLIC
// ============================================
const getTestimonials = async (req, res) => {
  try {
    const { featured } = req.query;

    let query = `
      SELECT *
      FROM testimonials
    `;

    const values = [];

    if (featured === "true") {
      query += ` WHERE featured = $1`;
      values.push(true);
    }

    query += ` ORDER BY display_order ASC, created_at DESC`;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get testimonials error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
    });
  }
};

// ============================================
// CREATE TESTIMONIAL - ADMIN
// ============================================
const createTestimonial = async (req, res) => {
  try {
    const {
      name,
      role,
      company,
      message,
      profile_image,
      linkedin_url,
      featured,
      display_order,
    } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "Name and message are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO testimonials (
        name,
        role,
        company,
        message,
        profile_image,
        linkedin_url,
        featured,
        display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        name,
        role || null,
        company || null,
        message,
        profile_image || null,
        linkedin_url || null,
        featured ?? false,
        display_order ?? 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create testimonial error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create testimonial",
    });
  }
};

// ============================================
// UPDATE TESTIMONIAL - ADMIN
// ============================================
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      `SELECT * FROM testimonials WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const current = existingResult.rows[0];

    const {
      name,
      role,
      company,
      message,
      profile_image,
      linkedin_url,
      featured,
      display_order,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE testimonials
      SET
        name = $1,
        role = $2,
        company = $3,
        message = $4,
        profile_image = $5,
        linkedin_url = $6,
        featured = $7,
        display_order = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        name ?? current.name,
        role ?? current.role,
        company ?? current.company,
        message ?? current.message,
        profile_image ?? current.profile_image,
        linkedin_url ?? current.linkedin_url,
        featured ?? current.featured,
        display_order ?? current.display_order,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update testimonial error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
    });
  }
};

// ============================================
// DELETE TESTIMONIAL - ADMIN
// ============================================
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM testimonials
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
    });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};