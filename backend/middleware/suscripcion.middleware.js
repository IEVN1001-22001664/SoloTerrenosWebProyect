const {
  evaluarPermisoPublicacion,
} = require("../services/suscripciones.service");

/**
 * Middleware para validar si el usuario autenticado puede publicar
 * Requiere que req.user.id exista por el middleware de auth.
 */
async function puedePublicarTerreno(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "No autenticado.",
      });
    }

    const evaluacion = await evaluarPermisoPublicacion(req.user.id);

    if (!evaluacion.ok) {
      return res.status(403).json({
        message: evaluacion.motivo,
        codigo: evaluacion.codigo,
        limiteTerrenos: evaluacion.limiteTerrenos,
        terrenosUsados: evaluacion.terrenosUsados,
        suscripcion: evaluacion.suscripcion
          ? {
              id: evaluacion.suscripcion.id,
              estado: evaluacion.suscripcion.estado,
              plan_codigo: evaluacion.suscripcion.plan_codigo,
              plan_nombre: evaluacion.suscripcion.plan_nombre,
              fecha_fin: evaluacion.suscripcion.fecha_fin,
            }
          : null,
      });
    }

    req.suscripcionEvaluada = evaluacion;
    next();
  } catch (error) {
    console.error("Error en middleware puedePublicarTerreno:", error);
    return res.status(500).json({
      message: "Error validando permisos de publicación.",
    });
  }
}

module.exports = {
  puedePublicarTerreno,
};