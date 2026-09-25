const pool = require("../config/db");

// ==========================================
// GET ALL SKILLS
// Public
// ==========================================

const getSkills = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM skills
      ORDER BY display_order ASC, id ASC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve skills",
    });
  }
};

// ==========================================
// CREATE SKILL
// Admin only
// ==========================================

const createSkill = async (req, res) => {
  try {
    const {
      name,
      category,
      icon,
      proficiency,
      display_order,
      featured,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO skills (
        name,
        category,
        icon,
        proficiency,
        display_order,
        featured
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name,
        category || null,
        icon || null,
        proficiency ?? null,
        display_order ?? 0,
        featured ?? false,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create skill",
    });
  }
};

// ==========================================
// UPDATE SKILL
// Admin only
// ==========================================

const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      icon,
      proficiency,
      display_order,
      featured,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE skills
      SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        icon = COALESCE($3, icon),
        proficiency = COALESCE($4, proficiency),
        display_order = COALESCE($5, display_order),
        featured = COALESCE($6, featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [
        name,
        category,
        icon,
        proficiency,
        display_order,
        featured,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update skill",
    });
  }
};

// ==========================================
// DELETE SKILL
// Admin only
// ==========================================

const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM skills WHERE id = $1 RETURNING id, name",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete skill",
    });
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};