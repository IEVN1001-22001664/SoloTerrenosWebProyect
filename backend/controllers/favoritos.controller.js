const pool = require("../db");

// Obtener todos los favoritos del usuario autenticado
const getMisFavoritos = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const result = await pool.query(
      `
      SELECT
        f.id,
        f.usuario_id,
        f.terreno_id,
        f.fecha_guardado,
        t.titulo,
        t.ubicacion,
        t.precio,
        t.tipo
      FROM favoritos f
      INNER JOIN terrenos t ON t.id = f.terreno_id
      WHERE f.usuario_id = $1
        AND t.estado = 'aprobado'
      ORDER BY f.fecha_guardado DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    res.status(500).json({ message: "Error obteniendo favoritos" });
  }
};

// Verificar si un terreno está en favoritos del usuario
const checkFavorito = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { terrenoId } = req.params;

    const result = await pool.query(
      `
      SELECT id
      FROM favoritos
      WHERE usuario_id = $1 AND terreno_id = $2
      LIMIT 1
      `,
      [req.user.id, terrenoId]
    );

    res.json({
      esFavorito: result.rows.length > 0,
    });
  } catch (error) {
    console.error("Error verificando favorito:", error);
    res.status(500).json({ message: "Error verificando favorito" });
  }
};

// Agregar terreno a favoritos
const addFavorito = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.rol !== "usuario") {
      return res.status(403).json({
        message: "Solo los usuarios pueden guardar favoritos",
      });
    }

    const { terrenoId } = req.params;

    const terrenoResult = await pool.query(
      `
      SELECT id, estado
      FROM terrenos
      WHERE id = $1
      LIMIT 1
      `,
      [terrenoId]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    if (terrenoResult.rows[0].estado !== "aprobado") {
      return res.status(400).json({
        message: "Solo se pueden guardar terrenos aprobados",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO favoritos (usuario_id, terreno_id)
      VALUES ($1, $2)
      ON CONFLICT (usuario_id, terreno_id) DO NOTHING
      RETURNING *
      `,
      [req.user.id, terrenoId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "El terreno ya estaba en favoritos",
        ya_existia: true,
      });
    }

    res.status(201).json({
      message: "Terreno agregado a favoritos",
      favorito: result.rows[0],
    });
  } catch (error) {
    console.error("Error agregando favorito:", error);
    res.status(500).json({ message: "Error agregando favorito" });
  }
};

// Eliminar terreno de favoritos
const deleteFavorito = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const { terrenoId } = req.params;

    const result = await pool.query(
      `
      DELETE FROM favoritos
      WHERE usuario_id = $1 AND terreno_id = $2
      RETURNING *
      `,
      [req.user.id, terrenoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Este terreno no estaba en favoritos",
      });
    }

    res.json({
      message: "Terreno eliminado de favoritos",
    });
  } catch (error) {
    console.error("Error eliminando favorito:", error);
    res.status(500).json({ message: "Error eliminando favorito" });
  }
};

// Toggle favorito
const toggleFavorito = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (req.user.rol !== "usuario") {
      return res.status(403).json({
        message: "Solo los usuarios pueden gestionar favoritos",
      });
    }

    const { terrenoId } = req.params;

    const existe = await pool.query(
      `
      SELECT id
      FROM favoritos
      WHERE usuario_id = $1 AND terreno_id = $2
      LIMIT 1
      `,
      [req.user.id, terrenoId]
    );

    if (existe.rows.length > 0) {
      await pool.query(
        `
        DELETE FROM favoritos
        WHERE usuario_id = $1 AND terreno_id = $2
        `,
        [req.user.id, terrenoId]
      );

      return res.json({
        message: "Terreno eliminado de favoritos",
        esFavorito: false,
      });
    }

    const terrenoResult = await pool.query(
      `
      SELECT id, estado
      FROM terrenos
      WHERE id = $1
      LIMIT 1
      `,
      [terrenoId]
    );

    if (terrenoResult.rows.length === 0) {
      return res.status(404).json({ message: "Terreno no encontrado" });
    }

    if (terrenoResult.rows[0].estado !== "aprobado") {
      return res.status(400).json({
        message: "Solo se pueden guardar terrenos aprobados",
      });
    }

    await pool.query(
      `
      INSERT INTO favoritos (usuario_id, terreno_id)
      VALUES ($1, $2)
      `,
      [req.user.id, terrenoId]
    );

    res.status(201).json({
      message: "Terreno agregado a favoritos",
      esFavorito: true,
    });
  } catch (error) {
    console.error("Error haciendo toggle de favorito:", error);
    res.status(500).json({ message: "Error actualizando favorito" });
  }
};

module.exports = {
  getMisFavoritos,
  checkFavorito,
  addFavorito,
  deleteFavorito,
  toggleFavorito,
};