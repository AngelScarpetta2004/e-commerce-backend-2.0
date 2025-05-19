const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Excluir rutas públicas
  if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
    return next();
  }

  // Solo requerir token para rutas admin
  if (req.path.startsWith('/admin')) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Acceso denegado. Token requerido" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar que sea admin
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Acceso solo para administradores" });
      }

      req.user = decoded;
      return next();
    } catch (error) {
      console.error("Error al verificar el token: ", error.message);
      return res.status(401).json({ message: "Token inválido" });
    }
  }

  // Para rutas de usuario normal, continuar sin token
  next();
};

module.exports = authenticateToken;