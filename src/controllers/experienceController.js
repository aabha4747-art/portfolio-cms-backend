const pool = require("../config/db");

// ======================================================
// GET ALL EXPERIENCES - PUBLIC
// ======================================================
const getExperiences = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM experience
      ORDER BY display_order ASC, start_date DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get experiences error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch experiences",
    });
  }
};

// ======================================================
// CREATE EXPERIENCE - ADMIN
// ======================================================
const createExperience = async (req, res) => {
  try {
    const {
      company,
      role,
      location,
      start_date,
      end_date,
      currently_working,
      description,
      technologies,
      company_logo,
      display_order,
    } = req.body;

    if (!company || !role || !start_date) {
      return res.status(400).json({
        success: false,
        message: "Company, role and start date are required",
      });
    }

    const technologiesJson = JSON.stringify(
      Array.isArray(technologies) ? technologies : []
    );

    const result = await pool.query(
      `
      INSERT INTO experience (
        company,
        role,
        location,
        start_date,
        end_date,
        currently_working,
        description,
        technologies,
        company_logo,
        display_order
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8::jsonb, $9, $10
      )
      RETURNING *
      `,
      [
        company,
        role,
        location || null,
        start_date,
        end_date || null,
        currently_working ?? false,
        description || null,
        technologiesJson,
        company_logo || null,
        display_order ?? 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Experience created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create experience",
    });
  }
};

// ======================================================
// UPDATE EXPERIENCE - ADMIN
// ======================================================
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      "SELECT * FROM experience WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const current = existingResult.rows[0];

    const {
      company,
      role,
      location,
      start_date,
      end_date,
      currently_working,
      description,
      technologies,
      company_logo,
      display_order,
    } = req.body;

    let technologiesJson;

    if (technologies !== undefined) {
      technologiesJson = JSON.stringify(
        Array.isArray(technologies) ? technologies : []
      );
    } else {
      technologiesJson = JSON.stringify(
        Array.isArray(current.technologies)
          ? current.technologies
          : []
      );
    }

    const result = await pool.query(
      `
      UPDATE experience
      SET
        company = $1,
        role = $2,
        location = $3,
        start_date = $4,
        end_date = $5,
        currently_working = $6,
        description = $7,
        technologies = $8::jsonb,
        company_logo = $9,
        display_order = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
      `,
      [
        company ?? current.company,
        role ?? current.role,
        location ?? current.location,
        start_date ?? current.start_date,
        end_date ?? current.end_date,
        currently_working ?? current.currently_working,
        description ?? current.description,
        technologiesJson,
        company_logo ?? current.company_logo,
        display_order ?? current.display_order,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update experience",
    });
  }
};

// ======================================================
// DELETE EXPERIENCE - ADMIN
// ======================================================
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM experience
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete experience",
    });
  }
};

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};