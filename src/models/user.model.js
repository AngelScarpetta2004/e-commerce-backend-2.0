const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Validación especial para el email admin
        if (this.role === 'admin') {
          return v === process.env.ADMIN_EMAIL;
        }
        return true;
      },
      message: props => `El administrador debe usar el email: ${process.env.ADMIN_EMAIL}`
    }
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
    default: "user",
    validate: {
      validator: async function(v) {
        if (v === 'admin') {
          const existingAdmin = await this.constructor.findOne({ role: 'admin' });
          // Permite actualizar al admin existente pero no crear nuevos
          if (existingAdmin && existingAdmin._id.toString() !== this._id.toString()) {
            return false;
          }
        }
        return true;
      },
      message: 'Solo puede existir un usuario administrador en el sistema'
    }
  },
  profileImage: {
    type: String
  }
}, { timestamps: true });

// Middleware para prevenir crear más de un admin
userSchema.pre('save', async function(next) {
  if (this.isModified('role') && this.role === 'admin') {
    const existingAdmin = await this.constructor.findOne({ role: 'admin' });
    
    if (existingAdmin && existingAdmin._id.toString() !== this._id.toString()) {
      throw new Error('Solo puede existir un usuario administrador');
    }

    // Validar credenciales del admin
    if (this.email !== process.env.ADMIN_EMAIL) {
      throw new Error(`El admin debe usar el email ${process.env.ADMIN_EMAIL}`);
    }
  }

  // Encriptar contraseña si es nueva o fue modificada
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = model("User", userSchema);