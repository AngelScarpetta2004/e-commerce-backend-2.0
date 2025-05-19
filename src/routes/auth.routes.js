const express = require("express");
const { check } = require("express-validator");
const { register, login } = require("../controllers/auth.controller");
const validateFields = require("../middlewares/validateFields");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Rutas de autenticación
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Carlos López"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "carlos@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [admin, usuario]
 *                 example: "usuario"
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *       400:
 *         description: Error en la solicitud
 */
router.post(
  "/register",
  [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    validateFields
  ],
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "carlos@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Error en la autenticación
 */
router.post(
  "/login",
  [
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validateFields
  ],
  login
);

module.exports = router;