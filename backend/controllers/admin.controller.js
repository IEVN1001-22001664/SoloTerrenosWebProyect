const pool = require('../db');

/* ===========================
   USUARIOS
=========================== */

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, email, rol, suscripcion_activa
      FROM usuarios
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
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
        u.suscripcion_activa,
        u.auto_aprobado,
        COUNT(t.id) AS publicaciones
      FROM usuarios u
      LEFT JOIN terrenos t ON t.usuario_id = u.id
      WHERE u.rol = 'colaborador'
      GROUP BY u.id
      ORDER BY u.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
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