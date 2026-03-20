const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/uploadProfile")

router.get("/me", verifyToken, authController.me);

// NUEVOS ENDPOINTS DE PERFIL
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateProfile);
router.put("/change-password",verifyToken,authController.changePassword);
router.post(
  "/upload-profile-photo",
  verifyToken,
  upload.single("foto"),
  authController.uploadProfilePhoto
);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout exitoso" });
});

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;