const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const imagenesController = require("../controllers/imagenes.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/terrenos/:id/imagenes",
  authMiddleware,
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
  authMiddleware,
  imagenesController.eliminarImagen
);

module.exports = router;