const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadProfile");

router.get("/me", authMiddleware, authController.me);

// PERFIL
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/change-password", authMiddleware, authController.changePassword);
router.post(
  "/upload-profile-photo",
  authMiddleware,
  upload.single("foto"),
  authController.uploadProfilePhoto
);

// AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;