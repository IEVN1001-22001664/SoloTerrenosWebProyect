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
        (titulo, descripcion, precio, ubicacion, tipo, poligono, usuario_id, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          titulo,
          descripcion,
          precio,
          ubicacion,
          tipo,
          JSON.stringify(poligono),
          usuario_id,
          estadoFinal
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

    try {
      const result = await pool.query(
        `
        UPDATE terrenos
        SET titulo = $1,
            descripcion = $2,
            precio = $3,
            ubicacion = $4,
            tipo = $5,
            poligono = $6
        WHERE id = $7
        RETURNING *
        `,
        [titulo, descripcion, precio, ubicacion, tipo, JSON.stringify(poligono), id]
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


module.exports = router;