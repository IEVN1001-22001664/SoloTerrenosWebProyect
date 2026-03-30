const pool = require("../db");

// =============================
// UTILIDADES GEOGRÁFICAS
// =============================

function getCenter(poligono) {
  let lat = 0;
  let lng = 0;

  poligono.forEach((p) => {
    lat += Number(p[0]);
    lng += Number(p[1]);
  });

  return {
    lat: lat / poligono.length,
    lng: lng / poligono.length,
  };
}

function projectToMeters(poligono) {
  if (!Array.isArray(poligono) || poligono.length === 0) return [];

  const lat0 =
    poligono.reduce((acc, [lat]) => acc + Number(lat), 0) / poligono.length;

  const lng0 =
    poligono.reduce((acc, [, lng]) => acc + Number(lng), 0) / poligono.length;

  const latFactor = 110540;
  const lngFactor = 111320 * Math.cos((lat0 * Math.PI) / 180);

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

  return Math.abs(area / 2);
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
      return res.status(400).json({ message: "Bounds requeridos" });
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
      filters += `
        AND (
          t.titulo ILIKE $${idx}
          OR t.ubicacion ILIKE $${idx}
          OR t.estado_region ILIKE $${idx}
          OR t.municipio ILIKE $${idx}
          OR t.colonia ILIKE $${idx}
          OR t.direccion ILIKE $${idx}
          OR t.tipo ILIKE $${idx}
          OR t.uso_suelo ILIKE $${idx}
        )
      `;
      values.push(`%${q}%`);
      idx++;
    }

    if (tipo) {
      filters += ` AND t.tipo ILIKE $${idx}`;
      values.push(`%${tipo}%`);
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
        t.*,
        img.url AS imagen_principal
      FROM terrenos t
      LEFT JOIN LATERAL (
        SELECT ti.url
        FROM terreno_imagenes ti
        WHERE ti.terreno_id = t.id
        ORDER BY ti.orden ASC, ti.id ASC
        LIMIT 1
      ) img ON true
      WHERE ${filters}
      ORDER BY t.creado_en DESC
      LIMIT 200
    `;

    const result = await pool.query(query, values);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const terrenos = result.rows.map((terreno) => ({
      ...terreno,
      imagen_principal: terreno.imagen_principal
        ? `${baseUrl}${terreno.imagen_principal}`
        : null,
    }));

    res.json(terrenos);
  } catch (error) {
    console.error("Error obteniendo terrenos del mapa:", error);
    res.status(500).json({
      message: "Error obteniendo terrenos del mapa",
      error: error.message,
    });
  }
};


// =============================
// FILTRO Y SEARCHBAR PUBLICA PRINCIPAL
// =============================

exports.searchSuggestions = async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.json({ results: [] });
  }

  try {
    const search = q.trim();

    const result = await pool.query(
      `
      SELECT
        id,
        titulo,
        ubicacion,
        municipio,
        estado_region,
        tipo,
        uso_suelo,
        area_m2,
        precio,
        (
          ts_rank(
            search_vector,
            websearch_to_tsquery('spanish', $1)
          )
          +
          CASE WHEN titulo ILIKE $2 THEN 0.40 ELSE 0 END
          +
          CASE WHEN ubicacion ILIKE $2 THEN 0.25 ELSE 0 END
          +
          CASE WHEN municipio ILIKE $2 THEN 0.25 ELSE 0 END
          +
          CASE WHEN estado_region ILIKE $2 THEN 0.20 ELSE 0 END
          +
          CASE WHEN tipo ILIKE $2 THEN 0.20 ELSE 0 END
          +
          CASE WHEN uso_suelo ILIKE $2 THEN 0.20 ELSE 0 END
        ) AS score
      FROM terrenos
      WHERE
        (estado = 'aprobado' OR estado IS NULL OR estado = '')
        AND (
          search_vector @@ websearch_to_tsquery('spanish', $1)
          OR titulo ILIKE $2
          OR descripcion ILIKE $2
          OR ubicacion ILIKE $2
          OR municipio ILIKE $2
          OR estado_region ILIKE $2
          OR tipo ILIKE $2
          OR uso_suelo ILIKE $2
        )
      ORDER BY score DESC, id DESC
      LIMIT 8
      `,
      [search, `%${search}%`]
    );

    return res.json({ results: result.rows });
  } catch (error) {
    console.error("Error en searchSuggestions:", error);
    return res.status(500).json({ error: "Error obteniendo sugerencias" });
  }
};

exports.searchTerrenos = async (req, res) => {
  const {
    q = "",
    ubicacion = "todas",
    tipo = "todos",
    precio = "todos",
    area = "todos",
    orden = "recientes",
  } = req.query;

  try {
    const values = [];
    const conditions = [`(estado = 'aprobado' OR estado IS NULL OR estado = '')`];
    let orderClause = `id DESC`;

    if (q.trim()) {
      values.push(q.trim());
      const searchIndex = values.length;

      values.push(`%${q.trim()}%`);
      const likeIndex = values.length;

      conditions.push(`
        (
          search_vector @@ websearch_to_tsquery('spanish', $${searchIndex})
          OR titulo ILIKE $${likeIndex}
          OR descripcion ILIKE $${likeIndex}
          OR ubicacion ILIKE $${likeIndex}
          OR municipio ILIKE $${likeIndex}
          OR estado_region ILIKE $${likeIndex}
          OR tipo ILIKE $${likeIndex}
          OR uso_suelo ILIKE $${likeIndex}
        )
      `);

      if (orden === "recientes") {
        orderClause = `
          (
            ts_rank(search_vector, websearch_to_tsquery('spanish', $${searchIndex}))
            +
            CASE WHEN titulo ILIKE $${likeIndex} THEN 0.40 ELSE 0 END
            +
            CASE WHEN ubicacion ILIKE $${likeIndex} THEN 0.25 ELSE 0 END
            +
            CASE WHEN municipio ILIKE $${likeIndex} THEN 0.25 ELSE 0 END
            +
            CASE WHEN estado_region ILIKE $${likeIndex} THEN 0.20 ELSE 0 END
            +
            CASE WHEN tipo ILIKE $${likeIndex} THEN 0.20 ELSE 0 END
            +
            CASE WHEN uso_suelo ILIKE $${likeIndex} THEN 0.20 ELSE 0 END
          ) DESC,
          id DESC
        `;
      }
    }

    if (ubicacion !== "todas") {
      values.push(ubicacion);
      const idx = values.length;
      conditions.push(`
        (
          municipio ILIKE $${idx}
          OR ubicacion ILIKE $${idx}
          OR estado_region ILIKE $${idx}
        )
      `);
    }

    if (tipo !== "todos") {
      values.push(tipo);
      const idx = values.length;
      conditions.push(`
        (
          tipo ILIKE $${idx}
          OR uso_suelo ILIKE $${idx}
        )
      `);
    }

    if (precio !== "todos") {
      switch (precio) {
        case "0-500000":
          conditions.push(`precio <= 500000`);
          break;
        case "500000-1000000":
          conditions.push(`precio > 500000 AND precio <= 1000000`);
          break;
        case "1000000-3000000":
          conditions.push(`precio > 1000000 AND precio <= 3000000`);
          break;
        case "3000000+":
          conditions.push(`precio > 3000000`);
          break;
      }
    }

    if (area !== "todos") {
      switch (area) {
        case "0-250":
          conditions.push(`area_m2 > 0 AND area_m2 <= 250`);
          break;
        case "250-500":
          conditions.push(`area_m2 > 250 AND area_m2 <= 500`);
          break;
        case "500-1000":
          conditions.push(`area_m2 > 500 AND area_m2 <= 1000`);
          break;
        case "1000+":
          conditions.push(`area_m2 > 1000`);
          break;
      }
    }

    if (orden === "precio_menor") {
      orderClause = `precio ASC NULLS LAST, id DESC`;
    } else if (orden === "precio_mayor") {
      orderClause = `precio DESC NULLS LAST, id DESC`;
    } else if (orden === "titulo_az") {
      orderClause = `titulo ASC NULLS LAST, id DESC`;
    } else if (orden === "titulo_za") {
      orderClause = `titulo DESC NULLS LAST, id DESC`;
    }

    const sql = `
      SELECT
        id,
        titulo,
        descripcion,
        precio,
        ubicacion,
        municipio,
        estado_region,
        tipo,
        uso_suelo,
        area_m2,
        estado
      FROM terrenos
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderClause}
    `;

    const result = await pool.query(sql, values);

    return res.json(result.rows);
  } catch (error) {
    console.error("Error en searchTerrenos:", error);
    return res.status(500).json({ error: "Error realizando búsqueda" });
  }
};

// =============================
// OBTENER TERRENOS DESTACADOS
// =============================
exports.getDestacados = async (req, res) => {
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
      WHERE
        t.estado = 'aprobado'
        AND t.destacado = true
        AND (
          t.destacado_hasta IS NULL
          OR t.destacado_hasta >= NOW()
        )
      ORDER BY
        t.orden_destacado ASC NULLS LAST,
        t.id DESC
      LIMIT 12
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo terrenos destacados:", error);
    res.status(500).json({ message: "Error al obtener terrenos destacados" });
  }
};

// =============================
// MARCAR TERRENO COMO DESTACADO
// =============================
exports.destacarTerreno = async (req, res) => {
  const { id } = req.params;
  const { orden_destacado = null, destacado_hasta = null } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE terrenos
      SET
        destacado = true,
        orden_destacado = $2,
        destacado_desde = NOW(),
        destacado_hasta = $3
      WHERE id = $1
      RETURNING *
      `,
      [id, orden_destacado, destacado_hasta]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    res.json({
      message: "Terreno marcado como destacado correctamente",
      terreno: result.rows[0],
    });
  } catch (error) {
    console.error("Error destacando terreno:", error);
    res.status(500).json({ message: "Error al destacar terreno" });
  }
};

// =============================
// QUITAR DESTACADO DE TERRENO
// =============================
exports.quitarDestacadoTerreno = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE terrenos
      SET
        destacado = false,
        orden_destacado = NULL,
        destacado_desde = NULL,
        destacado_hasta = NULL
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    res.json({
      message: "Terreno retirado de destacados correctamente",
      terreno: result.rows[0],
    });
  } catch (error) {
    console.error("Error quitando destacado:", error);
    res.status(500).json({ message: "Error al quitar destacado" });
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
    const area_m2 = getArea(poligono);
    const perimetro_m = getPerimeter(poligono);

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
        escritura || null,
        estatus_legal || null,
        gravamen ?? false
      ]
    );

    res.status(201).json(result.rows[0]);
    console.log("RESPUESTA DE BD:", result.rows[0]);

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