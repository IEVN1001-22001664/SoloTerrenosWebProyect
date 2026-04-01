const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const { createCheckoutSession } = require("../controllers/stripeCheckout.controller");

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

module.exports = router;