const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const favoritosController = require("../controllers/favoritos.controller");

router.get("/mis-favoritos", authMiddleware, favoritosController.getMisFavoritos);
router.get("/:terrenoId/check", authMiddleware, favoritosController.checkFavorito);
router.post("/:terrenoId", authMiddleware, favoritosController.addFavorito);
router.delete("/:terrenoId", authMiddleware, favoritosController.deleteFavorito);
router.patch("/:terrenoId/toggle", authMiddleware, favoritosController.toggleFavorito);

module.exports = router;