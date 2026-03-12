const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración de almacenamiento
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const terrenoId = req.params.id;

    const uploadPath = `uploads/terrenos/${terrenoId}`;

    // Crear carpeta si no existe
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const uniqueName = Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  }

});

// Filtro de archivos
const fileFilter = (req, file, cb) => {

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagen no permitido"), false);
  }

};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;