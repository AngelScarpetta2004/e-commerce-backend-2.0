const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct,
  advancedSearch
} = require("../controllers/product.controller");
const validateFields = require("../middlewares/validateFields");
const authenticateToken = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de vehículos en el sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehiculo:
 *       type: object
 *       required:
 *         - marca
 *         - modelo
 *         - año
 *         - precio
 *         - color
 *         - kilometraje
 *         - tipo
 *         - transmision
 *         - imagenes
 *         - descripcion
 *       properties:
 *         marca:
 *           type: string
 *           example: "Toyota"
 *         modelo:
 *           type: string
 *           example: "Corolla"
 *         año:
 *           type: integer
 *           example: 2023
 *         precio:
 *           type: number
 *           example: 25000
 *         color:
 *           type: string
 *           example: "Blanco"
 *         kilometraje:
 *           type: number
 *           example: 0
 *         tipo:
 *           type: string
 *           enum: [Sedán, SUV, Pickup, Deportivo, Hatchback, Eléctrico]
 *           example: "Sedán"
 *         transmision:
 *           type: string
 *           enum: [Automática, Manual]
 *           example: "Automática"
 *         imagenes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/auto1.jpg"]
 *         descripcion:
 *           type: string
 *           example: "Vehículo en excelente estado"
 *         disponible:
 *           type: boolean
 *           default: true
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener todos los vehículos con filtros opcionales
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Filtrar por marca (ej. Toyota)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Sedán, SUV, Pickup, Deportivo, Hatchback, Eléctrico]
 *         description: Filtrar por tipo de vehículo
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *     responses:
 *       200:
 *         description: Lista de vehículos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehiculo'
 *       500:
 *         description: Error del servidor
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/search/advanced:
 *   get:
 *     summary: Búsqueda avanzada de vehículos
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Marca del vehículo
 *       - in: query
 *         name: modelo
 *         schema:
 *           type: string
 *         description: Modelo del vehículo
 *       - in: query
 *         name: minYear
 *         schema:
 *           type: integer
 *         description: Año mínimo
 *       - in: query
 *         name: maxYear
 *         schema:
 *           type: integer
 *         description: Año máximo
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Sedán, SUV, Pickup, Deportivo, Hatchback, Eléctrico]
 *         description: Tipo de vehículo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehiculo'
 */
router.get("/search/advanced", advancedSearch);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un vehículo por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Detalles del vehículo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehiculo'
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get(
  "/:id",
  [check("id", "El ID debe ser válido").isMongoId()],
  validateFields,
  getProductById
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo vehículo (solo admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehiculo'
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehiculo'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  [
    check("marca", "La marca es obligatoria").not().isEmpty(),
    check("modelo", "El modelo es obligatorio").not().isEmpty(),
    check("año", "El año debe ser un número válido").isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    check("precio", "El precio debe ser un número válido").isFloat({ gt: 0 }),
    check("color", "El color es obligatorio").not().isEmpty(),
    check("kilometraje", "El kilometraje debe ser un número válido").isFloat({ min: 0 }),
    check("tipo", "Tipo de vehículo inválido").isIn(["Sedán", "SUV", "Pickup", "Deportivo", "Hatchback", "Eléctrico"]),
    check("transmision", "Transmisión inválida").isIn(["Automática", "Manual"]),
    check("imagenes", "Debe proporcionar al menos una imagen").isArray({ min: 1 }),
    check("descripcion", "La descripción es obligatoria").not().isEmpty(),
    validateFields
  ],
  createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un vehículo (solo admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del vehículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehiculo'
 *     responses:
 *       200:
 *         description: Vehículo actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehiculo'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put(
  "/:id",
  authenticateToken,
  checkRole(["admin"]),
  [
    check("id", "El ID debe ser válido").isMongoId(),
    validateFields
  ],
  updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un vehículo (solo admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo administradores
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin"]),
  [
    check("id", "El ID debe ser válido").isMongoId(),
    validateFields
  ],
  deleteProduct
);

module.exports = router;