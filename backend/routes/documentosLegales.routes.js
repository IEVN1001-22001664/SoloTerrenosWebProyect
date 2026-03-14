const express = require("express");
const router = express.Router();

const uploadDocumentos = require("../middleware/uploadDocumentos.middleware");
const documentosLegalesController = require("../controllers/documentosLegales.controller");
const verifyToken = require("../middleware/verifyToken");

console.log("Controller:", documentosLegalesController);
console.log("subirDocumentos:", typeof documentosLegalesController.subirDocumentos);

// ======================================================
// SUBIR DOCUMENTOS LEGALES DE UN TERRENO
// ======================================================

router.post(
  "/terrenos/:id/documentos",
  verifyToken,
  uploadDocumentos.array("documentos", 10),
  documentosLegalesController.subirDocumentos
);

// ======================================================
// OBTENER DOCUMENTOS DE UN TERRENO
// ======================================================

router.get(
  "/terrenos/:id/documentos",
  verifyToken,
  documentosLegalesController.obtenerDocumentosTerreno
);

// ======================================================
// ELIMINAR DOCUMENTO LEGAL
// ======================================================

router.delete(
  "/documentos/:id",
  verifyToken,
  documentosLegalesController.eliminarDocumento
);

module.exports = router;