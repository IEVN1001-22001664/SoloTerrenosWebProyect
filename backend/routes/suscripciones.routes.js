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


const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==============================
// PÚBLICAS
// ==============================no me des 
router.get("/planes", getPlanesActivos);

// ==============================
// USUARIO AUTENTICADO
// ==============================
router.get("/me", verifyToken, getMiSuscripcion);

router.get("/capacidad-publicacion", verifyToken, getCapacidadPublicacion);

// ==============================
// ADMIN
// ==============================
router.get(
  "/admin/listado",
  verifyToken,
  roleMiddleware("admin"),
  listarSuscripcionesPanelAdmin
);

router.post(
  "/admin/asignar",
  verifyToken,
  roleMiddleware("admin"),
  asignarSuscripcionAdmin
);

router.post(
  "/admin/suspender",
  verifyToken,
  roleMiddleware("admin"),
  suspenderSuscripcionAdmin
);

router.post(
  "/admin/extender",
  verifyToken,
  roleMiddleware("admin"),
  extenderSuscripcionAdmin
);

router.post(
  "/admin/reactivar",
  verifyToken,
  roleMiddleware("admin"),
  reactivarSuscripcionAdmin
);

router.post(
  "/admin/procesar-vencidas",
  verifyToken,
  roleMiddleware("admin"),
  procesarVencidasAdmin
);

module.exports = router;