const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Registrar usuario normal
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el email es el de admin
    if (email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ 
        message: 'No puedes registrarte con este email' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const profileImage = req.file ? `/uploads/users/${req.file.filename}` : null;

    // Crear usuario (siempre como 'user')
    const newUser = new User({
      name,
      email,
      password, // El middleware pre-save se encargará de hashear
      role: "user",
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
    res.status(500).json({ 
      message: error.message || "Error en el servidor" 
    });
  }
};

// Inicio de sesión unificado
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario (ya sea admin o user normal)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Solo generar token para admin
    const token = user.role === 'admin' 
      ? jwt.sign(
          { id: user._id, name: user.name, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "8h" } // Token más largo para admin
        )
      : null;

    // Respuesta diferenciada
    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    };

    if (token) {
      response.token = token;
    }

    res.json(response);

  } catch (error) {
    console.error("Error en login: ", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

// Crear usuario admin inicial (ejecutar manualmente una vez)
const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin Principal',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // El pre-save lo hasheará
        role: 'admin'
      });
      console.log('✅ Admin creado exitosamente');
    } else {
      console.log('ℹ️ Ya existe un admin en el sistema');
    }
  } catch (error) {
    console.error('❌ Error creando admin:', error.message);
  }
};

// Actualizar imagen de perfil
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ninguna imagen" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: `/uploads/users/${req.file.filename}` },
      { new: true }
    ).select('-password');

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
  updateProfileImage,
  createAdmin
};