// ======================================================
// IMPORTACIÓN DE DEPENDENCIAS
// ======================================================

const express = require("express");
const router = express.Router();

const terrenosController = require("../controllers/terrenos.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// ======================================================
// RUTAS PÚBLICAS
// ======================================================

// Obtener terrenos públicos (usado por mapa)
router.get("/publicos", terrenosController.getPublicos);

// Obtener todos los terrenos aprobados
router.get("/", terrenosController.getAllPublic);


// ======================================================
// RUTAS ADMIN
// ======================================================

// Obtener todos los terrenos sin filtro
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  terrenosController.getAllAdmin
);


// ======================================================
// CREAR TERRENO
// ======================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.createTerreno
);


// ======================================================
// ACTUALIZAR TERRENO
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.updateTerreno
);


// ======================================================
// ELIMINAR TERRENO
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.deleteTerreno
);


// ======================================================
// OBTENER TERRENO POR ID (SIEMPRE AL FINAL)
// ======================================================

router.get("/:id", terrenosController.getById);


// ======================================================
// EXPORTAR ROUTER
// ======================================================

module.exports = router;