const express = require("express");
const router = express.Router();

const {
  getMiSuscripcion,
  getPlanesActivos,
  asignarSuscripcionAdmin,
  suspenderSuscripcionAdmin,
  extenderSuscripcionAdmin,
  reactivarSuscripcionAdmin,
  procesarVencidasAdmin,
  listarSuscripcionesPanelAdmin,
  getCapacidadPublicacion,
} = require("../controllers/suscripciones.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==============================
// PÚBLICAS
// ==============================
router.get("/planes", getPlanesActivos);

// ==============================
// USUARIO AUTENTICADO
// ==============================
router.get("/me", authMiddleware, getMiSuscripcion);
router.get("/capacidad-publicacion", authMiddleware, getCapacidadPublicacion);

// ==============================
// ADMIN
// ==============================
router.get(
  "/admin/listado",
  authMiddleware,
  roleMiddleware("admin"),
  listarSuscripcionesPanelAdmin
);

router.post(
  "/admin/asignar",
  authMiddleware,
  roleMiddleware("admin"),
  asignarSuscripcionAdmin
);

router.post(
  "/admin/suspender",
  authMiddleware,
  roleMiddleware("admin"),
  suspenderSuscripcionAdmin
);

router.post(
  "/admin/extender",
  authMiddleware,
  roleMiddleware("admin"),
  extenderSuscripcionAdmin
);

router.post(
  "/admin/reactivar",
  authMiddleware,
  roleMiddleware("admin"),
  reactivarSuscripcionAdmin
);

router.post(
  "/admin/procesar-vencidas",
  authMiddleware,
  roleMiddleware("admin"),
  procesarVencidasAdmin
);

module.exports = router;