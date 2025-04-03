const swaggerJSDoc = require("swagger-jsdoc"); // Swagger definition
const swaggerUi = require("swagger-ui-express"); // Swagger UI

const options = {
  definition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Sensor API", // API title
      version: "1.0.0", // API version
      description: "API documentation for the sensor readings service", // API description
    },
    servers: [
      {
        url: "http://localhost:3000", // Server URL
      },
    ],
  },
  // Path to the API docs
  apis: ["./server.js"], // Point to the file where routes are defined
};

const specs = swaggerJSDoc(options);

module.exports = { swaggerUi, specs };
