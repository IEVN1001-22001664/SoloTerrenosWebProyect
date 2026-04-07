const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { createCheckoutSession } = require("../controllers/stripeCheckout.controller");

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

module.exports = router;