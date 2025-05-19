const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { deleteImage } = require("../utils/fileUtils");

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/users/profile
 * @access  Privado
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/users/profile
 * @access  Privado
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const updates = {};

    // Verificar si el usuario existe
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Actualizar nombre si se proporciona
    if (name) updates.name = name;

    // Actualizar email con validación
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "El email ya está en uso" });
      }
      updates.email = email;
    }

    // Actualizar contraseña si se proporciona la actual y la nueva
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Contraseña actual incorrecta" });
      }
      updates.password = newPassword; // El pre-save hook en el modelo se encargará del hashing
    }

    // Actualizar imagen de perfil si se subió un archivo
    if (req.file) {
      // Eliminar la imagen anterior si existe
      if (user.profileImage) {
        await deleteImage(user.profileImage);
      }
      updates.profileImage = `/uploads/users/${req.file.filename}`;
    }

    // Aplicar actualizaciones
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    res.json({ 
      success: true, 
      message: "Perfil actualizado correctamente",
      data: updatedUser
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ success: false, message: error.message || "Error del servidor" });
  }
};

/**
 * @desc    Eliminar cuenta de usuario
 * @route   DELETE /api/users/profile
 * @access  Privado
 */
const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Eliminar imagen de perfil si existe
    if (user.profileImage) {
      await deleteImage(user.profileImage);
    }

    // Eliminar usuario
    await User.findByIdAndDelete(req.user.id);

    res.json({ success: true, message: "Cuenta eliminada correctamente" });

  } catch (error) {
    console.error("Error al eliminar perfil:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile
};