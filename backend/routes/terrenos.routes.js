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

// Obtener terrenos públicos (usado por mapa antiguo)
router.get("/publicos", terrenosController.getPublicos);

// Obtener terrenos para vista de mapa
router.get("/mapa", terrenosController.getTerrenosMapa);

// Obtener todos los terrenos aprobados
router.get("/", terrenosController.getAllPublic);

// Sugerencias del buscador principal
router.get("/search-suggestions", terrenosController.searchSuggestions);

// Resultados completos con PostgreSQL FTS
router.get("/search", terrenosController.searchTerrenos);


// ======================================================
// OBTENER TERRENOS DEL COLABORADOR AUTENTICADO
// ======================================================

router.get(
  "/mis-terrenos",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.getMisTerrenos
);


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
// PAUSAR TERRENO
// ======================================================

router.patch(
  "/:id/pausar",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.pausarTerreno
);


// ======================================================
// REACTIVAR TERRENO
// ======================================================

router.patch(
  "/:id/reactivar",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.reactivarTerreno
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
// OBTENER TERRENO PARA EDICIÓN
// ======================================================

router.get(
  "/:id/editar",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.getByIdForEdit
);


// ======================================================
// OBTENER TERRENO POR ID (SIEMPRE AL FINAL)
// ======================================================

router.get("/id/:id", terrenosController.getById);


// ======================================================
// EXPORTAR ROUTER
// ======================================================

module.exports = router;