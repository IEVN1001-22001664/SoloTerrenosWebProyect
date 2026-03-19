const express = require("express");
const router = express.Router();

const { createLead } = require("../controllers/leads.controller");
const authMiddleware = require("../middleware/auth.middleware");

// SOLO usuarios autenticados
router.post("/", authMiddleware, createLead);

module.exports = router;