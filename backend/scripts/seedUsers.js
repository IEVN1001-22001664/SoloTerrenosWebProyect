const bcrypt = require("bcrypt");
const pool = require("../db");

// 🚫 Protección básica
if (process.env.NODE_ENV === "production") {
  console.log("No se permite ejecutar seeds en producción");
  process.exit(1);
}

const usuarios = [
  {
    nombre: "Admin",
    apellido: "Principal",
    fecha_nacimiento: "1990-01-01",
    email: "admin@demo.com",
    password: "admin123",
    rol: "admin",
  },
  {
    nombre: "Carlos",
    apellido: "Colaborador",
    fecha_nacimiento: "1995-06-15",
    email: "colab@demo.com",
    password: "colab123",
    rol: "colaborador",
  },
  {
    nombre: "Luis",
    apellido: "Usuario",
    fecha_nacimiento: "2000-03-10",
    email: "user@demo.com",
    password: "user123",
    rol: "usuario",
  },
];

const seedUsers = async () => {
  try {
    for (const usuario of usuarios) {
      // 🔍 Verificar si ya existe
      const existe = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [usuario.email]
      );

      if (existe.rows.length > 0) {
        console.log(`Ya existe: ${usuario.email}`);
        continue;
      }

      // 🔐 Hash de contraseña
      const hashedPassword = await bcrypt.hash(usuario.password, 10);

      // 💾 Insert
      await pool.query(
        `INSERT INTO usuarios 
        (nombre, apellido, fecha_nacimiento, email, password, rol)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          usuario.nombre,
          usuario.apellido,
          usuario.fecha_nacimiento,
          usuario.email,
          hashedPassword,
          usuario.rol,
        ]
      );

      console.log(`Usuario creado: ${usuario.email}`);
    }

    console.log("Seed de usuarios completado");
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error("Error en seedUsers:", error);
    await pool.end();
    process.exit(1);
  }
};

seedUsers();