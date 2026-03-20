const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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

    if (!nombre || !apellido || !fechaNacimiento || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden"
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener mínimo 6 caracteres, una mayúscula, una minúscula y un número"
      });
    }

    const emailExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: rememberMe
        ? 7 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

// ME
const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const result = await pool.query(
      `
      SELECT id, rol, nombre, apellido, email, telefono, foto_perfil
      FROM usuarios
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        foto_perfil: user.foto_perfil
      },
    });
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// OBTENER PERFIL COMPLETO
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        apellido,
        email,
        telefono,
        ciudad,
        direccion,
        rol,
        suscripcion_activa,
        auto_aprobado,
        fecha_nacimiento,
        fecha_creacion,
        created_at,
        foto_perfil
      FROM usuarios
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json({
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
};

// ACTUALIZAR PERFIL
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;

    const {
      nombre,
      apellido,
      email,
      telefono,
      ciudad,
      direccion,
    } = req.body;

    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        message: "Nombre, apellido y correo son obligatorios",
      });
    }

    const emailExiste = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE email = $1
        AND id <> $2
      `,
      [email, userId]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(400).json({
        message: "El correo ya está siendo utilizado por otra cuenta",
      });
    }

    const result = await pool.query(
      `
      UPDATE usuarios
      SET
        nombre = $1,
        apellido = $2,
        email = $3,
        telefono = $4,
        ciudad = $5,
        direccion = $6
      WHERE id = $7
      RETURNING
        id,
        nombre,
        apellido,
        email,
        telefono,
        ciudad,
        direccion,
        rol,
        suscripcion_activa,
        auto_aprobado,
        fecha_nacimiento
      `,
      [
        nombre,
        apellido,
        email,
        telefono || null,
        ciudad || null,
        direccion || null,
        userId,
      ]
    );

    res.json({
      message: "Perfil actualizado correctamente",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
};


const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // Validación básica
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden",
      });
    }

    // Validación de seguridad
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número",
      });
    }

    // Obtener usuario
    const result = await pool.query(
      "SELECT password FROM usuarios WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const user = result.rows[0];

    // Validar contraseña actual
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "La contraseña actual es incorrecta",
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await pool.query(
      "UPDATE usuarios SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    const userId = req.user.id;
    const nuevaRuta = `/uploads/perfiles/${req.file.filename}`;

    // Buscar foto anterior
    const userResult = await pool.query(
      "SELECT foto_perfil FROM usuarios WHERE id = $1",
      [userId]
    );

    const fotoAnterior = userResult.rows[0]?.foto_perfil || null;

    // Guardar nueva foto en BD
    await pool.query(
      "UPDATE usuarios SET foto_perfil = $1 WHERE id = $2",
      [nuevaRuta, userId]
    );

    // Eliminar archivo anterior si existe
    if (fotoAnterior) {
      const rutaAnteriorCompleta = path.join(__dirname, "..", fotoAnterior);

      if (fs.existsSync(rutaAnteriorCompleta)) {
        fs.unlinkSync(rutaAnteriorCompleta);
      }
    }

    res.json({
      message: "Foto actualizada correctamente",
      foto_perfil: nuevaRuta,
    });
  } catch (error) {
    console.error("Error subiendo foto de perfil:", error);
    res.status(500).json({ message: "Error subiendo imagen" });
  }
};

module.exports = {
  login,
  register,
  me,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePhoto,
};