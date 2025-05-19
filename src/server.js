require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerSpec");

// Routes
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const ordersRouter = require("./routes/order.routes");

// Middlewares
const checkRole = require("./middlewares/roleMiddleware");
const authenticateToken = require("./middlewares/authMiddleware");

const app = express();

// ==============================================
// 1. CONFIGURACIÓN BÁSICA DEL SERVIDOR
// ==============================================

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Configuración CORS para desarrollo/producción
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400 // 24 horas
}));

// ==============================================
// 2. CONEXIÓN A LA BASE DE DATOS
// ==============================================

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: "majority"
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => {
  console.error("❌ Error de conexión a MongoDB:", err);
  process.exit(1);
});

// ==============================================
// 3. SERVIR ARCHIVOS ESTÁTICOS (IMÁGENES, ETC)
// ==============================================

// Servir imágenes de productos (admin)
app.use("/uploads/products", express.static(path.join(__dirname, "uploads/products")));

// Servir imágenes de perfil de usuarios
app.use("/uploads/users", express.static(path.join(__dirname, "uploads/users")));

// ==============================================
// 4. DOCUMENTACIÓN API (SWAGGER)
// ==============================================

// Configurar Swagger en la raíz
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerSpec));

// ==============================================
// 5. RUTAS DE LA API (CON PREFIJO /api)
// ==============================================

// API Pública
app.use("/api/auth", authRoutes);

// API Protegida (JWT)
app.use("/api/products", productRoutes);
app.use("/api/orders", authenticateToken, ordersRouter);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    status: "API Ecommerce funcionando 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date()
  });
});

// Ruta protegida para admin
app.post("/api/admin/products", 
  authenticateToken, 
  checkRole(["admin"]), 
  (req, res) => {
    res.status(201).json({ 
      success: true,
      message: "Producto creado exitosamente" 
    });
  }
);

// ==============================================
// 6. MANEJO DE ERRORES CENTRALIZADO
// ==============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Manejo de errores específicos
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Token inválido"
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: "No autorizado"
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// ==============================================
// 7. INICIO DEL SERVIDOR
// ==============================================

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
  console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
  console.log(`=================================\n`);
});

module.exports = app;