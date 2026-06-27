const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Whitestone API',
      version: '1.0.0',
      description: 'Whitestone Farm Management API',
      contact: {
        name: 'Whitestone Support',
        email: 'support@whitestone.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5500',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
