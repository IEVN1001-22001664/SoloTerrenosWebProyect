const bcrypt = require("bcrypt");
const pool = require("../db");

if (process.env.NODE_ENV === "production") {
  console.log("No se permite ejecutar seeds en producción");
  process.exit(1);
}

const colaboradores = [
  {
    nombre: "Carlos",
    apellido: "Colaborador1",
    fecha_nacimiento: "1990-01-01",
    email: "colab1@demo.com",
    password: "Colab123",
    rol: "colaborador",
    auto_aprobado: true,
    suscripcion_activa: true
  },
  {
    nombre: "Ana",
    apellido: "Colaborador2",
    fecha_nacimiento: "1991-02-02",
    email: "colab2@demo.com",
    password: "Colab123",
    rol: "colaborador",
  },
  {
    nombre: "Luis",
    apellido: "Colaborador3",
    fecha_nacimiento: "1992-03-03",
    email: "colab3@demo.com",
    password: "Colab123",
    rol: "colaborador",
  },
  {
    nombre: "Marta",
    apellido: "Colaborador4",
    fecha_nacimiento: "1993-04-04",
    email: "colab4@demo.com",
    password: "Colab123",
    rol: "colaborador",
  },
  {
    nombre: "Pedro",
    apellido: "Colaborador5",
    fecha_nacimiento: "1994-05-05",
    email: "colab5@demo.com",
    password: "Colab123",
    rol: "colaborador",
  },
];

const seedColaboradores = async () => {
  try {
    for (const user of colaboradores) {
      const existe = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [user.email]
      );

      if (existe.rows.length > 0) {
        console.log(`Ya existe: ${user.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      await pool.query(
        `INSERT INTO usuarios 
        (nombre, apellido, fecha_nacimiento, email, password, rol)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.nombre,
          user.apellido,
          user.fecha_nacimiento,
          user.email,
          hashedPassword,
          user.rol,
        ]
      );

      console.log(`Colaborador creado: ${user.email}`);
    }

    console.log("Seed de colaboradores completado");
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error("Error en seedColaboradores:", error);
    await pool.end();
    process.exit(1);
  }
};

seedColaboradores();