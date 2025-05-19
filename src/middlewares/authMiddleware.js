const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authenticateToken = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      // Obtener token del header
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      
      // Rutas públicas
      if (req.path === '/auth/login' || req.path === '/auth/register') {
        return next();
      }

      // Rutas que requieren autenticación
      if (!token) {
        return res.status(401).json({ message: "Acceso no autorizado" });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar si el usuario existe
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      // Verificar rol si es requerido
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Acceso prohibido" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error en autenticación:", error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Token inválido" });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expirado" });
      }
      
      res.status(500).json({ message: "Error en la autenticación" });
    }
  };
};

module.exports = authenticateToken;