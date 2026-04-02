const bcrypt = require("bcrypt");
const pool = require("../db");

const seedAdmin = async () => {
  try {
    const nombre = process.env.SEED_ADMIN_NOMBRE || "Super";
    const apellido = process.env.SEED_ADMIN_APELLIDO || "Usuario";
    const fechaNacimiento = process.env.SEED_ADMIN_FECHA || "1990-01-01";
    const email = process.env.SEED_ADMIN_EMAIL || "user";
    const passwordPlano = process.env.SEED_ADMIN_PASSWORD || "123";
    const rol = process.env.SEED_ADMIN_ROL || "usuario";

    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (existe.rows.length > 0) {
      console.log("El admin ya existe");
      await pool.end();
      return;
    }

    const hashedPassword = await bcrypt.hash(passwordPlano, 10);

    await pool.query(
      `INSERT INTO usuarios (nombre, apellido, fecha_nacimiento, email, password, rol)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nombre, apellido, fechaNacimiento, email, hashedPassword, rol]
    );

    console.log("Admin creado correctamente");
    console.log("Email:", email);
    console.log("Password:", passwordPlano);

    await pool.end();
  } catch (error) {
    console.error("Error en seedAdmin:", error);
    await pool.end();
    process.exit(1);
  }
};

seedAdmin();