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
 *     summary: Registrar un nuevo usuario normal
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
 *     summary: Iniciar sesión (usuarios normales)
 *     tags: [Autenticación]
 *     description: Login para usuarios normales (no devuelve token)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profileImage:
 *                       type: string
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

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Iniciar sesión (admin)
 *     tags: [Autenticación]
 *     description: Login exclusivo para administradores (devuelve token JWT)
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
 *                 example: "admin@ecommerce.com"
 *               password:
 *                 type: string
 *                 example: "Admin123!"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Error en la autenticación
 */
router.post(
  "/admin/login",
  [
    check("email", "El email no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validateFields
  ],
  login
);

module.exports = router;