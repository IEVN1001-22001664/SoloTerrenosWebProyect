const pool = require("../db");

exports.createLead = async (req, res) => {
  try {
    const {
      terreno_id,
      nombre_contacto,
      email_contacto,
      telefono_contacto,
      mensaje,
    } = req.body;

    // =================================
    // VALIDAR AUTENTICACIÓN
    // =================================
    if (!req.user) {
      return res.status(401).json({
        message: "Debes iniciar sesión para contactar al vendedor",
      });
    }

    const comprador_id = req.user.id;

    // =================================
    // VALIDAR DATOS
    // =================================
    if (!terreno_id || !nombre_contacto || !email_contacto || !telefono_contacto) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
      });
    }

    // =================================
    // OBTENER TERRENO Y VENDEDOR
    // =================================
    const terrenoResult = await pool.query(
      `
      SELECT id, usuario_id, titulo
      FROM terrenos
      WHERE id = $1
      `,
      [terreno_id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado",
      });
    }

    const terreno = terrenoResult.rows[0];
    const vendedor_id = terreno.usuario_id;

    // =================================
    // EVITAR AUTO-LEAD (OPCIONAL PERO PRO)
    // =================================
    if (vendedor_id === comprador_id) {
      return res.status(400).json({
        message: "No puedes contactarte a ti mismo",
      });
    }

    // =================================
    // CREAR LEAD
    // =================================
    const leadResult = await pool.query(
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
        telefono_contacto,
        mensaje || null,
      ]
    );

    const lead = leadResult.rows[0];

    // =================================
    // CREAR NOTIFICACIÓN (Nivel 2 listo para escalar)
    // =================================
    await pool.query(
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
          comprador_id: comprador_id,
        }),
      ]
    );

    // =================================
    // RESPUESTA
    // =================================
    res.status(201).json({
      message: "Solicitud enviada correctamente",
      lead,
    });

  } catch (error) {
    console.error("Error creando lead:", error);

    res.status(500).json({
      message: "Error al enviar solicitud",
    });
  }
};