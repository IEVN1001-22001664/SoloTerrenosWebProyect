const jwt = require('jsonwebtoken');

//----------------------------
// Codigo cambiado - Middleware actualizado para usar cookies
//----------------------------
const authMiddleware = (req, res, next) => {

  // 🔥 Ahora leemos el token desde cookies
  const token = req.cookies.token;

  // 1️⃣ Verificar que exista token en cookie
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    // 2️⃣ Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Adjuntar usuario decodificado
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
//----------------------------

module.exports = authMiddleware;