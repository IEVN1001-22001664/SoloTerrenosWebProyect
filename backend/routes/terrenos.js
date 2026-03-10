const express = require("express");
const router = express.Router();
const pool = require("../db");

const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/roleMiddleware');



// =============================
// Obtener todos los terrenos (PÚBLICO)
// =============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM terrenos WHERE estado = 'aprobado' ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener terrenos" });
  }
});

// =============================
// Obtener todos los terrenos (ADMIN)
// =============================
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM terrenos ORDER BY id DESC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener terrenos" });
    }
  }
);
// =============================
// Obtener terreno por ID (PÚBLICO)
// =============================
router.get("/:id", async (req, res) => {
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
});


// =============================
// Crear nuevo terreno (CLIENTE / ADMIN)
// =============================
router.post(
  "/",
  authMiddleware,
  roleMiddleware('colaborador', 'admin'),
  async (req, res) => {

    const { titulo, descripcion, precio, ubicacion, tipo, poligono } = req.body;
    const center = getCenter(poligono);
    const area = getArea(poligono);
    const perimeter = getPerimeter(poligono);
    const usuario_id = req.user.id;

    try {

      // 🔎 Verificar si usuario tiene auto aprobación
      const userResult = await pool.query(
        "SELECT auto_aprobado FROM usuarios WHERE id = $1",
        [usuario_id]
      );

      const autoAprobado = userResult.rows[0]?.auto_aprobado;

      const estadoFinal = autoAprobado ? "aprobado" : "pendiente";

      const result = await pool.query(
      `INSERT INTO terrenos 
      (titulo, descripcion, precio, ubicacion, tipo, poligono, usuario_id, estado, center_lat, center_lng, area_m2, perimeter_m)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        titulo,
        descripcion,
        precio,
        ubicacion,
        tipo,
        JSON.stringify(poligono),
        usuario_id,
        estadoFinal,
        center.lat,
        center.lng,
        area,
        perimeter
      ]
    );

      res.status(201).json(result.rows[0]);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear terreno" });
    }
  }
);

// =============================
// Actualizar terreno (CLIENTE / ADMIN)
// =============================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware('cliente', 'admin'),
  async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, precio, ubicacion, tipo, poligono } = req.body;
    const center = getCenter(poligono);
    const area = getArea(poligono);
    const perimeter = getPerimeter(poligono);

    try {
      const result = await pool.query(
      `
      UPDATE terrenos
      SET titulo = $1,
          descripcion = $2,
          precio = $3,
          ubicacion = $4,
          tipo = $5,
          poligono = $6,
          center_lat = $7,
          center_lng = $8,
          area_m2 = $9,
          perimeter_m = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        titulo,
        descripcion,
        precio,
        ubicacion,
        tipo,
        JSON.stringify(poligono),
        center.lat,
        center.lng,
        area,
        perimeter,
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
  }
);


// =============================
// Eliminar terreno (CLIENTE)
// =============================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware('cliente', 'admin'),
  async (req, res) => {
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
  }
);

router.get("/publicos", async (req, res) => {

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
});

// =============================
// UTILIDADES GEOGRÁFICAS
// =============================

function getCenter(poligono) {

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


// aproximación simple en metros
function getPerimeter(poligono) {

  let perimeter = 0;

  for (let i = 0; i < poligono.length; i++) {

    const p1 = poligono[i];
    const p2 = poligono[(i + 1) % poligono.length];

    const dx = (p2[1] - p1[1]) * 111320;
    const dy = (p2[0] - p1[0]) * 110540;

    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  return perimeter;
}


// área aproximada
function getArea(poligono) {

  let area = 0;

  for (let i = 0; i < poligono.length; i++) {

    const j = (i + 1) % poligono.length;

    area +=
      poligono[i][1] * poligono[j][0] -
      poligono[j][1] * poligono[i][0];
  }

  return Math.abs(area / 2) * 12365; // conversión aproximada m²
}


module.exports = router;