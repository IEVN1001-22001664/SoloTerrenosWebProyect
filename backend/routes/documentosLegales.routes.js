const express = require("express");
const router = express.Router();

const uploadDocumentos = require("../middleware/uploadDocumentos.middleware");
const documentosLegalesController = require("../controllers/documentosLegales.controller");
const authMiddleware = require("../middleware/auth.middleware");

// ======================================================
// SUBIR DOCUMENTOS LEGALES DE UN TERRENO
// ======================================================

router.post(
  "/terrenos/:id/documentos",
  authMiddleware,
  uploadDocumentos.array("documentos", 10),
  documentosLegalesController.subirDocumentos
);

// ======================================================
// OBTENER DOCUMENTOS DE UN TERRENO
// ======================================================

router.get(
  "/terrenos/:id/documentos",
  authMiddleware,
  documentosLegalesController.obtenerDocumentosTerreno
);

// ======================================================
// ELIMINAR DOCUMENTO LEGAL
// ======================================================

router.delete(
  "/documentos/:id",
  authMiddleware,
  documentosLegalesController.eliminarDocumento
);

module.exports = router;