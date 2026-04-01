BEGIN;

-- =========================================================
-- 1. TABLA DE PLANES DE SUSCRIPCIÓN
-- =========================================================
CREATE TABLE IF NOT EXISTS planes_suscripcion (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_mensual NUMERIC(10,2),
  precio_anual NUMERIC(10,2),
  moneda VARCHAR(10) NOT NULL DEFAULT 'MXN',
  limite_terrenos INTEGER,
  permite_destacados BOOLEAN NOT NULL DEFAULT FALSE,
  duracion_dias_trial INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_price_id_mensual VARCHAR(255),
  stripe_price_id_anual VARCHAR(255),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_planes_limite_terrenos CHECK (
    limite_terrenos IS NULL OR limite_terrenos >= 0
  ),
  CONSTRAINT chk_planes_trial CHECK (
    duracion_dias_trial >= 0
  )
);

-- =========================================================
-- 2. TABLA DE SUSCRIPCIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS suscripciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES planes_suscripcion(id) ON DELETE SET NULL,

  origen VARCHAR(30) NOT NULL DEFAULT 'manual',
  -- manual | stripe | trial | admin

  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  -- pendiente | trialing | activa | pago_pendiente | vencida | cancelada | suspendida | pausada

  rol_otorgado VARCHAR(30) NOT NULL DEFAULT 'colaborador',

  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  fecha_cancelacion TIMESTAMP,
  fecha_ultimo_pago TIMESTAMP,
  fecha_proxima_renovacion TIMESTAMP,

  limite_terrenos_override INTEGER,
  trial_usado BOOLEAN NOT NULL DEFAULT FALSE,
  trial_inicio TIMESTAMP,
  trial_fin TIMESTAMP,

  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),

  auto_renovar BOOLEAN NOT NULL DEFAULT TRUE,
  asignada_por_admin_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  observaciones TEXT,

  creada_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizada_en TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_suscripciones_origen CHECK (
    origen IN ('manual', 'stripe', 'trial', 'admin')
  ),
  CONSTRAINT chk_suscripciones_estado CHECK (
    estado IN ('pendiente', 'trialing', 'activa', 'pago_pendiente', 'vencida', 'cancelada', 'suspendida', 'pausada')
  ),
  CONSTRAINT chk_suscripciones_limite_override CHECK (
    limite_terrenos_override IS NULL OR limite_terrenos_override >= 0
  )
);

-- =========================================================
-- 3. TABLA DE HISTORIAL DE SUSCRIPCIONES
-- =========================================================
CREATE TABLE IF NOT EXISTS suscripciones_historial (
  id SERIAL PRIMARY KEY,
  suscripcion_id INTEGER NOT NULL REFERENCES suscripciones(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  accion VARCHAR(50) NOT NULL,
  -- creada | activada | renovada | vencida | suspendida | cancelada | trial_asignado | plan_cambiado | limite_editado | reactivada

  estado_anterior VARCHAR(30),
  estado_nuevo VARCHAR(30),

  plan_anterior_id INTEGER REFERENCES planes_suscripcion(id) ON DELETE SET NULL,
  plan_nuevo_id INTEGER REFERENCES planes_suscripcion(id) ON DELETE SET NULL,

  detalle TEXT,
  ejecutado_por_admin_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  stripe_event_id VARCHAR(255),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. CAMPOS NUEVOS EN USUARIOS
-- =========================================================
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS puede_publicar BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS colaborador_desde TIMESTAMP;

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS suscripcion_actual_id INTEGER;

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS bloqueado_publicacion BOOLEAN NOT NULL DEFAULT FALSE;

-- Agregamos la FK después del ADD COLUMN
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_usuarios_suscripcion_actual'
  ) THEN
    ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_suscripcion_actual
    FOREIGN KEY (suscripcion_actual_id)
    REFERENCES suscripciones(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================
-- 5. NUEVO ESTADO PARA TERRENOS
-- =========================================================
-- Aquí no alteramos el tipo porque tu campo estado parece ser VARCHAR.
-- Solo dejamos preparado el sistema para usar "oculto_suscripcion".

-- Opcionalmente podrías actualizar registros futuros desde lógica backend.
-- No hace falta cambiar estructura si ya es VARCHAR.

-- =========================================================
-- 6. ÍNDICES RECOMENDADOS
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario_id
ON suscripciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_estado
ON suscripciones(estado);

CREATE INDEX IF NOT EXISTS idx_suscripciones_plan_id
ON suscripciones(plan_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_stripe_customer_id
ON suscripciones(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_stripe_subscription_id
ON suscripciones(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_fecha_fin
ON suscripciones(fecha_fin);

CREATE INDEX IF NOT EXISTS idx_suscripciones_historial_usuario_id
ON suscripciones_historial(usuario_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_historial_suscripcion_id
ON suscripciones_historial(suscripcion_id);

-- =========================================================
-- 7. PLANES INICIALES
-- IMPORTANTE: sustituye los Stripe price IDs después
-- =========================================================
INSERT INTO planes_suscripcion (
  codigo,
  nombre,
  descripcion,
  precio_mensual,
  precio_anual,
  moneda,
  limite_terrenos,
  permite_destacados,
  duracion_dias_trial,
  activo,
  stripe_price_id_mensual,
  stripe_price_id_anual
)
VALUES
(
  'trial_anual',
  'Trial Anual',
  'Plan promocional de prueba para crecimiento inicial de la plataforma.',
  0.00,
  0.00,
  'MXN',
  3,
  FALSE,
  365,
  TRUE,
  NULL,
  NULL
),
(
  'basico_3',
  'Básico 3 Terrenos',
  'Permite publicar hasta 3 terrenos.',
  299.00,
  2990.00,
  'MXN',
  3,
  FALSE,
  0,
  TRUE,
  NULL,
  NULL
),
(
  'plus_10',
  'Plus 10 Terrenos',
  'Permite publicar hasta 10 terrenos.',
  599.00,
  5990.00,
  'MXN',
  10,
  TRUE,
  0,
  TRUE,
  NULL,
  NULL
),
(
  'pro_ilimitado',
  'Pro Ilimitado',
  'Permite publicar terrenos ilimitados.',
  999.00,
  9990.00,
  'MXN',
  NULL,
  TRUE,
  0,
  TRUE,
  NULL,
  NULL
)
ON CONFLICT (codigo) DO NOTHING;

COMMIT;