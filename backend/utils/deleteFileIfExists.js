const fs = require("fs");
const path = require("path");

function removeEmptyDirsUpwards(startPath, stopAt) {
  let currentDir = path.dirname(startPath);

  while (currentDir.startsWith(stopAt) && currentDir !== stopAt) {
    try {
      const files = fs.readdirSync(currentDir);

      if (files.length > 0) {
        break;
      }

      fs.rmdirSync(currentDir);
      currentDir = path.dirname(currentDir);
    } catch (error) {
      break;
    }
  }
}

function deleteFileIfExists(relativePath) {
  try {
    if (!relativePath) return;

    const cleanPath = relativePath.startsWith("/")
      ? relativePath.slice(1)
      : relativePath;

    const absolutePath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);

      const uploadsRoot = path.join(process.cwd(), "uploads");
      removeEmptyDirsUpwards(absolutePath, uploadsRoot);
    }
  } catch (error) {
    console.error("Error eliminando archivo físico:", relativePath, error);
  }
}

module.exports = deleteFileIfExists;