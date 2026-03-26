// ======================================================
// IMPORTACIÓN DE DEPENDENCIAS PRINCIPALES
// ======================================================

const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { initSocket } = require("./socket");

console.log("--- DEBUG DE VARIABLES EN LA MAC ---");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Password exists:", !!process.env.DB_PASSWORD);
console.log("Port:", process.env.DB_PORT);
console.log("------------------------------------");

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
const imagenesRoutes = require("./routes/imagenes.routes");
const documentosLegalesRoutes = require("./routes/documentosLegales.routes");
const leadsRoutes = require("./routes/leads.routes");
const conversacionesRoutes = require("./routes/conversaciones.routes");
const notificacionesRoutes = require("./routes/notificaciones.routes");
const favoritosRoutes = require("./routes/favoritos.routes");

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
// ======================================================

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

// ======================================================
// COOKIE PARSER
// ======================================================

app.use(cookieParser());

// ======================================================
// LOGGER DE PETICIONES
// ======================================================

app.use((req, res, next) => {
  console.log("Petición recibida en backend:", req.method, req.url);
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

// imágenes
app.use("/api", imagenesRoutes);

// documentos legales
app.use("/api", documentosLegalesRoutes);

// leads
app.use("/api/leads", leadsRoutes);

// conversaciones
app.use("/api/conversaciones", conversacionesRoutes);

// notificaciones
app.use("/api/notificaciones", notificacionesRoutes);

// favoritos
app.use("/api/favoritos", favoritosRoutes);

//Mapa de Zonas
app.use("/api/terrenos", terrenosRoutes);

// ======================================================
// ARCHIVOS ESTÁTICOS
// ======================================================

app.use("/uploads", express.static("uploads"));

// ======================================================
// RUTA PRINCIPAL DE PRUEBA
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
      error: error.message,
    });
  }
});

// ======================================================
// CONFIGURACIÓN PARA SOCKET.IO
// ======================================================

const server = http.createServer(app);

// inicializar socket
initSocket(server);

// ======================================================
// PUERTO DEL SERVIDOR
// ======================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Servidor de SoloTerrenos activo en http://0.0.0.0:${PORT}`);
  console.log("Socket.IO inicializado correctamente");
  console.log("=================================");
});