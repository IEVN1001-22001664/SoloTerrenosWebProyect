const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTRO
const register = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      fechaNacimiento,
      email,
      password,
      confirmPassword
    } = req.body;

    // 1️⃣ Validar campos obligatorios
    if (!nombre || !apellido || !fechaNacimiento || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    // 2️⃣ Validar confirmación de contraseña
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden"
      });
    }
    // 3️⃣ Validar seguridad de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener mínimo 6 caracteres, una mayúscula, una minúscula y un número"
      });
}

    // 3️⃣ Verificar si el correo ya existe
    const emailExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      });
    }

    // 4️⃣ Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Insertar usuario (ROL YA NO SE ENVÍA)
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, fecha_nacimiento, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, email, rol`,
      [nombre, apellido, fechaNacimiento, email, hashedPassword]
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }
    //console.log("BODY:", req.body);
    //console.log("Usuario encontrado:", userResult.rows);

    // 🔥 1️⃣ CREAR TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: rememberMe ? "7d" : "1d",
      }
    );

    // 🔥 2️⃣ ENVIAR COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: rememberMe
        ? 7 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000,
    });

    // 🔥 3️⃣ AQUÍ VA EL NUEVO res.json()
    return res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  res.json({
    user: {
      id: req.user.id,
      rol: req.user.rol,
      nombre: req.user.nombre,
    },
  });
};

module.exports = {login, register, me};

