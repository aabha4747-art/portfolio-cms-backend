const pool = require("../config/db");

// ============================================
// GET ALL SERVICES - PUBLIC
// ============================================
const getServices = async (req, res) => {
  try {
    const { featured } = req.query;

    let query = `
      SELECT *
      FROM services
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
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// ============================================
// CREATE SERVICE - ADMIN
// ============================================
const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      icon,
      featured,
      display_order,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO services (
        title,
        description,
        icon,
        featured,
        display_order
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        title,
        description,
        icon || null,
        featured ?? false,
        display_order ?? 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

// ============================================
// UPDATE SERVICE - ADMIN
// ============================================
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      `SELECT * FROM services WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const current = existingResult.rows[0];

    const {
      title,
      description,
      icon,
      featured,
      display_order,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE services
      SET
        title = $1,
        description = $2,
        icon = $3,
        featured = $4,
        display_order = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        title ?? current.title,
        description ?? current.description,
        icon ?? current.icon,
        featured ?? current.featured,
        display_order ?? current.display_order,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

// ============================================
// DELETE SERVICE - ADMIN
// ============================================
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM services
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};