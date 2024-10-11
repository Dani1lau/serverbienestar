import multer from "multer";
import path from "path";
import fs from "fs";

// Crear la carpeta para imágenes si no existe
const createImagesFolder = (imagesFolder) => {
  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
  }
};


// Configuración para imágenes
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesFolder = path.resolve('uploads/images/');
    createImagesFolder(imagesFolder); // Crear la carpeta de imágenes si no existe
    cb(null, imagesFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Asignar un nombre único a las imágenes
  },
});

// Filtro para permitir solo archivos de imagen
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.test(ext)) {
    return cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png)'));
  }
  cb(null, true);
};

// Inicializar multer para imágenes
const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
});

export default imageUpload;
