const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar la carpeta según el tipo de archivo
    let uploadPath = 'src/uploads/';
    if (file.fieldname === 'profileImage') {
      uploadPath += 'users/';
    } else if (file.fieldname === 'imagenes') {
      uploadPath += 'products/';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Crear nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Middleware para subir imágenes de productos
const uploadProductImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // límite de 5MB
  }
}).array('imagenes', 5);

// Middleware para subir imagen de perfil
const uploadProfileImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // límite de 2MB
  }
}).single('profileImage');

module.exports = {
  uploadProductImage,
  uploadProfileImage
}; 