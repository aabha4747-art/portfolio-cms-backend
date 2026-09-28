const pool = require("../config/db");
const supabase = require("../config/supabase");
const path = require("path");

// ============================================
// GET ALL MEDIA
// ============================================
const getMedia = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM media
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get media error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch media",
    });
  }
};

// ============================================
// UPLOAD MEDIA - ADMIN
// ============================================
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET;

    const originalName = path.basename(req.file.originalname);
    const extension = path.extname(originalName);
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    const uniqueFileName = `${Date.now()}-${baseName}${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return res.status(500).json({
        success: false,
        message: "Failed to upload image to storage",
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);

    const fileUrl = publicUrlData.publicUrl;

    try {
      const result = await pool.query(
        `
        INSERT INTO media (
          file_name,
          file_url,
          file_type,
          file_size,
          alt_text
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          uniqueFileName,
          fileUrl,
          req.file.mimetype,
          req.file.size,
          req.body.alt_text || null,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        data: result.rows[0],
      });
    } catch (dbError) {
      // If DB insertion fails, remove the uploaded Storage object
      // so we don't leave an orphaned file behind.
      await supabase.storage.from(bucket).remove([uniqueFileName]);

      throw dbError;
    }
  } catch (error) {
    console.error("Upload media error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};

// ============================================
// DELETE MEDIA - ADMIN
// ============================================
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      `SELECT * FROM media WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    const media = existingResult.rows[0];
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;

    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([media.file_name]);

    if (storageError) {
      console.error("Supabase delete error:", storageError);

      return res.status(500).json({
        success: false,
        message: "Failed to delete image from storage",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM media
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete media error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

module.exports = {
  getMedia,
  uploadMedia,
  deleteMedia,
};