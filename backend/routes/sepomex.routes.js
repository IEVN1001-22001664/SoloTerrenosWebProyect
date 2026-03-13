// ======================================================
// IMPORTACIÓN DE DEPENDENCIAS
// ======================================================

const express = require("express");
const router = express.Router();

const sepomexController = require("../controllers/sepomex.controller");

// ======================================================
// RUTA PÚBLICA - CONSULTAR SEPOMEX POR CÓDIGO POSTAL
// ======================================================
// Endpoint:
// GET /api/sepomex/:codigoPostal
// ======================================================

router.get("/:codigoPostal", sepomexController.getByCodigoPostal);

// ======================================================
// EXPORTAR ROUTER
// ======================================================

module.exports = router;