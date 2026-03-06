const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require("../middleware/verifyToken");

router.get("/me", verifyToken, authController.me);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout exitoso" });
});

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
