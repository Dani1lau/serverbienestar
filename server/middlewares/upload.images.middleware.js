// Importar módulos usando "import"
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import multer from 'multer';

// Configuración de Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de multer con CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'horarios',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// Middleware de multer para subir imágenes
const imageUpload = multer({ storage });

export default imageUpload;