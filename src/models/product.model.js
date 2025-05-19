const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  marca: {
    type: String,
    required: true,
    trim: true,
    index: true  // Índice para búsquedas más rápidas
  },
  modelo: {
    type: String,
    required: true,
    index: true
  },
  año: {
    type: Number,
    required: true,
    min: 1990,  // Ampliado el rango mínimo
    max: new Date().getFullYear() + 1
  },
  precio: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  color: {
    type: String,
    required: true,
    index: true
  },
  kilometraje: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  tipo: {
    type: String,
    enum: ['Sedán', 'SUV', 'Pickup', 'Deportivo', 'Hatchback', 'Eléctrico', 'Minivan', 'Camioneta', 'Coupe', 'Convertible'],
    required: true,
    index: true
  },
  transmision: {
    type: String,
    enum: ['Automática', 'Manual', 'Semi-automática', 'CVT'],
    required: true
  },
  imagenes: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 10;  // Aumentado a 10 imágenes máx
      },
      message: 'Debe tener entre 1 y 10 imágenes'
    }
  },
  descripcion: {
    type: String,
    required: true,
    minlength: 20  // Descripción mínima de 20 caracteres
  },
  disponible: {
    type: Boolean,
    default: true
  },
  destacado: {  // Nuevo campo
    type: Boolean,
    default: false
  },
  caracteristicas: {  // Nuevo campo para especificaciones técnicas
    type: [String],
    default: []
  },
  fechaCreacion: {  // Alternativa a timestamps
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,  // Crea createdAt y updatedAt automáticamente
  versionKey: false,  // Elimina el campo __v
  toJSON: { virtuals: true },  // Incluye virtuals al convertir a JSON
  toObject: { virtuals: true }
});

// Índice compuesto para búsquedas frecuentes
productSchema.index({ marca: 1, modelo: 1, año: -1 });

// Virtual para el nombre completo del vehículo
productSchema.virtual('nombreCompleto').get(function() {
  return `${this.marca} ${this.modelo} ${this.año}`;
});

// Middleware para actualizar el name automáticamente
productSchema.pre('save', function(next) {
  this.name = this.nombreCompleto;
  next();
});

module.exports = model("Product", productSchema);