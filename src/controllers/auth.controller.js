const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Registrar usuario
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Obtener ruta de la imagen de perfil si se subió una
    const profileImage = req.file ? `/uploads/users/${req.file.filename}` : null;

    // Crear usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage
    });

    // Guardar el usuario
    await newUser.save();
    res.status(201).json({ 
      message: "Usuario Registrado con éxito",
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

// Iniciar sesion
const login = async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await user.findOne({email});

    // Verificar si el usuario existe
    if(!user){
      return res.status(400).json({ message: "Usuario no encontrado"});
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({ message: "Contraseña incorrecta"});
    }

    //Agregar el rol al token
    const token = jwt.sign({
      id: user._id,
      name: user.name,
      role: user.role,
      },
      process.env.JWT_SECRET,
     { expiresIn: "1h" }
    );

    // devolver el token y los datos del usuario
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  }catch (error){
    console.error(" Error en login: ", error);
    res.status(500).json({ message: "Error al inicar sesion"});
  }
}

module.exports = { 
  register, 
  login,
  updateProfileImage 
};







