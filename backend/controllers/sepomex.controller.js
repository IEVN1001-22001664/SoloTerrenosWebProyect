// ======================================================
// IMPORTAR CONEXIÓN A BASE DE DATOS
// ======================================================

const pool = require("../db");

// ======================================================
// OBTENER DATOS DE SEPOMEX POR CÓDIGO POSTAL
// ======================================================
// Endpoint esperado:
// GET /api/sepomex/:codigoPostal
//
// Respuesta:
// {
//   codigo_postal: "37260",
//   estado: "Guanajuato",
//   municipio: "León",
//   colonias: ["Centro", "Obregón", "San Juan de Dios"]
// }
// ======================================================

exports.getByCodigoPostal = async (req, res) => {
  try {
    // =================================
    // OBTENER PARÁMETRO
    // =================================
    const { codigoPostal } = req.params;

    // =================================
    // VALIDAR CÓDIGO POSTAL
    // =================================
    if (!codigoPostal || !/^\d{5}$/.test(codigoPostal)) {
      return res.status(400).json({
        message: "Código postal inválido. Debe contener 5 dígitos."
      });
    }

    // =================================
    // CONSULTAR SEPOMEX
    // =================================
    const result = await pool.query(
      `
      SELECT
        d_codigo,
        d_asenta,
        d_mnpio,
        d_estado
      FROM sepomex_completo
      WHERE d_codigo = $1
      ORDER BY d_asenta ASC
      `,
      [codigoPostal]
    );

    // =================================
    // VALIDAR RESULTADOS
    // =================================
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Código postal no encontrado"
      });
    }

    // =================================
    // EXTRAER ESTADO Y MUNICIPIO
    // =================================
    const estado = result.rows[0].d_estado;
    const municipio = result.rows[0].d_mnpio;

    // =================================
    // OBTENER COLONIAS SIN DUPLICADOS
    // =================================
    const colonias = [
      ...new Set(
        result.rows
          .map((row) => row.d_asenta?.trim())
          .filter(Boolean)
      )
    ];

    // =================================
    // RESPUESTA
    // =================================
    return res.status(200).json({
      codigo_postal: codigoPostal,
      estado,
      municipio,
      colonias
    });

  } catch (error) {
    console.error("Error consultando SEPOMEX:", error);

    return res.status(500).json({
      message: "Error al consultar SEPOMEX"
    });
  }
};