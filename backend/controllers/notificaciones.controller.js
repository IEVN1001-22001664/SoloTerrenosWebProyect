const pool = require("../db");

// =================================
// OBTENER MIS NOTIFICACIONES
// =================================
exports.getMisNotificaciones = async (req, res) => {
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
        id,
        tipo,
        titulo,
        mensaje,
        leida,
        referencia_id,
        referencia_tipo,
        canal,
        estado_envio,
        metadata,
        creado_en,
        actualizado_en
      FROM notificaciones
      WHERE usuario_id = $1
      ORDER BY creado_en DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    res.status(500).json({
      message: "Error al obtener notificaciones",
    });
  }
};

// =================================
// MARCAR UNA NOTIFICACIÓN COMO LEÍDA
// =================================
exports.marcarComoLeida = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE notificaciones
      SET
        leida = TRUE,
        actualizado_en = NOW()
      WHERE id = $1
        AND usuario_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notificación no encontrada",
      });
    }

    res.json({
      message: "Notificación marcada como leída",
      notificacion: result.rows[0],
    });
  } catch (error) {
    console.error("Error marcando notificación como leída:", error);
    res.status(500).json({
      message: "Error al actualizar notificación",
    });
  }
};

// =================================
// MARCAR TODAS COMO LEÍDAS
// =================================
exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const userId = req.user.id;

    await pool.query(
      `
      UPDATE notificaciones
      SET
        leida = TRUE,
        actualizado_en = NOW()
      WHERE usuario_id = $1
        AND leida = FALSE
      `,
      [userId]
    );

    res.json({
      message: "Todas las notificaciones fueron marcadas como leídas",
    });
  } catch (error) {
    console.error("Error marcando todas como leídas:", error);
    res.status(500).json({
      message: "Error al actualizar notificaciones",
    });
  }
};