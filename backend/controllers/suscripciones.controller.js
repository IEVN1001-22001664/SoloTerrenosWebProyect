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
async function listarPlanesAdmin(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        codigo,
        nombre,
        descripcion,
        precio_mensual,
        precio_anual,
        moneda,
        limite_terrenos,
        permite_destacados,
        duracion_dias_trial,
        activo,
        stripe_price_id_mensual,
        stripe_price_id_anual,
        creado_en,
        actualizado_en
      FROM planes_suscripcion
      ORDER BY id ASC
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Error listando planes admin:", error);
    return res.status(500).json({
      message: "Error listando planes.",
    });
  }
}

async function crearPlanAdmin(req, res) {
  try {
    const {
      codigo,
      nombre,
      descripcion,
      precio_mensual,
      precio_anual,
      moneda,
      limite_terrenos,
      permite_destacados,
      duracion_dias_trial,
      activo,
      stripe_price_id_mensual,
      stripe_price_id_anual,
    } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({
        message: "Código y nombre son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO planes_suscripcion (
        codigo,
        nombre,
        descripcion,
        precio_mensual,
        precio_anual,
        moneda,
        limite_terrenos,
        permite_destacados,
        duracion_dias_trial,
        activo,
        stripe_price_id_mensual,
        stripe_price_id_anual,
        creado_en,
        actualizado_en
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()
      )
      RETURNING *
      `,
      [
        codigo,
        nombre,
        descripcion || null,
        precio_mensual ?? 0,
        precio_anual ?? 0,
        moneda || "MXN",
        limite_terrenos === "" || limite_terrenos === undefined ? null : limite_terrenos,
        permite_destacados ?? false,
        duracion_dias_trial ?? 0,
        activo ?? true,
        stripe_price_id_mensual || null,
        stripe_price_id_anual || null,
      ]
    );

    return res.status(201).json({
      message: "Plan creado correctamente.",
      plan: result.rows[0],
    });
  } catch (error) {
    console.error("Error creando plan:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "Ya existe un plan con ese código.",
      });
    }

    return res.status(500).json({
      message: "Error creando plan.",
    });
  }
}

async function actualizarPlanAdmin(req, res) {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      descripcion,
      precio_mensual,
      precio_anual,
      moneda,
      limite_terrenos,
      permite_destacados,
      duracion_dias_trial,
      activo,
      stripe_price_id_mensual,
      stripe_price_id_anual,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE planes_suscripcion
      SET
        codigo = $1,
        nombre = $2,
        descripcion = $3,
        precio_mensual = $4,
        precio_anual = $5,
        moneda = $6,
        limite_terrenos = $7,
        permite_destacados = $8,
        duracion_dias_trial = $9,
        activo = $10,
        stripe_price_id_mensual = $11,
        stripe_price_id_anual = $12,
        actualizado_en = NOW()
      WHERE id = $13
      RETURNING *
      `,
      [
        codigo,
        nombre,
        descripcion || null,
        precio_mensual ?? 0,
        precio_anual ?? 0,
        moneda || "MXN",
        limite_terrenos === "" || limite_terrenos === undefined ? null : limite_terrenos,
        permite_destacados ?? false,
        duracion_dias_trial ?? 0,
        activo ?? true,
        stripe_price_id_mensual || null,
        stripe_price_id_anual || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Plan no encontrado.",
      });
    }

    return res.json({
      message: "Plan actualizado correctamente.",
      plan: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando plan:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "Ya existe otro plan con ese código.",
      });
    }

    return res.status(500).json({
      message: "Error actualizando plan.",
    });
  }
}

async function cambiarEstadoPlanAdmin(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const result = await pool.query(
      `
      UPDATE planes_suscripcion
      SET activo = $1, actualizado_en = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Plan no encontrado.",
      });
    }

    return res.json({
      message: "Estado del plan actualizado correctamente.",
      plan: result.rows[0],
    });
  } catch (error) {
    console.error("Error cambiando estado del plan:", error);
    return res.status(500).json({
      message: "Error cambiando estado del plan.",
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
  listarPlanesAdmin,
  crearPlanAdmin,
  actualizarPlanAdmin,
  cambiarEstadoPlanAdmin,
};