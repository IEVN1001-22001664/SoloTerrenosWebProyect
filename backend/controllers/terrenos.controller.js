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

function projectToMeters(poligono) {
  if (!Array.isArray(poligono) || poligono.length === 0) return [];

  // Punto de referencia para proyección local
  const lat0 =
    poligono.reduce((acc, [lat]) => acc + Number(lat), 0) / poligono.length;

  const lng0 =
    poligono.reduce((acc, [, lng]) => acc + Number(lng), 0) / poligono.length;

  const latFactor = 110540; // metros por grado de latitud
  const lngFactor = 111320 * Math.cos((lat0 * Math.PI) / 180); // metros por grado de longitud ajustado por latitud

  return poligono.map(([lat, lng]) => {
    const y = (Number(lat) - lat0) * latFactor;
    const x = (Number(lng) - lng0) * lngFactor;

    return [x, y];
  });
}

function getPerimeter(poligono) {
  if (!Array.isArray(poligono) || poligono.length < 2) return 0;

  const points = projectToMeters(poligono);
  let perimetro = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];

    const dx = x2 - x1;
    const dy = y2 - y1;

    perimetro += Math.sqrt(dx * dx + dy * dy);
  }

  return perimetro;
}

function getArea(poligono) {
  if (!Array.isArray(poligono) || poligono.length < 3) return 0;

  const points = projectToMeters(poligono);
  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];

    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2); // m²
}


