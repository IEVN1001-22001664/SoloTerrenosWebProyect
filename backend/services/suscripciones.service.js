const pool = require("../db");

/**
 * Inserta movimiento en historial
 */
async function crearHistorial({
  client,
  suscripcionId,
  usuarioId,
  accion,
  estadoAnterior = null,
  estadoNuevo = null,
  planAnteriorId = null,
  planNuevoId = null,
  detalle = null,
  ejecutadoPorAdminId = null,
  stripeEventId = null,
}) {
  await client.query(
    `
    INSERT INTO suscripciones_historial (
      suscripcion_id,
      usuario_id,
      accion,
      estado_anterior,
      estado_nuevo,
      plan_anterior_id,
      plan_nuevo_id,
      detalle,
      ejecutado_por_admin_id,
      stripe_event_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      suscripcionId,
      usuarioId,
      accion,
      estadoAnterior,
      estadoNuevo,
      planAnteriorId,
      planNuevoId,
      detalle,
      ejecutadoPorAdminId,
      stripeEventId,
    ]
  );
}

/**
 * Obtiene plan por id
 */
async function getPlanById(planId) {
  const result = await pool.query(
    `SELECT * FROM planes_suscripcion WHERE id = $1 AND activo = TRUE LIMIT 1`,
    [planId]
  );
  return result.rows[0] || null;
}

/**
 * Obtiene plan por código
 */
async function getPlanByCodigo(codigo) {
  const result = await pool.query(
    `SELECT * FROM planes_suscripcion WHERE codigo = $1 AND activo = TRUE LIMIT 1`,
    [codigo]
  );
  return result.rows[0] || null;
}

/**
 * Obtiene la suscripción actual del usuario
 * Prioriza usuarios.suscripcion_actual_id
 */
async function getSuscripcionActualUsuario(usuarioId) {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      p.codigo AS plan_codigo,
      p.nombre AS plan_nombre,
      p.limite_terrenos AS plan_limite_terrenos,
      p.permite_destacados,
      p.precio_mensual,
      p.precio_anual
    FROM usuarios u
    LEFT JOIN suscripciones s ON s.id = u.suscripcion_actual_id
    LEFT JOIN planes_suscripcion p ON p.id = s.plan_id
    WHERE u.id = $1
    LIMIT 1
    `,
    [usuarioId]
  );

  return result.rows[0] || null;
}

/**
 * Cuenta terrenos que sí consumen cupo
 * Recomendación:
 * aprobado + pendiente + pausado + oculto_suscripcion
 */
