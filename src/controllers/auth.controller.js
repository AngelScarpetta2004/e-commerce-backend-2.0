const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// Registrar usuario normal
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
     console.log("Password recibido en registro (backend):", password);

    if (!name || !email || !password) {
      console.log("Registro fallido: faltan campos");
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    if (email === process.env.ADMIN_EMAIL) {
      console.log("Registro fallido: email admin bloqueado", email);
      return res.status(403).json({ success: false, message: "No puedes registrarte con este email" });
    }

    // Guardar email en minúsculas para consistencia
    const normalizedEmail = email.trim().toLowerCase();

    console.log("Buscando usuario existente con email:", normalizedEmail);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log("El email ya está registrado:", normalizedEmail);
      return res.status(400).json({ success: false, message: "El email ya está registrado" });
    }

    const profileImage = req.file ? `/uploads/users/${req.file.filename}` : null;

    // Hashear contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Contraseña hasheada para nuevo usuario:", hashedPassword);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      profileImage,
    });

    await newUser.save();

    console.log("Usuario registrado con éxito:", normalizedEmail);

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
    console.error("Error en registro: ", error);
    res.status(500).json({ success: false, message: error.message || "Error en el servidor" });
  }
};

// Inicio de sesión unificado
const login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      console.log('Faltan credenciales:', req.body);
      return res.status(400).json({ 
        success: false, 
        message: "Email y contraseña son requeridos" 
      });
    }

    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    console.log('Intento de login con email:', `"${email}"`);
    console.log('Contraseña recibida (raw):', `"${password}"`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado para email:', email);
      const usersInDb = await User.find({}, {email: 1, _id: 0});
      console.log('Usuarios en DB:', usersInDb);
      return res.status(400).json({ 
        success: false, 
        message: "Credenciales inválidas" 
      });
    }

    console.log('Hash almacenado (DB):', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Resultado de comparación:', isMatch);

    if (!isMatch) {
      console.log('Contraseña no coincide para usuario:', email);
      return res.status(400).json({ 
        success: false, 
        message: "Credenciales inválidas" 
      });
    }

    let token = null;
    if (user.role === "admin") {
      console.log('Generando token para admin:', email);
      token = jwt.sign(
        { 
          id: user._id, 
          name: user.name, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );
    }

    console.log('Login exitoso para:', email);
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

    if (token) response.token = token;

    return res.json(response);

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error al iniciar sesión",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear usuario admin inicial (ejecutar una vez)
const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

      await User.create({
        name: "Admin Principal",
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
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
    console.error("Error al actualizar imagen: ", error);
    res.status(500).json({ success: false, message: "Error al actualizar la imagen de perfil" });
  }
};

module.exports = {
  register,
  login,
  updateProfileImage,
  createAdmin,
};
