const pool = require('../db');

/* ===========================
   USUARIOS
=========================== */

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.rol,
        u.puede_publicar,
        u.bloqueado_publicacion,
        u.colaborador_desde,
        u.suscripcion_actual_id,
        u.auto_aprobado,
        s.estado AS suscripcion_estado,
        s.origen AS suscripcion_origen,
        s.fecha_inicio AS suscripcion_fecha_inicio,
        s.fecha_fin AS suscripcion_fecha_fin,
        p.codigo AS plan_codigo,
        p.nombre AS plan_nombre
      FROM usuarios u
      LEFT JOIN suscripciones s ON s.id = u.suscripcion_actual_id
      LEFT JOIN planes_suscripcion p ON p.id = s.plan_id
      WHERE u.rol = 'usuario'
      ORDER BY u.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  try {
    await pool.query(
      "UPDATE usuarios SET rol = $1 WHERE id = $2",
      [rol, id]
    );

    res.json({ message: "Rol actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando rol" });
  }
};

exports.toggleSubscription = async (req, res) => {
  const { id } = req.params;
  const { suscripcion_activa } = req.body;

  try {
    await pool.query(
      "UPDATE usuarios SET suscripcion_activa = $1 WHERE id = $2",
      [suscripcion_activa, id]
    );

    res.json({ message: "Suscripción actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando suscripción" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM usuarios WHERE id = $1",
      [id]
    );

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};

exports.getColaboradores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.foto_perfil,
        u.rol,
        u.auto_aprobado,
        u.puede_publicar,
        u.bloqueado_publicacion,
        u.colaborador_desde,
        u.suscripcion_actual_id,

        s.estado AS suscripcion_estado,
        s.origen AS suscripcion_origen,
        s.fecha_inicio AS suscripcion_fecha_inicio,
        s.fecha_fin AS suscripcion_fecha_fin,
        s.limite_terrenos_override,

        p.codigo AS plan_codigo,
        p.nombre AS plan_nombre,
        p.limite_terrenos AS plan_limite_terrenos,

        COUNT(t.id)::int AS publicaciones_totales,
        COUNT(*) FILTER (WHERE t.estado = 'pendiente')::int AS publicaciones_pendientes,

        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'titulo', t.titulo,
              'estado', t.estado
            )
            ORDER BY t.creado_en DESC
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) AS terrenos
      FROM usuarios u
      LEFT JOIN suscripciones s ON s.id = u.suscripcion_actual_id
      LEFT JOIN planes_suscripcion p ON p.id = s.plan_id
      LEFT JOIN terrenos t ON t.usuario_id = u.id
      WHERE u.rol = 'colaborador'
      GROUP BY
        u.id,
        s.id,
        p.id
      ORDER BY u.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo colaboradores:", error);
    res.status(500).json({ message: "Error obteniendo colaboradores" });
  }
};

exports.updateAutoAprobado = async (req, res) => {
  const { id } = req.params;
  const { auto_aprobado } = req.body;

  try {
    await pool.query(
      "UPDATE usuarios SET auto_aprobado = $1 WHERE id = $2",
      [auto_aprobado, id]
    );

    res.json({ message: "Auto aprobación actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando auto aprobación" });
  }
};

/* ===========================
   PUBLICACIONES
=========================== */

exports.getPublicaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.titulo,
        t.estado,
        t.creado_en,
        u.nombre AS usuario
      FROM terrenos t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.estado != 'eliminado'
      ORDER BY t.creado_en DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo publicaciones" });
  }
};

exports.cambiarEstadoPublicacion = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { estado, mensaje } = req.body;
    const admin_id = req.user.id;

    const estadosPermitidos = ["pendiente", "aprobado", "rechazado", "pausado", "eliminado"];

    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado inválido",
      });
    }

    // Si rechaza, el mensaje debe ser obligatorio
    if (estado === "rechazado" && (!mensaje || !mensaje.trim())) {
      return res.status(400).json({
        message: "Debes proporcionar un mensaje de observación al rechazar una publicación",
      });
    }

    await client.query("BEGIN");

    // 1. Obtener terreno y colaborador dueño
    const terrenoResult = await client.query(
      `
      SELECT t.id, t.titulo, t.estado, t.usuario_id, u.nombre
      FROM terrenos t
      INNER JOIN usuarios u ON u.id = t.usuario_id
      WHERE t.id = $1
      `,
      [id]
    );

    if (terrenoResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Publicación no encontrada",
      });
    }

    const terreno = terrenoResult.rows[0];
    const colaborador_id = terreno.usuario_id;

    // 2. Actualizar estado del terreno
    const updateResult = await client.query(
      `
      UPDATE terrenos
      SET estado = $1
      WHERE id = $2
      RETURNING *
      `,
      [estado, id]
    );

    // 3. Guardar revisión administrativa
    await client.query(
      `
      INSERT INTO revisiones_terrenos
      (
        terreno_id,
        admin_id,
        estado_revision,
        mensaje
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        id,
        admin_id,
        estado,
        mensaje?.trim() || null,
      ]
    );

    // 4. Crear notificación al colaborador
    let tituloNotificacion = "Actualización de tu publicación";
    let mensajeNotificacion = `El estado de tu terreno "${terreno.titulo}" fue actualizado a "${estado}".`;

    if (estado === "aprobado") {
      tituloNotificacion = "Publicación aprobada";
      mensajeNotificacion =
        mensaje?.trim() ||
        `Tu terreno "${terreno.titulo}" fue aprobado y ya puede mostrarse públicamente.`;
    }

    if (estado === "rechazado") {
      tituloNotificacion = "Publicación rechazada";
      mensajeNotificacion =
        mensaje?.trim() ||
        `Tu terreno "${terreno.titulo}" fue rechazado. Revisa la observación del administrador y vuelve a postularlo.`;
    }

    await client.query(
      `
      INSERT INTO notificaciones
      (
        usuario_id,
        tipo,
        titulo,
        mensaje,
        referencia_id,
        referencia_tipo,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        colaborador_id,
        "revision_publicacion",
        tituloNotificacion,
        mensajeNotificacion,
        Number(id),
        "terreno",
        JSON.stringify({
          terreno_id: Number(id),
          estado,
        }),
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Estado actualizado correctamente",
      terreno: updateResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizando estado:", error);
    res.status(500).json({
      message: "Error actualizando estado",
    });
  } finally {
    client.release();
  }
};

