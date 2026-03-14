const pool = require("../db");

// =============================
// UTILIDADES GEOGRÁFICAS
// =============================

function getCenter(poligono) {
//console.log("POLIGONO RECIBIDO:", poligono);
//console.log("TIPO:", typeof poligono);

  let lat = 0;
  let lng = 0;

  poligono.forEach(p => {
    lat += p[0];
    lng += p[1];
  });

  return {
    lat: lat / poligono.length,
    lng: lng / poligono.length
  };
}

function getPerimeter(poligono) {

  let perimetro = 0;

  for (let i = 0; i < poligono.length; i++) {

    const p1 = poligono[i];
    const p2 = poligono[(i + 1) % poligono.length];

    const dx = (p2[1] - p1[1]) * 111320;
    const dy = (p2[0] - p1[0]) * 110540;

    perimetro += Math.sqrt(dx * dx + dy * dy);
  }

  return perimetro;
}

function getArea(poligono) {

  let area = 0;

  for (let i = 0; i < poligono.length; i++) {

    const j = (i + 1) % poligono.length;

    area +=
      poligono[i][1] * poligono[j][0] -
      poligono[j][1] * poligono[i][0];
  }

  return Math.abs(area / 2) * 12365;
}


// =============================
// Obtener terrenos públicos (MAPA)
// =============================

exports.getPublicos = async (req, res) => {

  console.log("Endpoint /terrenos/publicos llamado");

  try {

    const result = await pool.query(
      `SELECT * FROM terrenos 
       WHERE estado = 'aprobado'
       ORDER BY creado_en DESC`
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error obteniendo terrenos" });

  }

};


// =============================
// Obtener todos los terrenos públicos
// =============================

exports.getAllPublic = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM terrenos WHERE estado = 'aprobado' ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error al obtener terrenos" });

  }

};


// =============================
// Obtener todos los terrenos ADMIN
// =============================

exports.getAllAdmin = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM terrenos ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error al obtener terrenos" });

  }

};


// =============================
// Obtener terreno por ID
// =============================

exports.getById = async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      "SELECT * FROM terrenos WHERE id = $1 AND estado = 'aprobado'",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error del servidor" });

  }

};

// =================================
// CREAR TERRENO
// =================================
exports.createTerreno = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      precio,
      ubicacion,
      tipo,
      estado_region,
      municipio,
      colonia,
      direccion,
      codigo_postal,
      topografia,
      forma,
      tipo_propiedad,
      uso_suelo,
      negociable,
      escritura,
      estatus_legal,
      gravamen
    } = req.body;

    const usuario_id = req.user.id;

    let { poligono } = req.body;

    //console.log("BODY RECIBIDO:", req.body);

    // =================================
    // EXTRAER POLIGONO REAL
    // =================================

    if (poligono?.polygon) {
      poligono = poligono.polygon;
    }

    // =================================
    // VALIDAR POLIGONO
    // =================================

    if (!Array.isArray(poligono) || poligono.length < 3) {
      return res.status(400).json({
        message: "Polígono inválido"
      });
    }

    // =================================
    // CALCULOS
    // =================================

    const centro = getCenter(poligono);
    const area = getArea(poligono);
    const perimetro = getPerimeter(poligono);

    // =================================
    // VERIFICAR AUTOAPROBADO
    // =================================

    const userResult = await pool.query(
      "SELECT auto_aprobado FROM usuarios WHERE id = $1",
      [usuario_id]
    );

    const autoAprobado = userResult.rows[0]?.auto_aprobado;

    const estadoFinal = autoAprobado ? "aprobado" : "pendiente";

    // =================================
    // INSERTAR TERRENO
    // =================================

    const result = await pool.query(
      `
      INSERT INTO terrenos 
      (
        titulo,
        descripcion,
        precio,
        ubicacion,
        tipo,
        poligono,
        usuario_id,
        estado,
        centro_lat,
        centro_lng,
        area_m2,
        perimetro_m,
        estado_region,
        municipio,
        colonia,
        direccion,
        codigo_postal,
        topografia,
        forma,
        tipo_propiedad,
        uso_suelo,
        negociable,
        escritura,
        estatus_legal,
        gravamen
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25
      )
      RETURNING *
      `,
      [
        titulo,
        descripcion,
        precio,
        ubicacion,
        tipo,
        JSON.stringify(poligono),
        usuario_id,
        estadoFinal,
        centro.lat,
        centro.lng,
        area,
        perimetro,
        estado_region,
        municipio,
        colonia,
        direccion,
        codigo_postal,
        topografia,
        forma,
        tipo_propiedad,
        uso_suelo,
        negociable,
        escritura || null,
        estatus_legal || null,
        gravamen ?? false
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Error creando terreno:", error);

    res.status(500).json({
      message: "Error al crear terreno"
    });
  }
};


// =============================
// Actualizar terreno
// =============================

exports.updateTerreno = async (req, res) => {

  const { id } = req.params;
  const { titulo, descripcion, precio, ubicacion, tipo, poligono } = req.body;

  const centro = getCenter(poligono);
  const area = getArea(poligono);
  const perimetro = getPerimeter(poligono);

  try {

    const result = await pool.query(
      `UPDATE terrenos
       SET titulo = $1,
           descripcion = $2,
           precio = $3,
           ubicacion = $4,
           tipo = $5,
           poligono = $6,
           centro_lat = $7,
           centro_lng = $8,
           area_m2 = $9,
           perimetro_m = $10
       WHERE id = $11
       RETURNING *`,
      [
        titulo,
        descripcion,
        precio,
        ubicacion,
        tipo,
        JSON.stringify(poligono),
        centro.lat,
        centro.lng,
        area,
        perimetro,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Error actualizando terreno:", error);
    res.status(500).json({ error: "Error actualizando terreno" });

  }

};


// =============================
// Eliminar terreno
// =============================

exports.deleteTerreno = async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      "UPDATE terrenos SET estado = 'eliminado' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    res.json({ message: "Terreno enviado a borrados correctamente" });

  } catch (error) {

    console.error("Error eliminando terreno:", error);
    res.status(500).json({ error: "Error eliminando terreno" });

  }

};