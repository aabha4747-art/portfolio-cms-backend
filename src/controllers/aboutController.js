const pool = require("../config/db");

// ==========================================
// GET ABOUT
// Public
// ==========================================

const getAbout = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM about ORDER BY id ASC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get about error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve about information",
    });
  }
};

// ==========================================
// CREATE OR UPDATE ABOUT
// Admin only
// ==========================================

const updateAbout = async (req, res) => {
  try {
    const {
      name,
      headline,
      short_bio,
      full_bio,
      profile_image,
      location,
      email,
      github_url,
      linkedin_url,
      resume_url,
      availability_status,
    } = req.body;

    const existing = await pool.query(
      "SELECT id FROM about ORDER BY id ASC LIMIT 1"
    );

    let result;

    if (existing.rows.length === 0) {
      result = await pool.query(
        `
        INSERT INTO about (
          name,
          headline,
          short_bio,
          full_bio,
          profile_image,
          location,
          email,
          github_url,
          linkedin_url,
          resume_url,
          availability_status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11
        )
        RETURNING *
        `,
        [
          name,
          headline,
          short_bio,
          full_bio,
          profile_image,
          location,
          email,
          github_url,
          linkedin_url,
          resume_url,
          availability_status,
        ]
      );
    } else {
      result = await pool.query(
        `
        UPDATE about
        SET
          name = $1,
          headline = $2,
          short_bio = $3,
          full_bio = $4,
          profile_image = $5,
          location = $6,
          email = $7,
          github_url = $8,
          linkedin_url = $9,
          resume_url = $10,
          availability_status = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *
        `,
        [
          name,
          headline,
          short_bio,
          full_bio,
          profile_image,
          location,
          email,
          github_url,
          linkedin_url,
          resume_url,
          availability_status,
          existing.rows[0].id,
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: "About information saved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update about error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save about information",
    });
  }
};

module.exports = {
  getAbout,
  updateAbout,
};