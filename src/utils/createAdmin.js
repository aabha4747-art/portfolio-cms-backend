require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      console.error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
      );
      process.exit(1);
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const saltRounds = 12;

    const passwordHash = await bcrypt.hash(
      password,
      saltRounds
    );

    const result = await pool.query(
      `INSERT INTO users
       (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [
        name,
        email.toLowerCase(),
        passwordHash,
        "admin",
      ]
    );

    console.log("Admin created successfully:");
    console.log(result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }     
};

createAdmin();