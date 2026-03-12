const pool = require("../db");
const fs = require("fs");
const path = require("path");

exports.subirImagenes = async (req, res) => {

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

    // Si no es dueño ni admin
    if (propietario !== usuario_id && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para subir imágenes a este terreno"
      });
    }

    // =================================
    // VALIDAR ARCHIVOS
    // =================================

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No se subieron imágenes"
      });
    }

    const imagenesGuardadas = [];

    for (const file of files) {

      const url = `/uploads/terrenos/${terreno_id}/${file.filename}`;

      const result = await pool.query(
        `INSERT INTO terreno_imagenes (terreno_id, url)
         VALUES ($1,$2)
         RETURNING *`,
        [terreno_id, url]
      );

      imagenesGuardadas.push(result.rows[0]);

    }

    res.json({
      message: "Imágenes subidas correctamente",
      imagenes: imagenesGuardadas
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error subiendo imágenes"
    });

  }

};
// =================================
// OBTENER IMÁGENES DE UN TERRENO
// =================================
// Este endpoint devuelve todas las imágenes
// asociadas a un terreno específico.
//
// Se usa para:
// - página de detalle del terreno
// - edición de publicación
// - galería en resultados
//
// Endpoint:
// GET /api/terrenos/:id/imagenes
// =================================

exports.obtenerImagenesTerreno = async (req, res) => {

  try {

    // =================================
    // 1️⃣ OBTENER ID DEL TERRENO
    // =================================

    const terreno_id = req.params.id;

    // =================================
    // 2️⃣ CONSULTAR IMÁGENES EN BD
    // =================================

    const result = await pool.query(
      `
      SELECT id, url
      FROM terreno_imagenes
      WHERE terreno_id = $1
      ORDER BY id ASC
      `,
      [terreno_id]
    );

    // =================================
    // 3️⃣ RESPUESTA AL CLIENTE
    // =================================

    res.json({
      total: result.rows.length,
      imagenes: result.rows
    });

  } catch (error) {

    console.error("Error obteniendo imágenes:", error);

    res.status(500).json({
      message: "Error al obtener imágenes"
    });

  }

};
// =================================
// ELIMINAR IMAGEN DE TERRENO
// =================================
// Este endpoint elimina una imagen
// asociada a un terreno.
//
// Acciones que realiza:
// 1. Verifica que la imagen exista
// 2. Verifica permisos del usuario
// 3. Elimina archivo físico
// 4. Elimina registro en base de datos
//
// Endpoint:
// DELETE /api/imagenes/:id
// =================================

exports.eliminarImagen = async (req, res) => {

  try {

    // =================================
    // 1️⃣ OBTENER ID DE IMAGEN
    // =================================

    const imagen_id = req.params.id;
    const usuario_id = req.user.id;
    const rol = req.user.rol;

    // =================================
    // 2️⃣ BUSCAR IMAGEN EN BD
    // =================================

    const result = await pool.query(
      `
      SELECT id, url, terreno_id
      FROM terreno_imagenes
      WHERE id = $1
      `,
      [imagen_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Imagen no encontrada"
      });
    }

    const imagen = result.rows[0];

    // =================================
    // 3️⃣ VERIFICAR PROPIETARIO DEL TERRENO
    // =================================

    const terrenoResult = await pool.query(
      `
      SELECT usuario_id
      FROM terrenos
      WHERE id = $1
      `,
      [imagen.terreno_id]
    );

    const propietario = terrenoResult.rows[0].usuario_id;

    // Solo dueño o admin pueden borrar
    if (propietario !== usuario_id && rol !== "admin") {
      return res.status(403).json({
        message: "No tienes permiso para eliminar esta imagen"
      });
    }

    // =================================
    // 4️⃣ ELIMINAR ARCHIVO FÍSICO
    // =================================

    const rutaArchivo = path.join(__dirname, "..", imagen.url);

    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    // =================================
    // 5️⃣ ELIMINAR REGISTRO EN BD
    // =================================

    await pool.query(
      `
      DELETE FROM terreno_imagenes
      WHERE id = $1
      `,
      [imagen_id]
    );

    // =================================
    // 6️⃣ RESPUESTA AL CLIENTE
    // =================================

    res.json({
      message: "Imagen eliminada correctamente"
    });

  } catch (error) {

    console.error("Error eliminando imagen:", error);

    res.status(500).json({
      message: "Error al eliminar imagen"
    });

  }

};