const {
  getSuscripcionActualUsuario,
  asignarSuscripcionManual,
  suspenderSuscripcionActual,
  extenderSuscripcionActual,
  reactivarSuscripcionActual,
  procesarSuscripcionesVencidas,
  listarSuscripcionesAdmin,
  evaluarPermisoPublicacion,
} = require("../services/suscripciones.service");
const pool = require("../db");

async function getMiSuscripcion(req, res) {
  try {
    const usuarioId = req.user.id;
    const suscripcion = await getSuscripcionActualUsuario(usuarioId);

    if (!suscripcion) {
      return res.status(404).json({
        message: "No tienes una suscripción asignada.",
      });
    }

    return res.json(suscripcion);
  } catch (error) {
    console.error("Error obteniendo mi suscripción:", error);
    return res.status(500).json({
      message: "Error obteniendo la suscripción.",
    });
  }
}

async function getPlanesActivos(req, res) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM planes_suscripcion
      WHERE activo = TRUE
      ORDER BY id ASC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo planes:", error);
    return res.status(500).json({
      message: "Error obteniendo planes.",
    });
  }
}

async function asignarSuscripcionAdmin(req, res) {
  try {
    const adminId = req.user.id;
    const {
      usuario_id,
      plan_id,
      fecha_inicio,
      fecha_fin,
      observaciones,
      limite_terrenos_override,
      usar_como_trial,
    } = req.body;

    if (!usuario_id || !plan_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message:
          "usuario_id, plan_id, fecha_inicio y fecha_fin son obligatorios.",
      });
    }

    const nuevaSuscripcion = await asignarSuscripcionManual({
      usuarioId: usuario_id,
      planId: plan_id,
      origen: usar_como_trial ? "trial" : "admin",
      estado: usar_como_trial ? "trialing" : "activa",
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
      observaciones: observaciones || null,
      asignadaPorAdminId: adminId,
      limiteTerrenosOverride:
        limite_terrenos_override !== undefined
          ? limite_terrenos_override
          : null,
      usarComoTrial: Boolean(usar_como_trial),
    });

    return res.status(201).json({
      message: "Suscripción asignada correctamente.",
      suscripcion: nuevaSuscripcion,
    });
  } catch (error) {
    console.error("Error asignando suscripción manual:", error);
    return res.status(500).json({
      message: error.message || "Error asignando suscripción.",
    });
  }
}

async function suspenderSuscripcionAdmin(req, res) {
  try {
    const adminId = req.user.id;
    const { usuario_id, motivo } = req.body;

    if (!usuario_id) {
      return res.status(400).json({
        message: "usuario_id es obligatorio.",
      });
    }

    await suspenderSuscripcionActual({
      usuarioId: usuario_id,
      motivo,
      adminId,
    });

    return res.json({
      message: "Suscripción suspendida correctamente.",
    });
  } catch (error) {
    console.error("Error suspendiendo suscripción:", error);
    return res.status(500).json({
      message: error.message || "Error suspendiendo suscripción.",
    });
  }
}

async function extenderSuscripcionAdmin(req, res) {
  try {
    const adminId = req.user.id;
    const { usuario_id, dias_extra, motivo } = req.body;

    if (!usuario_id || !dias_extra) {
      return res.status(400).json({
        message: "usuario_id y dias_extra son obligatorios.",
      });
    }

    await extenderSuscripcionActual({
      usuarioId: usuario_id,
      diasExtra: Number(dias_extra),
      motivo,
      adminId,
    });

    return res.json({
      message: "Suscripción extendida correctamente.",
    });
  } catch (error) {
    console.error("Error extendiendo suscripción:", error);
    return res.status(500).json({
      message: error.message || "Error extendiendo suscripción.",
    });
  }
}

async function reactivarSuscripcionAdmin(req, res) {
  try {
    const adminId = req.user.id;
    const { usuario_id, motivo } = req.body;

    if (!usuario_id) {
      return res.status(400).json({
        message: "usuario_id es obligatorio.",
      });
    }

    await reactivarSuscripcionActual({
      usuarioId: usuario_id,
      motivo,
      adminId,
    });

    return res.json({
      message: "Suscripción reactivada correctamente.",
    });
  } catch (error) {
    console.error("Error reactivando suscripción:", error);
    return res.status(500).json({
      message: error.message || "Error reactivando suscripción.",
    });
  }
}

async function procesarVencidasAdmin(req, res) {
  try {
    const resultado = await procesarSuscripcionesVencidas();

    return res.json({
      message: "Proceso de vencimientos ejecutado.",
      ...resultado,
    });
  } catch (error) {
    console.error("Error procesando suscripciones vencidas:", error);
    return res.status(500).json({
      message: "Error procesando suscripciones vencidas.",
    });
  }
}

async function listarSuscripcionesPanelAdmin(req, res) {
  try {
    const data = await listarSuscripcionesAdmin();
    return res.json(data);
  } catch (error) {
    console.error("Error listando suscripciones admin:", error);
    return res.status(500).json({
      message: "Error listando suscripciones.",
    });
  }
}

async function getCapacidadPublicacion(req, res) {
  try {
    const usuarioId = req.user.id;
    const evaluacion = await evaluarPermisoPublicacion(usuarioId);

    return res.json(evaluacion);
  } catch (error) {
    console.error("Error obteniendo capacidad de publicación:", error);
    return res.status(500).json({
      message: "Error obteniendo capacidad de publicación.",
    });
  }
}
module.exports = {
  getMiSuscripcion,
  getPlanesActivos,
  asignarSuscripcionAdmin,
  suspenderSuscripcionAdmin,
  extenderSuscripcionAdmin,
  reactivarSuscripcionAdmin,
  procesarVencidasAdmin,
  listarSuscripcionesPanelAdmin,
  getCapacidadPublicacion,
};