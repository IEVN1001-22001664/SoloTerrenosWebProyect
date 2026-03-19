const express = require("express");
const router = express.Router();

const {
  getMisNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
} = require("../controllers/notificaciones.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/mis-notificaciones", authMiddleware, getMisNotificaciones);
router.patch("/:id/leer", authMiddleware, marcarComoLeida);
router.patch("/leer-todas", authMiddleware, marcarTodasComoLeidas);

module.exports = router;