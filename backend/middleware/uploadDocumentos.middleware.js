const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// CONFIGURACIÓN DE ALMACENAMIENTO DE DOCUMENTOS LEGALES
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const terrenoId = req.params.id;

    const uploadPath = `uploads/documentos/${terrenoId}`;

    // Crear carpeta si no existe
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// ======================================================
// FILTRO DE ARCHIVOS PERMITIDOS
// ======================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de documento no permitido"), false);
  }
};

// ======================================================
// CONFIGURACIÓN FINAL DE MULTER
// ======================================================

const uploadDocumentos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB por archivo
  }
});

module.exports = uploadDocumentos;