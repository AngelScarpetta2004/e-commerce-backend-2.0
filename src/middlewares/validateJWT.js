const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
    const token =  req.header("x-token");
    if(!token){
        return res.status(401).json({msg: "No token provided"});
    }

    // Crear el bloque try catch para verificar el token
    try{
        const {uid} = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = uid;
        next();
    }catch (error){
        return res.status(401).json({msg: "token no valido"});
    }
};

module.exports = validateJWT;