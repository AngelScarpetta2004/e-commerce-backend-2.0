const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Admin = require("../models/admin.model"); // Asegúrate de tener este modelo

// Crear usuario admin al iniciar (ejecutar una vez)
const createAdminUser = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@ecommerce.com" });
    if (!adminExists) {
      await Admin.create({
        name: "Admin",
        email: "admin@ecommerce.com",
        password: await bcrypt.hash("Admin123!", 10),
        role: "admin"
      });
      console.log("✅ Admin user created");
    }
  } catch (error) {
    console.error("Admin creation error:", error);
  }
};

// Ejecutar al iniciar la aplicación
createAdminUser();

// Registrar usuario normal
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/users/${req.file.filename}` : null;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user", // Fijamos como usuario normal
      profileImage
    });

    await newUser.save();
    res.status(201).json({ 
      message: "Usuario registrado con éxito",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage
      }
    });
  } catch (error) {
    console.error("Error en registro: ", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Login modificado
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Primero verificar si es admin
    if (email === "admin@ecommerce.com") {
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(400).json({ message: "Credenciales inválidas" });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });

      const token = jwt.sign(
        { id: admin._id, name: admin.name, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }

    // Login para usuarios normales (sin token)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error("Error en login: ", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
}

// Actualizar imagen de perfil (solo para usuarios normales)
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ninguna imagen" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: `/uploads/users/${req.file.filename}` },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Imagen de perfil actualizada",
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error("Error al actualizar imagen: ", error);
    res.status(500).json({ message: "Error al actualizar la imagen de perfil" });
  }
};

module.exports = { 
  register, 
  login,
  updateProfileImage 
};