const pool = require("../db");
const fs = require("fs");
const path = require("path");

// =================================
// SUBIR DOCUMENTOS LEGALES
// =================================
exports.subirDocumentos = async (req, res) => {
  try {
    const terreno_id = req.params.id;
    const usuario_id = req.user.id;
    const rol = req.user.rol;

    // =================================
    // VERIFICAR PROPIETARIO DEL TERRENO
    // =================================
    const terrenoResult = await pool.query(
      "SELECT usuario_id FROM terrenos WHERE id = $1",
      [terreno_id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const propietario = terrenoResult.rows[0].usuario_id;

    if (propietario !== usuario_id && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para subir documentos a este terreno"
      });
    }

    // =================================
    // VALIDAR ARCHIVOS
    // =================================
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No se subieron documentos"
      });
    }

    const documentosGuardados = [];

    for (const file of files) {
      const ruta = `/uploads/documentos/${terreno_id}/${file.filename}`;

      const result = await pool.query(
        `
        INSERT INTO terreno_documentos
        (
          terreno_id,
          nombre_original,
          nombre_archivo,
          ruta,
          tipo_mime,
          tamano_bytes
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          terreno_id,
          file.originalname,
          file.filename,
          ruta,
          file.mimetype,
          file.size
        ]
      );

      documentosGuardados.push(result.rows[0]);
    }

    res.json({
      message: "Documentos subidos correctamente",
      documentos: documentosGuardados
    });

  } catch (error) {
    console.error("Error subiendo documentos legales:", error);

    res.status(500).json({
      message: "Error subiendo documentos legales"
    });
  }
};

// =================================
// OBTENER DOCUMENTOS DE UN TERRENO
// =================================
exports.obtenerDocumentosTerreno = async (req, res) => {
  try {
    const terreno_id = req.params.id;
    const usuario_id = req.user.id;
    const rol = req.user.rol;

    // =================================
    // VERIFICAR PROPIETARIO DEL TERRENO
    // =================================
    const terrenoResult = await pool.query(
      "SELECT usuario_id FROM terrenos WHERE id = $1",
      [terreno_id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const propietario = terrenoResult.rows[0].usuario_id;

    if (propietario !== usuario_id && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para ver estos documentos"
      });
    }

    // =================================
    // CONSULTAR DOCUMENTOS
    // =================================
    const result = await pool.query(
      `
      SELECT
        id,
        terreno_id,
        nombre_original,
        nombre_archivo,
        ruta,
        tipo_mime,
        tamano_bytes,
        creado_en
      FROM terreno_documentos
      WHERE terreno_id = $1
      ORDER BY id ASC
      `,
      [terreno_id]
    );

    res.json({
      total: result.rows.length,
      documentos: result.rows
    });

  } catch (error) {
    console.error("Error obteniendo documentos legales:", error);

    res.status(500).json({
      message: "Error al obtener documentos legales"
    });
  }
};

// =================================
// ELIMINAR DOCUMENTO LEGAL
// =================================
exports.eliminarDocumento = async (req, res) => {
  try {
    const documento_id = req.params.id;
    const usuario_id = req.user.id;
    const rol = req.user.rol;

    // =================================
    // BUSCAR DOCUMENTO EN BD
    // =================================
    const result = await pool.query(
      `
      SELECT id, terreno_id, ruta
      FROM terreno_documentos
      WHERE id = $1
      `,
      [documento_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Documento no encontrado"
      });
    }

    const documento = result.rows[0];

    // =================================
    // VERIFICAR PROPIETARIO DEL TERRENO
    // =================================
    const terrenoResult = await pool.query(
      `
      SELECT usuario_id
      FROM terrenos
      WHERE id = $1
      `,
      [documento.terreno_id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const propietario = terrenoResult.rows[0].usuario_id;

    if (propietario !== usuario_id && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para eliminar este documento"
      });
    }

    // =================================
    // ELIMINAR ARCHIVO FÍSICO
    // =================================
    const rutaArchivo = path.join(__dirname, "..", documento.ruta);

    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    // =================================
    // ELIMINAR REGISTRO EN BD
    // =================================
    await pool.query(
      `
      DELETE FROM terreno_documentos
      WHERE id = $1
      `,
      [documento_id]
    );

    res.json({
      message: "Documento eliminado correctamente"
    });

  } catch (error) {
    console.error("Error eliminando documento legal:", error);

    res.status(500).json({
      message: "Error al eliminar documento legal"
    });
  }
};