// =============================
// Obtener terrenos públicos 
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
    const result = await pool.query(`
      SELECT
        t.*,
        (
          SELECT ti.url
          FROM terreno_imagenes ti
          WHERE ti.terreno_id = t.id
          ORDER BY ti.id ASC
          LIMIT 1
        ) AS imagen_principal
      FROM terrenos t
      WHERE t.estado = 'aprobado'
      ORDER BY t.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener terrenos" });
  }
};

// =============================
// Terrenos públicos para mapa
// =============================
exports.getTerrenosMapa = async (req, res) => {
  try {
    console.log("🔥🔥🔥 GET TERRENOS MAPA ACTIVADO 🔥🔥🔥");
    console.log("======================================");
    console.log("ENTRÓ A getTerrenosMapa");
    console.log("Query params recibidos:", req.query);

    const {
      north,
      south,
      east,
      west,
      q,
      tipo,
      precioMin,
      precioMax,
    } = req.query;

    if (!north || !south || !east || !west) {
      console.log("Faltan bounds obligatorios");
      return res.status(400).json({
        message: "Bounds requeridos",
      });
    }

    const values = [south, north, west, east];

    let filters = `
      t.estado = 'aprobado'
      AND t.centro_lat IS NOT NULL
      AND t.centro_lng IS NOT NULL
      AND t.centro_lat BETWEEN $1 AND $2
      AND t.centro_lng BETWEEN $3 AND $4
    `;

    let idx = 5;

    if (q) {
      filters += ` AND (t.titulo ILIKE $${idx} OR t.ubicacion ILIKE $${idx})`;
      values.push(`%${q}%`);
      idx++;
    }

    if (tipo) {
      filters += ` AND t.tipo = $${idx}`;
      values.push(tipo);
      idx++;
    }

    if (precioMin) {
      filters += ` AND t.precio >= $${idx}`;
      values.push(precioMin);
      idx++;
    }

    if (precioMax) {
      filters += ` AND t.precio <= $${idx}`;
      values.push(precioMax);
      idx++;
    }

    const query = `
      SELECT
        t.*
      FROM terrenos t
      WHERE ${filters}
      ORDER BY t.creado_en DESC
      LIMIT 200
    `;

    console.log("Bounds procesados:", { north, south, east, west });
    console.log("Filtros procesados:", { q, tipo, precioMin, precioMax });
    console.log("Values enviados a SQL:", values);
    console.log("SQL final:", query);

    const result = await pool.query(query, values);

    console.log("Consulta ejecutada correctamente");
    console.log("Terrenos encontrados:", result.rows.length);

    if (result.rows.length > 0) {
      console.log("Primer terreno encontrado:", result.rows[0]);
    } else {
      console.log("No se encontraron terrenos para esos bounds/filtros");
    }

    console.log("Saliendo de getTerrenosMapa con éxito");
    console.log("======================================");

    res.json(result.rows);
  } catch (error) {
    console.log("======================================");
    console.error("ERROR EN getTerrenosMapa");
    console.error("Mensaje:", error.message);
    console.error("Código:", error.code);
    console.error("Detalle:", error.detail);
    console.error("Hint:", error.hint);
    console.error("Where:", error.where);
    console.error("Stack:", error.stack);
    console.log("======================================");

    res.status(500).json({
      message: "Error obteniendo terrenos del mapa",
      error: error.message,
      code: error.code || null,
      detail: error.detail || null,
    });
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


// =================================
// ACTUALIZAR TERRENO
// =================================
exports.updateTerreno = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const rol = req.user.rol;

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

    let { poligono } = req.body;

    // =================================
    // VERIFICAR QUE EL TERRENO EXISTA
    // =================================
    const terrenoResult = await pool.query(
      `
      SELECT id, usuario_id, estado
      FROM terrenos
      WHERE id = $1
      `,
      [id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const terrenoActual = terrenoResult.rows[0];

    // =================================
    // VALIDAR PERMISOS
    // =================================
    if (rol !== "admin" && terrenoActual.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permiso para editar este terreno"
      });
    }

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
    // DEFINIR NUEVO ESTADO
    // =================================
    let estadoFinal = terrenoActual.estado;

    if (rol !== "admin") {
      const userResult = await pool.query(
        "SELECT auto_aprobado FROM usuarios WHERE id = $1",
        [usuario_id]
      );

      const autoAprobado = userResult.rows[0]?.auto_aprobado;

      // Si estaba eliminado, no lo tocamos desde edición normal
      if (terrenoActual.estado === "eliminado") {
        estadoFinal = "eliminado";
      }
      // Si estaba pausado, conserva pausado al editar
      else if (terrenoActual.estado === "pausado") {
        estadoFinal = "pausado";
      }
      // Para cualquier publicación editable normal:
      // - autoaprobado => aprobado
      // - no autoaprobado => pendiente
      else {
        estadoFinal = autoAprobado ? "aprobado" : "pendiente";
      }
    }

    // =================================
    // ACTUALIZAR TERRENO
    // =================================
    const result = await pool.query(
      `
      UPDATE terrenos
      SET
        titulo = $1,
        descripcion = $2,
        precio = $3,
        ubicacion = $4,
        tipo = $5,
        poligono = $6,
        centro_lat = $7,
        centro_lng = $8,
        area_m2 = $9,
        perimetro_m = $10,
        estado_region = $11,
        municipio = $12,
        colonia = $13,
        direccion = $14,
        codigo_postal = $15,
        topografia = $16,
        forma = $17,
        tipo_propiedad = $18,
        uso_suelo = $19,
        negociable = $20,
        escritura = $21,
        estatus_legal = $22,
        gravamen = $23,
        estado = $24
      WHERE id = $25
      RETURNING *
      `,
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
        gravamen ?? false,
        estadoFinal,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error actualizando terreno:", error);

    res.status(500).json({
      message: "Error actualizando terreno"
    });
  }
};


const fs = require("fs");
const path = require("path");

// =============================
// Eliminar terreno definitivamente
// =============================
exports.deleteTerreno = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const rol = req.user.rol;

  try {
    // =================================
    // 1. VERIFICAR QUE EL TERRENO EXISTA
    // =================================
    const terrenoResult = await pool.query(
      `
      SELECT id, usuario_id
      FROM terrenos
      WHERE id = $1
      `,
      [id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const terreno = terrenoResult.rows[0];

    // =================================
    // 2. VALIDAR PERMISOS
    // =================================
    if (rol !== "admin" && terreno.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permiso para eliminar este terreno"
      });
    }

    // =================================
    // 3. ELIMINAR ARCHIVOS FÍSICOS
    // =================================
    const carpetaImagenes = path.join(__dirname, "..", "uploads", "terrenos", String(id));
    const carpetaDocumentos = path.join(__dirname, "..", "uploads", "documentos", String(id));

    if (fs.existsSync(carpetaImagenes)) {
      fs.rmSync(carpetaImagenes, { recursive: true, force: true });
    }

    if (fs.existsSync(carpetaDocumentos)) {
      fs.rmSync(carpetaDocumentos, { recursive: true, force: true });
    }

    // =================================
    // 4. ELIMINAR REGISTROS RELACIONADOS
    // =================================
    await pool.query(
      `DELETE FROM terreno_imagenes WHERE terreno_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM terreno_documentos WHERE terreno_id = $1`,
      [id]
    );

    // =================================
    // 5. ELIMINAR TERRENO
    // =================================
    await pool.query(
      `DELETE FROM terrenos WHERE id = $1`,
      [id]
    );

    res.json({
      message: "Terreno eliminado definitivamente"
    });

  } catch (error) {
    console.error("Error eliminando terreno definitivamente:", error);

    res.status(500).json({
      message: "Error eliminando terreno"
    });
  }
};

// =================================
// OBTENER MIS TERRENOS (COLABORADOR)
// =================================
exports.getMisTerrenos = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const rol = req.user.rol;

    if (!usuario_id) {
      return res.status(401).json({
        message: "No autenticado"
      });
    }

    if (rol !== "colaborador" && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para ver esta información"
      });
    }

    const result = await pool.query(
      `
      SELECT
        t.id,
        t.titulo,
        t.precio,
        t.tipo,
        t.estado,
        t.municipio,
        t.estado_region,
        t.area_m2,
        t.creado_en,

        (
          SELECT ti.url
          FROM terreno_imagenes ti
          WHERE ti.terreno_id = t.id
          ORDER BY ti.id ASC
          LIMIT 1
        ) AS imagen_principal,

        (
          SELECT rt.estado_revision
          FROM revisiones_terrenos rt
          WHERE rt.terreno_id = t.id
          ORDER BY rt.creado_en DESC
          LIMIT 1
        ) AS ultima_revision_estado,

        (
          SELECT rt.mensaje
          FROM revisiones_terrenos rt
          WHERE rt.terreno_id = t.id
          ORDER BY rt.creado_en DESC
          LIMIT 1
        ) AS ultima_revision_mensaje,

        (
          SELECT rt.creado_en
          FROM revisiones_terrenos rt
          WHERE rt.terreno_id = t.id
          ORDER BY rt.creado_en DESC
          LIMIT 1
        ) AS ultima_revision_fecha

      FROM terrenos t
      WHERE t.usuario_id = $1
      ORDER BY t.creado_en DESC
      `,
      [usuario_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error obteniendo mis terrenos:", error);

    res.status(500).json({
      message: "Error al obtener mis terrenos"
    });
  }
};

// =================================
// OBTENER TERRENO PARA EDICIÓN
// =================================
exports.getByIdForEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const rol = req.user.rol;

    // =================================
    // OBTENER TERRENO
    // =================================
    const result = await pool.query(
      `
      SELECT *
      FROM terrenos
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const terreno = result.rows[0];

    // =================================
    // VALIDAR PERMISOS
    // =================================
    if (rol !== "admin" && terreno.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permiso para editar este terreno"
      });
    }

    // =================================
    // OBTENER IMÁGENES
    // =================================
    const imagenesResult = await pool.query(
      `
      SELECT id, url
      FROM terreno_imagenes
      WHERE terreno_id = $1
      ORDER BY id ASC
      `,
      [id]
    );

    // =================================
    // OBTENER DOCUMENTOS
    // =================================
    const documentosResult = await pool.query(
      `
      SELECT
        id,
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
      [id]
    );

    // =================================
    // RECONSTRUIR POLÍGONO PARA FRONTEND
    // =================================
    let poligonoTransformado = null;

    if (terreno.poligono && Array.isArray(terreno.poligono)) {
      poligonoTransformado = {
        polygon: terreno.poligono,
        center: [
          parseFloat(terreno.centro_lat),
          parseFloat(terreno.centro_lng)
        ],
        area: parseFloat(terreno.area_m2),
        perimeter: parseFloat(terreno.perimetro_m)
      };
    }

    res.json({
      ...terreno,
      poligono: poligonoTransformado,
      imagenes: imagenesResult.rows,
      documentos: documentosResult.rows
    });

  } catch (error) {
    console.error("Error obteniendo terreno para edición:", error);

    res.status(500).json({
      message: "Error al obtener el terreno para edición"
    });
  }
};

// =============================
// Pausar terreno
// =============================
exports.pausarTerreno = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const rol = req.user.rol;

  try {
    const terrenoResult = await pool.query(
      `
      SELECT id, usuario_id, estado
      FROM terrenos
      WHERE id = $1
      `,
      [id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const terreno = terrenoResult.rows[0];

    if (rol !== "admin" && terreno.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permiso para pausar este terreno"
      });
    }

    const result = await pool.query(
      `
      UPDATE terrenos
      SET estado = 'pausado'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      message: "Terreno pausado correctamente",
      terreno: result.rows[0]
    });

  } catch (error) {
    console.error("Error pausando terreno:", error);

    res.status(500).json({
      message: "Error pausando terreno"
    });
  }
};

// =============================
// Reactivar terreno
// =============================
exports.reactivarTerreno = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const rol = req.user.rol;

  try {
    const terrenoResult = await pool.query(
      `
      SELECT id, usuario_id, estado
      FROM terrenos
      WHERE id = $1
      `,
      [id]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Terreno no encontrado"
      });
    }

    const terreno = terrenoResult.rows[0];

    if (rol !== "admin" && terreno.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permiso para reactivar este terreno"
      });
    }

    const result = await pool.query(
      `
      UPDATE terrenos
      SET estado = 'aprobado'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      message: "Terreno reactivado correctamente",
      terreno: result.rows[0]
    });

  } catch (error) {
    console.error("Error reactivando terreno:", error);

    res.status(500).json({
      message: "Error reactivando terreno"
    });
  }
};