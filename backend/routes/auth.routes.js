const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/uploadProfile");

router.get("/me", verifyToken, authController.me);

// PERFIL
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateProfile);
router.put("/change-password", verifyToken, authController.changePassword);
router.post(
  "/upload-profile-photo",
  verifyToken,
  upload.single("foto"),
  authController.uploadProfilePhoto
);

// AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;