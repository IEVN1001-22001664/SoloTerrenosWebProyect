const stripe = require("../config/stripe");
const pool = require("../db");

async function crearHistorial({
  client,
  suscripcionId,
  usuarioId,
  accion,
  estadoAnterior = null,
  estadoNuevo = null,
  planAnteriorId = null,
  planNuevoId = null,
  detalle = null,
  stripeEventId = null,
}) {
  await client.query(
    `
    INSERT INTO suscripciones_historial (
      suscripcion_id,
      usuario_id,
      accion,
      estado_anterior,
      estado_nuevo,
      plan_anterior_id,
      plan_nuevo_id,
      detalle,
      stripe_event_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `,
    [
      suscripcionId,
      usuarioId,
      accion,
      estadoAnterior,
      estadoNuevo,
      planAnteriorId,
      planNuevoId,
      detalle,
      stripeEventId,
    ]
  );
}

async function upsertSuscripcionDesdeCheckoutSession(session, eventId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const usuarioId = Number(
      session?.metadata?.usuario_id || session?.client_reference_id
    );
    const planCodigo = session?.metadata?.plan_codigo;
    const stripeCustomerId = session?.customer || null;
    const stripeSubscriptionId = session?.subscription || null;
    const stripeCheckoutSessionId = session?.id || null;

    if (!usuarioId || !planCodigo || !stripeSubscriptionId) {
      throw new Error("Faltan datos clave en checkout.session.completed");
    }

    const usuarioResult = await client.query(
      `
      SELECT id, rol, suscripcion_actual_id
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [usuarioId]
    );

    const usuario = usuarioResult.rows[0];
    if (!usuario) {
      throw new Error("Usuario no encontrado para webhook.");
    }

    const planResult = await client.query(
      `
      SELECT *
      FROM planes_suscripcion
      WHERE codigo = $1
      LIMIT 1
      `,
      [planCodigo]
    );

    const plan = planResult.rows[0];
    if (!plan) {
      throw new Error("Plan no encontrado para webhook.");
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId
    );

        const itemActual = stripeSubscription?.items?.data?.[0];

        const periodStart =
        stripeSubscription.current_period_start ??
        itemActual?.current_period_start ??
        stripeSubscription.start_date ??
        null;

        const periodEnd =
        stripeSubscription.current_period_end ??
        itemActual?.current_period_end ??
        null;

        const fechaInicio = periodStart
        ? new Date(periodStart * 1000)
        : new Date();

        const fechaFin = periodEnd
        ? new Date(periodEnd * 1000)
        : null;
        
    const existenteResult = await client.query(
      `
      SELECT *
      FROM suscripciones
      WHERE stripe_subscription_id = $1
      LIMIT 1
      `,
      [stripeSubscriptionId]
    );

    let suscripcionFinal;
    const existente = existenteResult.rows[0] || null;

    if (existente) {
      await client.query(
        `
        UPDATE suscripciones
        SET
          usuario_id = $1,
          plan_id = $2,
          origen = 'stripe',
          estado = 'activa',
          fecha_inicio = COALESCE(fecha_inicio, $3),
          fecha_fin = $4,
          fecha_proxima_renovacion = $4,
          stripe_customer_id = $5,
          stripe_checkout_session_id = $6,
          auto_renovar = TRUE,
          actualizada_en = NOW()
        WHERE id = $7
        `,
        [
          usuarioId,
          plan.id,
          fechaInicio,
          fechaFin,
          stripeCustomerId,
          stripeCheckoutSessionId,
          existente.id,
        ]
      );

      const updatedResult = await client.query(
        `SELECT * FROM suscripciones WHERE id = $1 LIMIT 1`,
        [existente.id]
      );

      suscripcionFinal = updatedResult.rows[0];

      await crearHistorial({
        client,
        suscripcionId: suscripcionFinal.id,
        usuarioId,
        accion: "activada",
        estadoAnterior: existente.estado,
        estadoNuevo: "activa",
        planAnteriorId: existente.plan_id,
        planNuevoId: plan.id,
        detalle: "Suscripción activada/actualizada desde checkout.session.completed",
        stripeEventId: eventId,
      });
    } else {
      const insertResult = await client.query(
        `
        INSERT INTO suscripciones (
          usuario_id,
          plan_id,
          origen,
          estado,
          rol_otorgado,
          fecha_inicio,
          fecha_fin,
          fecha_ultimo_pago,
          fecha_proxima_renovacion,
          stripe_customer_id,
          stripe_subscription_id,
          stripe_checkout_session_id,
          auto_renovar,
          trial_usado
        )
        VALUES ($1,$2,'stripe','activa','colaborador',$3,$4,NOW(),$4,$5,$6,$7,TRUE,FALSE)
        RETURNING *
        `,
        [
          usuarioId,
          plan.id,
          fechaInicio,
          fechaFin,
          stripeCustomerId,
          stripeSubscriptionId,
          stripeCheckoutSessionId,
        ]
      );

      suscripcionFinal = insertResult.rows[0];

      await crearHistorial({
        client,
        suscripcionId: suscripcionFinal.id,
        usuarioId,
        accion: "activada",
        estadoAnterior: null,
        estadoNuevo: "activa",
        planAnteriorId: null,
        planNuevoId: plan.id,
        detalle: "Suscripción creada desde checkout.session.completed",
        stripeEventId: eventId,
      });
    }

    await client.query(
      `
      UPDATE usuarios
      SET
        rol = CASE WHEN rol = 'admin' THEN rol ELSE 'colaborador' END,
        puede_publicar = TRUE,
        bloqueado_publicacion = FALSE,
        colaborador_desde = COALESCE(colaborador_desde, NOW()),
        suscripcion_actual_id = $1
      WHERE id = $2
      `,
      [suscripcionFinal.id, usuarioId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function procesarInvoicePaid(invoice, eventId) {
  const stripeSubscriptionId = invoice?.subscription;
  if (!stripeSubscriptionId) return;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT *
      FROM suscripciones
      WHERE stripe_subscription_id = $1
      LIMIT 1
      `,
      [stripeSubscriptionId]
    );

    const suscripcion = result.rows[0];
    if (!suscripcion) {
      await client.query("COMMIT");
      return;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId
    );

    const fechaFin = stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000)
      : suscripcion.fecha_fin;

    await client.query(
      `
      UPDATE suscripciones
      SET
        estado = 'activa',
        fecha_ultimo_pago = NOW(),
        fecha_fin = $1,
        fecha_proxima_renovacion = $1,
        actualizada_en = NOW()
      WHERE id = $2
      `,
      [fechaFin, suscripcion.id]
    );

    await client.query(
      `
      UPDATE usuarios
      SET puede_publicar = TRUE,
          bloqueado_publicacion = FALSE
      WHERE id = $1
      `,
      [suscripcion.usuario_id]
    );

    await crearHistorial({
      client,
      suscripcionId: suscripcion.id,
      usuarioId: suscripcion.usuario_id,
      accion: "renovada",
      estadoAnterior: suscripcion.estado,
      estadoNuevo: "activa",
      planAnteriorId: suscripcion.plan_id,
      planNuevoId: suscripcion.plan_id,
      detalle: "invoice.paid",
      stripeEventId: eventId,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function procesarInvoicePaymentFailed(invoice, eventId) {
  const stripeSubscriptionId = invoice?.subscription;
  if (!stripeSubscriptionId) return;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT *
      FROM suscripciones
      WHERE stripe_subscription_id = $1
      LIMIT 1
      `,
      [stripeSubscriptionId]
    );

    const suscripcion = result.rows[0];
    if (!suscripcion) {
      await client.query("COMMIT");
      return;
    }

    await client.query(
      `
      UPDATE suscripciones
      SET estado = 'pago_pendiente',
          actualizada_en = NOW()
      WHERE id = $1
      `,
      [suscripcion.id]
    );

    await client.query(
      `
      UPDATE usuarios
      SET puede_publicar = FALSE
      WHERE id = $1
      `,
      [suscripcion.usuario_id]
    );

    await crearHistorial({
      client,
      suscripcionId: suscripcion.id,
      usuarioId: suscripcion.usuario_id,
      accion: "suspendida",
      estadoAnterior: suscripcion.estado,
      estadoNuevo: "pago_pendiente",
      planAnteriorId: suscripcion.plan_id,
      planNuevoId: suscripcion.plan_id,
      detalle: "invoice.payment_failed",
      stripeEventId: eventId,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function procesarSubscriptionDeleted(subscription, eventId) {
  const stripeSubscriptionId = subscription?.id;
  if (!stripeSubscriptionId) return;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT *
      FROM suscripciones
      WHERE stripe_subscription_id = $1
      LIMIT 1
      `,
      [stripeSubscriptionId]
    );

    const suscripcion = result.rows[0];
    if (!suscripcion) {
      await client.query("COMMIT");
      return;
    }

    await client.query(
      `
      UPDATE suscripciones
      SET estado = 'cancelada',
          fecha_cancelacion = NOW(),
          auto_renovar = FALSE,
          actualizada_en = NOW()
      WHERE id = $1
      `,
      [suscripcion.id]
    );

    await client.query(
      `
      UPDATE usuarios
      SET puede_publicar = FALSE
      WHERE id = $1
      `,
      [suscripcion.usuario_id]
    );

    await client.query(
      `
      UPDATE terrenos
      SET estado = 'oculto_suscripcion'
      WHERE usuario_id = $1
        AND estado = 'aprobado'
      `,
      [suscripcion.usuario_id]
    );

    await crearHistorial({
      client,
      suscripcionId: suscripcion.id,
      usuarioId: suscripcion.usuario_id,
      accion: "cancelada",
      estadoAnterior: suscripcion.estado,
      estadoNuevo: "cancelada",
      planAnteriorId: suscripcion.plan_id,
      planNuevoId: suscripcion.plan_id,
      detalle: "customer.subscription.deleted",
      stripeEventId: eventId,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Falta STRIPE_WEBHOOK_SECRET");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Firma de webhook inválida:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await upsertSuscripcionDesdeCheckoutSession(event.data.object, event.id);
        break;

      case "invoice.paid":
        await procesarInvoicePaid(event.data.object, event.id);
        break;

      case "invoice.payment_failed":
        await procesarInvoicePaymentFailed(event.data.object, event.id);
        break;

      case "customer.subscription.deleted":
        await procesarSubscriptionDeleted(event.data.object, event.id);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Error procesando webhook Stripe:", error);
    return res.status(500).json({
      message: "Error procesando webhook.",
      error: error.message,
    });
  }
}

module.exports = {
  handleStripeWebhook,
};