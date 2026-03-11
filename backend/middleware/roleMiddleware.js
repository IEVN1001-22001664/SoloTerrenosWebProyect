// ======================================================
// MIDDLEWARE DE AUTORIZACIÓN POR ROLES
// ======================================================

module.exports = (...rolesPermitidos) => {

  return (req, res, next) => {

    // ======================================================
    // 1️⃣ VERIFICAR QUE EXISTA USUARIO AUTENTICADO
    // ======================================================

    if (!req.user) {

      console.log("Intento de acceso sin autenticación");

      return res.status(401).json({
        message: "No autenticado"
      });

    }

    // ======================================================
    // 2️⃣ VERIFICAR SI EL ROL DEL USUARIO ESTÁ PERMITIDO
    // ======================================================

    if (!rolesPermitidos.includes(req.user.rol)) {

      console.log(
        "Acceso denegado para rol:",
        req.user.rol
      );

      return res.status(403).json({
        message: "No autorizado"
      });

    }

    // ======================================================
    // 3️⃣ ACCESO AUTORIZADO
    // ======================================================

    console.log(
      "Acceso permitido para rol:",
      req.user.rol
    );

    next();

  };

};