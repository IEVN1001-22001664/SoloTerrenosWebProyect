// ======================================================
// IMPORTACIÓN DE DEPENDENCIAS PRINCIPALES
// ======================================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

// ======================================================
// IMPORTACIÓN DE BASE DE DATOS
// ======================================================

const pool = require("./db");


// ======================================================
// IMPORTACIÓN DE RUTAS DEL SISTEMA
// ======================================================

const authRoutes = require("./routes/auth.routes");
const terrenosRoutes = require("./routes/terrenos.routes");
const adminRoutes = require("./routes/admin.routes");
const sepomexRoutes = require("./routes/sepomex.routes");

// ======================================================
// CREACIÓN DE LA APLICACIÓN EXPRESS
// ======================================================

const app = express();


// ======================================================
// MIDDLEWARE PARA LEER JSON
// ======================================================

app.use(express.json());


// ======================================================
// CONFIGURACIÓN CORS
// Permite que el frontend (Next.js) acceda al backend
// ======================================================

app.use(
  cors({
    origin: "http://localhost:3000", // frontend Next.js
    credentials: true, // permite cookies y sesiones
  })
);


// ======================================================
// COOKIE PARSER
// Permite leer cookies del navegador
// ======================================================

app.use(cookieParser());


// ======================================================
// LOGGER DE PETICIONES (MUY ÚTIL PARA DEBUG)
// ======================================================

app.use((req, res, next) => {

  console.log(
    "Petición recibida en backend:",
    req.method,
    req.url
  );

  next();

});


// ======================================================
// REGISTRO DE RUTAS DEL SISTEMA
// ======================================================

// autenticación
app.use("/api/auth", authRoutes);

// terrenos
app.use("/api/terrenos", terrenosRoutes);

// administración
app.use("/api/admin", adminRoutes);

// sepomex
app.use("/api/sepomex", sepomexRoutes);


// ======================================================
// RUTA PRINCIPAL DE PRUEBA
// Sirve para comprobar que el backend funciona
// ======================================================

app.get("/", async (req, res) => {

  try {

    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "API funcionando",
      databaseTime: result.rows[0],
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
// ======================================================
// CONFIGURACION DE IMAGENES
// ======================================================

});
const imagenesRoutes = require("./routes/imagenes.routes");

app.use("/api", imagenesRoutes);

app.use("/uploads", express.static("uploads"));















// ----------LINEAS DE CODIGO FINALES--------------------
// ======================================================
// PUERTO DEL SERVIDOR
// ======================================================

const PORT = process.env.PORT || 5000;


// ======================================================
// INICIO DEL SERVIDOR
// ======================================================

app.listen(PORT, () => {

  console.log("=================================");
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("=================================");

});
