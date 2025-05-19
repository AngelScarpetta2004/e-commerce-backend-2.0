require("dotenv").config();
const mongoose = require("mongoose");
const User = require('../models/user.model');
const bcrypt = require("bcryptjs");

// Configuración mejorada de conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: "majority"
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error.message);
    process.exit(1);
  }
};

// Función mejorada para crear admin
const createAdmin = async () => {
  try {
    await connectDB();

    // Verificar variables de entorno críticas
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("Faltan variables ADMIN_EMAIL o ADMIN_PASSWORD en .env");
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.ADMIN_EMAIL)) {
      throw new Error("El email admin no tiene un formato válido");
    }

    // Validar fortaleza de contraseña
    if (process.env.ADMIN_PASSWORD.length < 8) {
      throw new Error("La contraseña admin debe tener al menos 8 caracteres");
    }

    // Eliminar el admin actual (si existe)
    await User.deleteMany({ role: "admin" });
    console.log("🗑️ Admin(es) eliminados");

    // Crear nuevo admin
    const newAdmin = await User.create({
      name: "Admin Principal",
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: "admin"
    });

    console.log("✅ Admin creado exitosamente");
    return { success: true, action: "created", admin: newAdmin };
  } catch (error) {
    console.error("❌ Error en createAdmin:", error.message);
    return { success: false, error: error.message };
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Desconectado de MongoDB");
  }
};

// Ejecución controlada del script
(async () => {
  const result = await createAdmin();

  if (!result.success) {
    console.error("🚨 No se pudo completar la operación");
    process.exit(1);
  }

  console.log("✨ Operación completada con éxito");
  process.exit(0);
})();
