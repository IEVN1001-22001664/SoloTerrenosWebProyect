const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const imagenesController = require("../controllers/imagenes.controller");

const verifyToken = require("../middleware/verifyToken");

console.log("verifyToken:", typeof verifyToken);
console.log("subirImagenes:", typeof imagenesController.subirImagenes);
console.log("obtenerImagenesTerreno:", typeof imagenesController.obtenerImagenesTerreno);
console.log("eliminarImagen:", typeof imagenesController.eliminarImagen);

router.post(
  "/terrenos/:id/imagenes",
  verifyToken,
  upload.array("imagenes", 15),
  imagenesController.subirImagenes
);

// Endpoint público para consultar las imágenes de un terreno.
router.get(
  "/terrenos/:id/imagenes",
  imagenesController.obtenerImagenesTerreno
);

// ELIMINAR IMAGEN
router.delete(
  "/imagenes/:id",
  verifyToken,
  imagenesController.eliminarImagen
);

module.exports = router;