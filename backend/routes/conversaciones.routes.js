const express = require("express");
const router = express.Router();

const {
  getMisConversaciones,
  getMensajesConversacion,
  sendMensaje,
} = require("../controllers/conversaciones.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/mias", authMiddleware, getMisConversaciones);
router.get("/:id/mensajes", authMiddleware, getMensajesConversacion);
router.post("/:id/mensajes", authMiddleware, sendMensaje);

module.exports = router;