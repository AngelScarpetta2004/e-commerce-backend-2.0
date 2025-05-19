const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// options 
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce API",
            version: "0.0.1",
            description: "Documentación de la API para un e-commerce",
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "Servidor local",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js"], // archivo donde se encuentran las rutas
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
    // Configurar Swagger en la raíz
    app.use('/', swaggerUi.serve);
    app.get('/', swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
