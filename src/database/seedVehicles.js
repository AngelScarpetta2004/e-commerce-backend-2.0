require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const vehicles = require('../data/vehicles.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:ejemplo123@mongo:27017/ecommerceDB?authSource=admin';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✔ Conectado a MongoDB');

    await Product.deleteMany();
    console.log('✔ Colección limpiada');

    const productsToInsert = vehicles.map(vehicle => ({
      ...vehicle,
      name: `${vehicle.marca} ${vehicle.modelo} ${vehicle.año}`,
      stock: 5,
      disponible: true
    }));

    await Product.insertMany(productsToInsert);
    console.log(`✅ ${vehicles.length} vehículos insertados correctamente`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();