exports.obtenerPublicacionesBorradas = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM terrenos WHERE estado = 'eliminado' ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo borrados" });
  }
};

exports.restaurarPublicacion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE terrenos SET estado = 'pendiente' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.json({ message: "Publicación restaurada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error restaurando publicación" });
  }
};

exports.eliminarPublicacion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE terrenos SET estado = 'eliminado' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.json({ message: "Publicación enviada a borrados correctamente" });
  } catch (error) {
    console.error("Error eliminando publicación:", error);
    res.status(500).json({ message: "Error eliminando publicación" });
  }
};

exports.eliminarDefinitivamente = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM terrenos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    res.json({ message: "Publicación eliminada permanentemente" });
  } catch (error) {
    console.error("Error eliminando definitivamente:", error);
    res.status(500).json({ message: "Error eliminando definitivamente" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      usuariosResult,
      colaboradoresResult,
      terrenosActivosResult,
      pendientesResult,
      suscripcionesActivasResult,
      suscripcionesPorVencerResult,
      publicacionesRecientesResult,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM usuarios`),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM usuarios
        WHERE rol = 'colaborador'
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM terrenos
        WHERE estado = 'aprobado'
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM terrenos
        WHERE estado = 'pendiente'
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM suscripciones
        WHERE estado IN ('activa', 'trialing')
      `),

      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM suscripciones
        WHERE estado IN ('activa', 'trialing')
          AND fecha_fin IS NOT NULL
          AND fecha_fin <= NOW() + INTERVAL '30 days'
      `),

      pool.query(`
        SELECT
          t.id,
          t.titulo,
          t.estado,
          t.creado_en,
          u.nombre,
          u.apellido
        FROM terrenos t
        JOIN usuarios u ON u.id = t.usuario_id
        WHERE t.estado != 'eliminado'
        ORDER BY t.creado_en DESC
        LIMIT 6
      `),
    ]);

    return res.json({
      resumen: {
        usuariosTotales: usuariosResult.rows[0]?.total || 0,
        colaboradores: colaboradoresResult.rows[0]?.total || 0,
        terrenosActivos: terrenosActivosResult.rows[0]?.total || 0,
        pendientesAprobacion: pendientesResult.rows[0]?.total || 0,
        suscripcionesActivas: suscripcionesActivasResult.rows[0]?.total || 0,
        suscripcionesPorVencer: suscripcionesPorVencerResult.rows[0]?.total || 0,
      },
      publicacionesRecientes: publicacionesRecientesResult.rows,
    });
  } catch (error) {
    console.error("Error obteniendo dashboard admin:", error);
    return res.status(500).json({
      message: "Error obteniendo estadísticas del dashboard",
    });
  }
};

/* ===========================
   COLABORADORES
=========================== */

exports.updateColaboradorLimite = async (req, res) => {
  try {
    const { id } = req.params;
    const { limite_terrenos_override, ilimitado } = req.body;

    const usuarioResult = await pool.query(
      `
      SELECT id, suscripcion_actual_id, rol
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    const usuario = usuarioResult.rows[0];

    if (!usuario) {
      return res.status(404).json({
        message: "Colaborador no encontrado",
      });
    }

    if (usuario.rol !== "colaborador") {
      return res.status(400).json({
        message: "El usuario no es colaborador",
      });
    }

    if (!usuario.suscripcion_actual_id) {
      return res.status(400).json({
        message: "El colaborador no tiene una suscripción actual asignada",
      });
    }

    let nuevoLimite = null;

    if (!ilimitado) {
      const limite = Number(limite_terrenos_override);

      if (Number.isNaN(limite) || limite < 0) {
        return res.status(400).json({
          message: "Debes enviar un límite válido o marcar la opción ilimitado",
        });
      }

      nuevoLimite = limite;
    }

    const result = await pool.query(
      `
      UPDATE suscripciones
      SET
        limite_terrenos_override = $1,
        actualizada_en = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [nuevoLimite, usuario.suscripcion_actual_id]
    );

    return res.json({
      message: ilimitado
        ? "Límite actualizado a ilimitado"
        : "Límite de publicaciones actualizado correctamente",
      suscripcion: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando límite del colaborador:", error);
    return res.status(500).json({
      message: "Error actualizando el límite del colaborador",
    });
  }
};