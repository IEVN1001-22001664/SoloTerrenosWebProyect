const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let ioInstance = null;

function parseCookies(cookieHeader = "") {
  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const [rawKey, ...rawValue] = cookie.split("=");
    if (!rawKey) return;

    const key = rawKey.trim();
    const value = rawValue.join("=").trim();

    if (!key) return;
    cookies[key] = decodeURIComponent(value || "");
  });

  return cookies;
}

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("No autenticado"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;

      next();
    } catch (error) {
      console.error("Error autenticando socket:", error.message);
      next(new Error("Token inválido"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user?.id;

    console.log("Socket conectado:", socket.id, "usuario:", userId);

    if (userId) {
      socket.join(`user_${userId}`);
    }

    socket.on("join_conversacion", (conversacionId) => {
      const id = Number(conversacionId);
      if (!id) return;

      socket.join(`conv_${id}`);
    });

    socket.on("leave_conversacion", (conversacionId) => {
      const id = Number(conversacionId);
      if (!id) return;

      socket.leave(`conv_${id}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.id);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO no ha sido inicializado");
  }

  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
};