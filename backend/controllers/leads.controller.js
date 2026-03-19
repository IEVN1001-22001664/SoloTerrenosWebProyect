const pool = require("../db");

exports.createLead = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      terreno_id,
      nombre_contacto,
      email_contacto,
      telefono_contacto,
      mensaje,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Debes iniciar sesión para contactar al vendedor",
      });
    }

    const comprador_id = req.user.id;

    if (!terreno_id || !nombre_contacto || !email_contacto) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
      });
    }

    await client.query("BEGIN");

    const terrenoResult = await client.query(
      `
      SELECT id, usuario_id, titulo
      FROM terrenos
      WHERE id = $1
      `,
      [terreno_id]
    );

    if (terrenoResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Terreno no encontrado",
      });
    }

    const terreno = terrenoResult.rows[0];
    const vendedor_id = terreno.usuario_id;

    if (vendedor_id === comprador_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "No puedes contactarte a ti mismo",
      });
    }

    const leadResult = await client.query(
      `
      INSERT INTO leads_terrenos
      (
        terreno_id,
        comprador_id,
        vendedor_id,
        nombre_contacto,
        email_contacto,
        telefono_contacto,
        mensaje
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        terreno_id,
        comprador_id,
        vendedor_id,
        nombre_contacto,
        email_contacto,
        telefono_contacto || null,
        mensaje || null,
      ]
    );

    const lead = leadResult.rows[0];

    const conversacionResult = await client.query(
      `
      INSERT INTO conversaciones
      (
        lead_id,
        terreno_id,
        comprador_id,
        vendedor_id,
        estado,
        ultimo_mensaje_en
      )
      VALUES ($1,$2,$3,$4,'activa',NOW())
      RETURNING *
      `,
      [lead.id, terreno_id, comprador_id, vendedor_id]
    );

    const conversacion = conversacionResult.rows[0];

    const mensajeInicial =
      mensaje && mensaje.trim()
        ? mensaje.trim()
        : "Hola, me interesa este terreno. ¿Podrían brindarme más información?";

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
      [conversacion.id, comprador_id, mensajeInicial]
    );

    const primerMensaje = mensajeResult.rows[0];

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
        vendedor_id,
        "lead_nuevo",
        "Nuevo interesado en tu terreno",
        `Un usuario está interesado en "${terreno.titulo}"`,
        lead.id,
        "lead",
        JSON.stringify({
          terreno_id: terreno.id,
          terreno_titulo: terreno.titulo,
          comprador_id,
          conversacion_id: conversacion.id,
        }),
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Solicitud enviada correctamente",
      lead,
      conversacion,
      mensaje: primerMensaje,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error creando lead:", error);

    res.status(500).json({
      message: "Error al enviar solicitud",
    });
  } finally {
    client.release();
  }
};

exports.getMisLeads = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado",
      });
    }

    const vendedor_id = req.user.id;
    const rol = req.user.rol;

    if (rol !== "colaborador" && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para ver esta información",
      });
    }

    const result = await pool.query(
      `
      SELECT
        l.id AS lead_id,
        l.terreno_id,
        l.comprador_id,
        l.nombre_contacto,
        l.email_contacto,
        l.telefono_contacto,
        l.mensaje,
        l.estado,
        l.creado_en,

        t.titulo AS terreno_titulo,
        t.precio AS terreno_precio,
        t.municipio,
        t.estado_region,

        c.id AS conversacion_id,

        (
          SELECT ti.url
          FROM terreno_imagenes ti
          WHERE ti.terreno_id = t.id
          ORDER BY ti.id ASC
          LIMIT 1
        ) AS imagen_principal
      FROM leads_terrenos l
      INNER JOIN terrenos t ON t.id = l.terreno_id
      LEFT JOIN conversaciones c ON c.lead_id = l.id
      WHERE l.vendedor_id = $1
      ORDER BY l.creado_en DESC
      `,
      [vendedor_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo mis leads:", error);

    res.status(500).json({
      message: "Error al obtener leads",
    });
  }
};