async function contarTerrenosQueConsumenCupo(usuarioId) {
  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM terrenos
    WHERE usuario_id = $1
      AND estado IN ('aprobado', 'pendiente', 'pausado', 'oculto_suscripcion')
    `,
    [usuarioId]
  );

  return result.rows[0]?.total || 0;
}

/**
 * Evalúa si el usuario puede publicar
 */
async function evaluarPermisoPublicacion(usuarioId) {
  const usuarioResult = await pool.query(
    `
    SELECT id, rol, puede_publicar, bloqueado_publicacion
    FROM usuarios
    WHERE id = $1
    LIMIT 1
    `,
    [usuarioId]
  );

  const usuario = usuarioResult.rows[0];

  if (!usuario) {
    return {
      ok: false,
      motivo: "Usuario no encontrado.",
      codigo: "USUARIO_NO_ENCONTRADO",
      rol: null,
      suscripcion: null,
      limiteTerrenos: null,
      terrenosUsados: 0,
    };
  }

  const suscripcion = await getSuscripcionActualUsuario(usuarioId);

  if (!suscripcion) {
    return {
      ok: false,
      motivo: "No existe una suscripción activa asignada al usuario.",
      codigo: "SIN_SUSCRIPCION",
      rol: usuario.rol,
      suscripcion: null,
      limiteTerrenos: null,
      terrenosUsados: 0,
    };
  }

  if (usuario.bloqueado_publicacion) {
    return {
      ok: false,
      motivo: "El usuario está bloqueado manualmente para publicar.",
      codigo: "USUARIO_BLOQUEADO",
      rol: usuario.rol,
      suscripcion,
      limiteTerrenos: null,
      terrenosUsados: 0,
    };
  }

  if (!usuario.puede_publicar) {
    return {
      ok: false,
      motivo: "El usuario no tiene permisos de publicación activos.",
      codigo: "PUBLICACION_DESHABILITADA",
      rol: usuario.rol,
      suscripcion,
      limiteTerrenos: null,
      terrenosUsados: 0,
    };
  }

  const estadosValidos = ["activa", "trialing"];
  if (!estadosValidos.includes(suscripcion.estado)) {
    return {
      ok: false,
      motivo: `La suscripción no está habilitada para publicar. Estado actual: ${suscripcion.estado}`,
      codigo: "ESTADO_SUSCRIPCION_INVALIDO",
      rol: usuario.rol,
      suscripcion,
      limiteTerrenos: null,
      terrenosUsados: 0,
    };
  }

  const ahora = new Date();
  if (suscripcion.fecha_fin && new Date(suscripcion.fecha_fin) < ahora) {
    return {
      ok: false,
      motivo: "La suscripción ya venció.",
      codigo: "SUSCRIPCION_VENCIDA",
      rol: usuario.rol,
      suscripcion,
      limiteTerrenos: null,
      terrenosUsados: 0,
    };
  }

  const limiteTerrenos =
    suscripcion.limite_terrenos_override !== null &&
    suscripcion.limite_terrenos_override !== undefined
      ? suscripcion.limite_terrenos_override
      : suscripcion.plan_limite_terrenos;

  const terrenosUsados = await contarTerrenosQueConsumenCupo(usuarioId);

  if (limiteTerrenos !== null && terrenosUsados >= limiteTerrenos) {
    return {
      ok: false,
      motivo: `Llegaste al límite de ${limiteTerrenos} terrenos permitidos para tu plan.`,
      codigo: "LIMITE_ALCANZADO",
      rol: usuario.rol,
      suscripcion,
      limiteTerrenos,
      terrenosUsados,
    };
  }

  return {
    ok: true,
    motivo: "Usuario habilitado para publicar.",
    codigo: "OK",
    rol: usuario.rol,
    suscripcion,
    limiteTerrenos,
    terrenosUsados,
  };
}

/**
 * Asigna o reemplaza la suscripción actual del usuario
 */
async function asignarSuscripcionManual({
  usuarioId,
  planId,
  origen = "admin",
  estado = "activa",
  fechaInicio,
  fechaFin,
  observaciones = null,
  asignadaPorAdminId = null,
  limiteTerrenosOverride = null,
  usarComoTrial = false,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const usuarioResult = await client.query(
      `SELECT id, rol FROM usuarios WHERE id = $1 LIMIT 1`,
      [usuarioId]
    );

    const usuario = usuarioResult.rows[0];
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    const planResult = await client.query(
      `SELECT * FROM planes_suscripcion WHERE id = $1 AND activo = TRUE LIMIT 1`,
      [planId]
    );

    const plan = planResult.rows[0];
    if (!plan) {
      throw new Error("Plan no encontrado o inactivo.");
    }

    const suscripcionAnteriorResult = await client.query(
      `SELECT * FROM suscripciones WHERE id = (SELECT suscripcion_actual_id FROM usuarios WHERE id = $1)`,
      [usuarioId]
    );
    const suscripcionAnterior = suscripcionAnteriorResult.rows[0] || null;

    const nuevoEstado = usarComoTrial ? "trialing" : estado;

    const insertResult = await client.query(
      `
      INSERT INTO suscripciones (
        usuario_id,
        plan_id,
        origen,
        estado,
        rol_otorgado,
        fecha_inicio,
        fecha_fin,
        limite_terrenos_override,
        trial_usado,
        trial_inicio,
        trial_fin,
        auto_renovar,
        asignada_por_admin_id,
        observaciones
      )
      VALUES ($1,$2,$3,$4,'colaborador',$5,$6,$7,$8,$9,$10,FALSE,$11,$12)
      RETURNING *
      `,
      [
        usuarioId,
        planId,
        origen,
        nuevoEstado,
        fechaInicio,
        fechaFin,
        limiteTerrenosOverride,
        usarComoTrial,
        usarComoTrial ? fechaInicio : null,
        usarComoTrial ? fechaFin : null,
        asignadaPorAdminId,
        observaciones,
      ]
    );

    const nuevaSuscripcion = insertResult.rows[0];

    await client.query(
      `
      UPDATE usuarios
      SET
        rol = CASE WHEN rol = 'admin' THEN rol ELSE 'colaborador' END,
        puede_publicar = TRUE,
        colaborador_desde = COALESCE(colaborador_desde, NOW()),
        suscripcion_actual_id = $1,
        bloqueado_publicacion = FALSE
      WHERE id = $2
      `,
      [nuevaSuscripcion.id, usuarioId]
    );

    await crearHistorial({
      client,
      suscripcionId: nuevaSuscripcion.id,
      usuarioId,
      accion: usarComoTrial ? "trial_asignado" : "creada",
      estadoAnterior: suscripcionAnterior?.estado || null,
      estadoNuevo: nuevaSuscripcion.estado,
      planAnteriorId: suscripcionAnterior?.plan_id || null,
      planNuevoId: nuevaSuscripcion.plan_id,
      detalle: observaciones,
      ejecutadoPorAdminId: asignadaPorAdminId,
    });

    await client.query("COMMIT");
    return nuevaSuscripcion;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Suspende manualmente una suscripción actual
 */
async function suspenderSuscripcionActual({
  usuarioId,
  motivo = "Suspensión manual por administrador.",
  adminId = null,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const suscripcionResult = await client.query(
      `
      SELECT s.*
      FROM usuarios u
      JOIN suscripciones s ON s.id = u.suscripcion_actual_id
      WHERE u.id = $1
      LIMIT 1
      `,
      [usuarioId]
    );

    const suscripcion = suscripcionResult.rows[0];
    if (!suscripcion) {
      throw new Error("El usuario no tiene una suscripción actual.");
    }

    await client.query(
      `
      UPDATE suscripciones
      SET estado = 'suspendida',
          actualizada_en = NOW()
      WHERE id = $1
      `,
      [suscripcion.id]
    );

    await client.query(
      `
      UPDATE usuarios
      SET puede_publicar = FALSE
      WHERE id = $1
      `,
      [usuarioId]
    );

    await client.query(
      `
      UPDATE terrenos
      SET estado = 'oculto_suscripcion'
      WHERE usuario_id = $1
        AND estado = 'aprobado'
      `,
      [usuarioId]
    );

    await crearHistorial({
      client,
      suscripcionId: suscripcion.id,
      usuarioId,
      accion: "suspendida",
      estadoAnterior: suscripcion.estado,
      estadoNuevo: "suspendida",
      planAnteriorId: suscripcion.plan_id,
      planNuevoId: suscripcion.plan_id,
      detalle: motivo,
      ejecutadoPorAdminId: adminId,
    });

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Extiende fecha_fin de la suscripción actual
 */
async function extenderSuscripcionActual({
  usuarioId,
  diasExtra,
  motivo = "Extensión manual por administrador.",
  adminId = null,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const suscripcionResult = await client.query(
      `
      SELECT s.*
      FROM usuarios u
      JOIN suscripciones s ON s.id = u.suscripcion_actual_id
      WHERE u.id = $1
      LIMIT 1
      `,
      [usuarioId]
    );

    const suscripcion = suscripcionResult.rows[0];
    if (!suscripcion) {
      throw new Error("El usuario no tiene una suscripción actual.");
    }

    await client.query(
      `
      UPDATE suscripciones
      SET fecha_fin = COALESCE(fecha_fin, NOW()) + ($1 || ' days')::interval,
          actualizada_en = NOW()
      WHERE id = $2
      `,
      [diasExtra, suscripcion.id]
    );

    await crearHistorial({
      client,
      suscripcionId: suscripcion.id,
      usuarioId,
      accion: "reactivada",
      estadoAnterior: suscripcion.estado,
      estadoNuevo: suscripcion.estado,
      planAnteriorId: suscripcion.plan_id,
      planNuevoId: suscripcion.plan_id,
      detalle: `${motivo} Días extra: ${diasExtra}`,
      ejecutadoPorAdminId: adminId,
    });

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reactiva suscripción actual si sigue vigente o si se desea forzar
 */
async function reactivarSuscripcionActual({
  usuarioId,
  motivo = "Reactivación manual por administrador.",
  adminId = null,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const suscripcionResult = await client.query(
      `
      SELECT s.*
      FROM usuarios u
      JOIN suscripciones s ON s.id = u.suscripcion_actual_id
      WHERE u.id = $1
      LIMIT 1
      `,
      [usuarioId]
    );

    const suscripcion = suscripcionResult.rows[0];
    if (!suscripcion) {
      throw new Error("El usuario no tiene una suscripción actual.");
    }

    const ahora = new Date();
    let nuevoEstado = "activa";
    if (suscripcion.fecha_fin && new Date(suscripcion.fecha_fin) < ahora) {
      throw new Error("La suscripción ya venció. Extiéndela o crea una nueva.");
    }

    await client.query(
      `
      UPDATE suscripciones
      SET estado = $1,
          actualizada_en = NOW()
      WHERE id = $2
      `,
      [nuevoEstado, suscripcion.id]
    );

    await client.query(
      `
      UPDATE usuarios
      SET puede_publicar = TRUE,
          bloqueado_publicacion = FALSE,
          rol = CASE WHEN rol = 'admin' THEN rol ELSE 'colaborador' END
      WHERE id = $1
      `,
      [usuarioId]
    );

    await crearHistorial({
      client,
      suscripcionId: suscripcion.id,
      usuarioId,
      accion: "reactivada",
      estadoAnterior: suscripcion.estado,
      estadoNuevo: nuevoEstado,
      planAnteriorId: suscripcion.plan_id,
      planNuevoId: suscripcion.plan_id,
      detalle: motivo,
      ejecutadoPorAdminId: adminId,
    });

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Marca como vencidas suscripciones expiradas y oculta terrenos aprobados
 */
async function procesarSuscripcionesVencidas() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const vencidasResult = await client.query(
      `
      SELECT *
      FROM suscripciones
      WHERE estado IN ('activa', 'trialing')
        AND fecha_fin IS NOT NULL
        AND fecha_fin < NOW()
      `
    );

    const vencidas = vencidasResult.rows;

    for (const suscripcion of vencidas) {
      await client.query(
        `
        UPDATE suscripciones
        SET estado = 'vencida',
            actualizada_en = NOW()
        WHERE id = $1
        `,
        [suscripcion.id]
      );

      await client.query(
        `
        UPDATE usuarios
        SET puede_publicar = FALSE
        WHERE id = $1
        `,
        [suscripcion.usuario_id]
      );

      await client.query(
        `
        UPDATE terrenos
        SET estado = 'oculto_suscripcion'
        WHERE usuario_id = $1
          AND estado = 'aprobado'
        `,
        [suscripcion.usuario_id]
      );

      await crearHistorial({
        client,
        suscripcionId: suscripcion.id,
        usuarioId: suscripcion.usuario_id,
        accion: "vencida",
        estadoAnterior: suscripcion.estado,
        estadoNuevo: "vencida",
        planAnteriorId: suscripcion.plan_id,
        planNuevoId: suscripcion.plan_id,
        detalle: "Vencimiento automático por fecha_fin.",
      });
    }

    await client.query("COMMIT");

    return {
      ok: true,
      totalProcesadas: vencidas.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Lista usuarios con información de suscripción para panel admin básico
 */
async function listarSuscripcionesAdmin() {
  const result = await pool.query(
    `
    SELECT
      u.id AS usuario_id,
      u.nombre,
      u.apellido,
      u.email,
      u.rol,
      u.puede_publicar,
      u.bloqueado_publicacion,
      s.id AS suscripcion_id,
      s.estado,
      s.origen,
      s.fecha_inicio,
      s.fecha_fin,
      s.fecha_proxima_renovacion,
      s.trial_usado,
      s.limite_terrenos_override,
      p.id AS plan_id,
      p.codigo AS plan_codigo,
      p.nombre AS plan_nombre,
      p.limite_terrenos AS plan_limite_terrenos,
      (
        SELECT COUNT(*)::int
        FROM terrenos t
        WHERE t.usuario_id = u.id
          AND t.estado IN ('aprobado', 'pendiente', 'pausado', 'oculto_suscripcion')
      ) AS terrenos_usados
    FROM usuarios u
    LEFT JOIN suscripciones s ON s.id = u.suscripcion_actual_id
    LEFT JOIN planes_suscripcion p ON p.id = s.plan_id
    ORDER BY u.id DESC
    `
  );

  return result.rows;
}

module.exports = {
  getPlanById,
  getPlanByCodigo,
  getSuscripcionActualUsuario,
  contarTerrenosQueConsumenCupo,
  evaluarPermisoPublicacion,
  asignarSuscripcionManual,
  suspenderSuscripcionActual,
  extenderSuscripcionActual,
  reactivarSuscripcionActual,
  procesarSuscripcionesVencidas,
  listarSuscripcionesAdmin,
};