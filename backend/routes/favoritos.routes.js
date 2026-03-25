const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const favoritosController = require("../controllers/favoritos.controller");

router.get("/mis-favoritos", verifyToken, favoritosController.getMisFavoritos);
router.get("/:terrenoId/check", verifyToken, favoritosController.checkFavorito);
router.post("/:terrenoId", verifyToken, favoritosController.addFavorito);
router.delete("/:terrenoId", verifyToken, favoritosController.deleteFavorito);
router.patch("/:terrenoId/toggle", verifyToken, favoritosController.toggleFavorito);

module.exports = router;