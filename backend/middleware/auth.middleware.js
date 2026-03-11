// ======================================================
// IMPORTACIÓN DE LIBRERÍA JWT
// ======================================================

const jwt = require("jsonwebtoken");


// ======================================================
// MIDDLEWARE DE AUTENTICACIÓN
// Verifica el token almacenado en cookies httpOnly
// ======================================================

const authMiddleware = (req, res, next) => {

  // ======================================================
  // 1️⃣ OBTENER TOKEN DESDE COOKIES
  // ======================================================

  const token = req.cookies?.token;

  // Debug útil
  //console.log("AuthMiddleware ejecutado");
  //console.log("Token recibido:", token ? "SI" : "NO");

  // ======================================================
  // 2️⃣ VERIFICAR EXISTENCIA DE TOKEN
  // ======================================================

  if (!token) {
    return res.status(401).json({
      message: "Token requerido"
    });
  }

  try {

    // ======================================================
    // 3️⃣ VERIFICAR TOKEN JWT
    // ======================================================

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================================================
    // 4️⃣ ADJUNTAR USUARIO AL REQUEST
    // Esto permite acceder a req.user en rutas protegidas
    // ======================================================

    req.user = decoded;

    console.log("Usuario autenticado:", decoded.id);

    next();

  } catch (error) {

    console.error("Error verificando token:", error.message);

    return res.status(401).json({
      message: "Token inválido o expirado"
    });

  }

};


// ======================================================
// EXPORTAR MIDDLEWARE
// ======================================================

module.exports = authMiddleware;