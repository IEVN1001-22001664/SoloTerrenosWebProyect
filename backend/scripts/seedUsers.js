const bcrypt = require("bcrypt");
const pool = require("../bd");

if (process.env.NODE_ENV === "production") {
  console.log("No se permite ejecutar seeds en producción");
  process.exit(1);
}

const usuarios = [
  {
    nombre: "Usuario1",
    apellido: "Prueba",
    fecha_nacimiento: "1995-01-10",
    email: "usuario1@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario2",
    apellido: "Prueba",
    fecha_nacimiento: "1996-02-11",
    email: "usuario2@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario3",
    apellido: "Prueba",
    fecha_nacimiento: "1997-03-12",
    email: "usuario3@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario4",
    apellido: "Prueba",
    fecha_nacimiento: "1998-04-13",
    email: "usuario4@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario5",
    apellido: "Prueba",
    fecha_nacimiento: "1999-05-14",
    email: "usuario5@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario6",
    apellido: "Prueba",
    fecha_nacimiento: "1994-06-15",
    email: "usuario6@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario7",
    apellido: "Prueba",
    fecha_nacimiento: "1993-07-16",
    email: "usuario7@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario8",
    apellido: "Prueba",
    fecha_nacimiento: "1992-08-17",
    email: "usuario8@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario9",
    apellido: "Prueba",
    fecha_nacimiento: "1991-09-18",
    email: "usuario9@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
  {
    nombre: "Usuario10",
    apellido: "Prueba",
    fecha_nacimiento: "1990-10-19",
    email: "usuario10@demo.com",
    password: "Usuario123",
    rol: "usuario",
  },
];

const seedUsers = async () => {
  try {
    for (const usuario of usuarios) {
      const existe = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [usuario.email]
      );

      if (existe.rows.length > 0) {
        console.log(`Ya existe: ${usuario.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(usuario.password, 10);

      await pool.query(
        `INSERT INTO usuarios (nombre, apellido, fecha_nacimiento, email, password, rol)
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