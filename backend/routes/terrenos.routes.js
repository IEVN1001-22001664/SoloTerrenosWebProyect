// ======================================================
// IMPORTACIÓN DE DEPENDENCIAS
// ======================================================

const express = require("express");
const router = express.Router();

const terrenosController = require("../controllers/terrenos.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { puedePublicarTerreno } = require("../middleware/suscripcion.middleware");


// ======================================================
// RUTAS PÚBLICAS ESPECÍFICAS
// ======================================================

// Obtener terrenos públicos (usado por mapa antiguo)
router.get("/publicos", terrenosController.getPublicos);

// Obtener terrenos para vista de mapa
router.get("/mapa", terrenosController.getTerrenosMapa);

// Obtener terrenos destacados
router.get("/destacados", terrenosController.getDestacados);

// Sugerencias del buscador principal
router.get("/search-suggestions", terrenosController.searchSuggestions);

// Resultados completos con PostgreSQL FTS
router.get("/search", terrenosController.searchTerrenos);


// ======================================================
// RUTA PÚBLICA GENERAL
// ======================================================

// Obtener todos los terrenos aprobados
router.get("/", terrenosController.getAllPublic);


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
  puedePublicarTerreno,
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
// ACCIONES ESPECIALES SOBRE TERRENO
// ======================================================

// Pausar terreno
router.patch(
  "/:id/pausar",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.pausarTerreno
);

// Reactivar terreno
router.patch(
  "/:id/reactivar",
  authMiddleware,
  roleMiddleware("colaborador", "admin"),
  terrenosController.reactivarTerreno
);

// Marcar terreno como destacado
router.patch(
  "/:id/destacar",
  authMiddleware,
  roleMiddleware("admin"),
  terrenosController.destacarTerreno
);

// Quitar terreno de destacados
router.patch(
  "/:id/quitar-destacado",
  authMiddleware,
  roleMiddleware("admin"),
  terrenosController.quitarDestacadoTerreno
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