const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no está definido");
      return res.status(500).json({
        message: "Error de configuración del servidor",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Error verificando token:", error.message);

    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

module.exports = authMiddleware;