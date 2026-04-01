const stripe = require("../config/stripe");
const pool = require("../db");

async function createCheckoutSession(req, res) {
  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({
        message: "No autenticado.",
      });
    }

    const { plan_codigo } = req.body;

    if (!plan_codigo) {
      return res.status(400).json({
        message: "plan_codigo es obligatorio.",
      });
    }

    const usuarioResult = await pool.query(
      `
      SELECT id, email, nombre, apellido, rol
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [usuarioId]
    );

    const usuario = usuarioResult.rows[0];

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    const planResult = await pool.query(
      `
      SELECT *
      FROM planes_suscripcion
      WHERE codigo = $1
        AND activo = TRUE
      LIMIT 1
      `,
      [plan_codigo]
    );

    const plan = planResult.rows[0];

    if (!plan) {
      return res.status(404).json({
        message: "Plan no encontrado o inactivo.",
      });
    }

    if (plan.codigo === "trial_anual") {
      return res.status(400).json({
        message: "Este plan no se compra directamente. Debe asignarse por administrador.",
      });
    }

    if (!plan.stripe_price_id_mensual) {
      return res.status(400).json({
        message: "El plan no tiene Stripe Price ID configurado.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id_mensual,
          quantity: 1,
        },
      ],
      customer_email: usuario.email,
      client_reference_id: String(usuario.id),
      metadata: {
        usuario_id: String(usuario.id),
        plan_codigo: plan.codigo,
        plan_id: String(plan.id),
      },
      success_url: `${process.env.FRONTEND_URL}/suscripciones/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/suscripciones/cancelado`,
    });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creando Checkout Session:", error);

    return res.status(500).json({
      message: "Error creando la sesión de pago.",
      error: error.message,
    });
  }
}

module.exports = {
  createCheckoutSession,
};