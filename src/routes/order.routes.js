const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require("../controllers/order.controller");
const validateJWT = require("../middlewares/validateJWT");

// creamos las rutas para las ordenes
router.post("/", validateJWT, createOrder); // crear orden
router.get("/", validateJWT, getOrders); // obtener ordenes del usuario

module.exports = router; 