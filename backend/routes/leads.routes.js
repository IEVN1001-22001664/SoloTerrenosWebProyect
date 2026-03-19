const express = require("express");
const router = express.Router();

const {
  createLead,
  getMisLeads,
} = require("../controllers/leads.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, createLead);
router.get("/mis-leads", authMiddleware, getMisLeads);

module.exports = router;