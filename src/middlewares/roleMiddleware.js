const checkRole = (allowedRoles = []) => {
    return (req, res, next) => {
      if(!req.user){
        return res.status(401).json({ message: "Acceso denegado, token no proporcionado"});
      }

      // Verificar si el role 
      if(!allowedRoles.includes(req.user.role)){
        return res.status(403).json({ message: "Acceso denegado, No tienes permisos"});
      }
      // si el role es valido, continua con la siguiente funcion
      next();
    };
  };
  
  module.exports = checkRole;
  