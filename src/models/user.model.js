const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        if (this.role === "admin") {
          return v === process.env.ADMIN_EMAIL;
        }
        return true;
      },
      message: (props) => `El administrador debe usar el email: ${process.env.ADMIN_EMAIL}`,
    },
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, // ← Esta contraseña se guardará tal cual (sin hashing)
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    required: true,
    default: "user",
    validate: {
      validator: function (v) {
        // Solo se permite un admin
        if (v === "admin") {
          return this.constructor.findOne({ role: "admin" }).then((admin) => {
            return !admin || admin._id.toString() === this._id.toString();
          });
        }
        return true;
      },
      message: "Solo puede existir un usuario administrador",
    },
  },
  profileImage: {
    type: String,
  },
}, { timestamps: true });

// 🔴 No hay middleware de hashing → la contraseña queda en texto plano
module.exports = model("User", userSchema);
