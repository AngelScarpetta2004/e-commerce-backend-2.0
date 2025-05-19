const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Registrar usuario
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    if (email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "No puedes registrarte con este email" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "El email ya está registrado" });
    }

    const profileImage = req.file ? `/uploads/users/${req.file.filename}` : null;

    const newUser = new User({
      name,
      email: normalizedEmail,
      password, // SIN hash
      role: "user",
      profileImage,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Usuario registrado con éxito",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

// Inicio de sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: "Credenciales inválidas" });
    }

    const response = {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };

    // Solo el admin recibe token
    if (user.role === "admin") {
      const token = jwt.sign(
        { id: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );
      response.token = token;
    }

    res.json(response);
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error al iniciar sesión" });
  }
};

// Crear usuario admin inicial (una sola vez)
const createAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      await User.create({
        name: "Admin Principal",
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        password: process.env.ADMIN_PASSWORD, // SIN hash
        role: "admin",
      });
      console.log("✅ Admin creado exitosamente");
    } else {
      console.log("ℹ️ Ya existe un admin en el sistema");
    }
  } catch (error) {
    console.error("❌ Error creando admin:", error.message);
  }
};

// Actualizar imagen de perfil
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se ha subido ninguna imagen" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: `/uploads/users/${req.file.filename}` },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({
      success: true,
      message: "Imagen de perfil actualizada",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Error al actualizar imagen:", error);
    res.status(500).json({ success: false, message: "Error al actualizar la imagen de perfil" });
  }
};

module.exports = {
  register,
  login,
  updateProfileImage,
  createAdmin,
};
