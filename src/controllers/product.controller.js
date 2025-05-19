const Product = require("../models/product.model");

// Obtener todos los vehículos con filtros básicos
const getProducts = async (req, res) => {
  try {
    const { tipo, marca, minPrice, maxPrice, minYear, maxYear } = req.query;
    const filter = {};
    
    // Filtros básicos
    if (tipo) filter.tipo = tipo;
    if (marca) filter.marca = marca;
    
    // Filtros por rango
    if (minPrice || maxPrice) {
      filter.precio = {};
      if (minPrice) filter.precio.$gte = Number(minPrice);
      if (maxPrice) filter.precio.$lte = Number(maxPrice);
    }
    
    if (minYear || maxYear) {
      filter.año = {};
      if (minYear) filter.año.$gte = Number(minYear);
      if (maxYear) filter.año.$lte = Number(maxYear);
    }

    const products = await Product.find(filter)
      .sort({ precio: 1 }); // Ordenar por precio ascendente

    res.json(products);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al obtener los vehículos",
      error: error.message 
    });
  }
};

// Búsqueda avanzada con paginación
const advancedSearch = async (req, res) => {
  try {
    const {
      marca,
      modelo,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      tipo,
      transmision,
      color,
      minKilometraje,
      maxKilometraje,
      sortBy = 'precio',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    
    // Filtros de texto (insensibles a mayúsculas/minúsculas)
    if (marca) filter.marca = new RegExp(marca, 'i');
    if (modelo) filter.modelo = new RegExp(modelo, 'i');
    if (color) filter.color = new RegExp(color, 'i');
    
    // Filtros de selección
    if (tipo) filter.tipo = tipo;
    if (transmision) filter.transmision = transmision;
    
    // Filtros por rango
    if (minYear || maxYear) {
      filter.año = {};
      if (minYear) filter.año.$gte = parseInt(minYear);
      if (maxYear) filter.año.$lte = parseInt(maxYear);
    }
    
    if (minPrice || maxPrice) {
      filter.precio = {};
      if (minPrice) filter.precio.$gte = parseInt(minPrice);
      if (maxPrice) filter.precio.$lte = parseInt(maxPrice);
    }
    
    if (minKilometraje || maxKilometraje) {
      filter.kilometraje = {};
      if (minKilometraje) filter.kilometraje.$gte = parseInt(minKilometraje);
      if (maxKilometraje) filter.kilometraje.$lte = parseInt(maxKilometraje);
    }

    // Configuración de ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Paginación
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error en búsqueda avanzada",
      error: error.message 
    });
  }
};

// Obtener un vehículo por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al buscar el vehículo",
      error: error.message 
    });
  }
};

// Crear un nuevo vehículo
const createProduct = async (req, res) => {
  try {
    const {
      marca,
      modelo,
      año,
      precio,
      color,
      kilometraje,
      tipo,
      transmision,
      descripcion,
      imagenes: imagenesExistentes // Para mantener compatibilidad con imágenes existentes
    } = req.body;

    // Validación de campos obligatorios
    if (!marca || !modelo || !año || !precio || !color || !kilometraje || !tipo || !transmision || !descripcion) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios" 
      });
    }

    // Combinar imágenes existentes con nuevas
    let imagenes = [];
    
    // Si hay imágenes en el body (URLs existentes)
    if (imagenesExistentes && Array.isArray(imagenesExistentes)) {
      imagenes = [...imagenesExistentes];
    }
    
    // Si hay nuevas imágenes subidas
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => `/uploads/products/${file.filename}`);
      imagenes = [...imagenes, ...nuevasImagenes];
    }

    // Validar que haya al menos una imagen
    if (imagenes.length === 0) {
      return res.status(400).json({ 
        message: "Se requiere al menos una imagen" 
      });
    }

    const newProduct = new Product({
      marca,
      modelo,
      año: Number(año),
      precio: Number(precio),
      color,
      kilometraje: Number(kilometraje),
      tipo,
      transmision,
      imagenes,
      descripcion,
      disponible: true
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al crear el vehículo",
      error: error.message 
    });
  }
};

// Actualizar un vehículo
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    // Manejar imágenes
    let imagenes = [...(product.imagenes || [])];
    
    // Si hay nuevas imágenes subidas
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => `/uploads/products/${file.filename}`);
      imagenes = [...imagenes, ...nuevasImagenes];
    }
    
    // Si se proporcionan imágenes en el body (para reemplazar o actualizar)
    if (updateData.imagenes && Array.isArray(updateData.imagenes)) {
      imagenes = updateData.imagenes;
    }

    updateData.imagenes = imagenes;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al actualizar el vehículo",
      error: error.message 
    });
  }
};

// Eliminar un vehículo
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }
    res.json({ message: "Vehículo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al eliminar el vehículo",
      error: error.message 
    });
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct,
  advancedSearch
};