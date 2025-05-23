// swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Autos',
      version: '1.0.0',
      description: 'Documentación de la API de Autos'
    },
  },
  apis: ['./index.js'], // apunta al archivo donde están tus rutas
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};
