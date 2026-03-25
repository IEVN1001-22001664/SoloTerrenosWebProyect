const { getIO } = require("../socket");
const pool = require("../db");

// =================================
// OBTENER MIS CONVERSACIONES
// =================================
exports.getMisConversaciones = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        c.id AS conversacion_id,
        c.lead_id,
        c.terreno_id,
        c.comprador_id,
        c.vendedor_id,
        c.estado,
        c.creado_en,
        c.actualizado_en,
        c.ultimo_mensaje_en,

        t.titulo AS terreno_titulo,
        t.precio AS terreno_precio,
        t.municipio,
        t.estado_region,

        (
          SELECT ti.url
          FROM terreno_imagenes ti
          WHERE ti.terreno_id = t.id
          ORDER BY ti.id ASC
          LIMIT 1
        ) AS imagen_principal,

        u_remoto.id AS contacto_id,
        u_remoto.nombre AS contacto_nombre,
        u_remoto.apellido AS contacto_apellido,
        u_remoto.email AS contacto_email,

        (
          SELECT m.contenido
          FROM mensajes m
          WHERE m.conversacion_id = c.id
          ORDER BY m.creado_en DESC
          LIMIT 1
        ) AS ultimo_mensaje,

        (
          SELECT COUNT(*)
          FROM mensajes m
          WHERE m.conversacion_id = c.id
            AND m.remitente_id <> $1
            AND m.leido = FALSE
        ) AS no_leidos
      FROM conversaciones c
      INNER JOIN terrenos t ON t.id = c.terreno_id
      INNER JOIN usuarios u_remoto
        ON u_remoto.id =
          CASE
            WHEN c.comprador_id = $1 THEN c.vendedor_id
            ELSE c.comprador_id
          END
      WHERE c.comprador_id = $1 OR c.vendedor_id = $1
      ORDER BY c.ultimo_mensaje_en DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo conversaciones:", error);
    res.status(500).json({
      message: "Error al obtener conversaciones",
    });
  }
};

// =================================
// OBTENER MENSAJES DE UNA CONVERSACIÓN
// =================================
exports.getMensajesConversacion = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const conversacionResult = await pool.query(
      `
      SELECT *
      FROM conversaciones
      WHERE id = $1
      `,
      [id]
    );

    if (conversacionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Conversación no encontrada",
      });
    }

    const conversacion = conversacionResult.rows[0];

    if (
      Number(conversacion.comprador_id) !== Number(userId) &&
      Number(conversacion.vendedor_id) !== Number(userId)
    ) {
      return res.status(403).json({
        message: "No tienes permiso para ver esta conversación",
      });
    }

    const mensajesResult = await pool.query(
      `
      SELECT
        m.id,
        m.conversacion_id,
        m.remitente_id,
        m.contenido,
        m.leido,
        m.creado_en,
        u.nombre,
        u.apellido
      FROM mensajes m
      INNER JOIN usuarios u ON u.id = m.remitente_id
      WHERE m.conversacion_id = $1
      ORDER BY m.creado_en ASC
      `,
      [id]
    );

    await pool.query(
      `
      UPDATE mensajes
      SET leido = TRUE
      WHERE conversacion_id = $1
        AND remitente_id <> $2
        AND leido = FALSE
      `,
      [id, userId]
    );

    res.json({
      conversacion,
      mensajes: mensajesResult.rows,
    });
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    res.status(500).json({
      message: "Error al obtener mensajes",
    });
  }
};

// =================================
// ENVIAR MENSAJE EN UNA CONVERSACIÓN
// =================================
exports.sendMensaje = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const { contenido } = req.body;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({
        message: "El mensaje no puede estar vacío",
      });
    }

    const conversacionResult = await client.query(
      `
      SELECT *
      FROM conversaciones
      WHERE id = $1
      `,
      [id]
    );

    if (conversacionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Conversación no encontrada",
      });
    }

    const conversacion = conversacionResult.rows[0];

    if (
      Number(conversacion.comprador_id) !== Number(userId) &&
      Number(conversacion.vendedor_id) !== Number(userId)
    ) {
      return res.status(403).json({
        message: "No tienes permiso para enviar mensajes en esta conversación",
      });
    }

    await client.query("BEGIN");

    const mensajeResult = await client.query(
      `
      INSERT INTO mensajes
      (
        conversacion_id,
        remitente_id,
        contenido
      )
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [id, userId, contenido.trim()]
    );

    await client.query(
      `
      UPDATE conversaciones
      SET
        actualizado_en = NOW(),
        ultimo_mensaje_en = NOW()
      WHERE id = $1
      `,
      [id]
    );

    const destinatarioId =
      Number(conversacion.comprador_id) === Number(userId)
        ? conversacion.vendedor_id
        : conversacion.comprador_id;

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
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        destinatarioId,
        "mensaje_nuevo",
        "Tienes un nuevo mensaje",
        "Recibiste un nuevo mensaje en una conversación activa.",
        Number(id),
        "conversacion",
        JSON.stringify({
          conversacion_id: Number(id),
          terreno_id: conversacion.terreno_id,
          remitente_id: userId,
        }),
      ]
    );

    const remitenteResult = await client.query(
      `
      SELECT id, nombre, apellido
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    await client.query("COMMIT");

    const remitente = remitenteResult.rows[0] || {};

    const mensajePayload = {
      id: mensajeResult.rows[0].id,
      conversacion_id: mensajeResult.rows[0].conversacion_id,
      remitente_id: mensajeResult.rows[0].remitente_id,
      contenido: mensajeResult.rows[0].contenido,
      leido: mensajeResult.rows[0].leido,
      creado_en: mensajeResult.rows[0].creado_en,
      nombre: remitente.nombre || "",
      apellido: remitente.apellido || "",
    };

    try {
      const io = getIO();

      io.to(`user_${destinatarioId}`).emit("nuevo_mensaje", mensajePayload);

      io.to(`conv_${Number(id)}`).emit("nuevo_mensaje", mensajePayload);
    } catch (socketError) {
      console.error("Error emitiendo socket nuevo_mensaje:", socketError);
    }

    res.status(201).json({
      message: "Mensaje enviado correctamente",
      mensaje: mensajePayload,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error enviando mensaje:", error);
    res.status(500).json({
      message: "Error al enviar mensaje",
    });
  } finally {
    client.release();
  }
};