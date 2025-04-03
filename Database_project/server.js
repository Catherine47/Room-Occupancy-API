const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const { swaggerUi, specs } = require("./swagger");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

/**
 * @swagger
 * /sensor-readings:
 *   get:
 *     summary: Retrieve all sensor readings
 *     description: Fetch all records from the sensor_readings table with pagination.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: |
 *           The date for which sensor readings are requested (format: YYYY-MM-DD).
 *           Example: 2017-12-22
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page (default is 100).
 *     responses:
 *       200:
 *         description: A list of sensor readings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get("/sensor-readings", async (req, res) => {
  try {
    let { date, page, limit } = req.query;

    // Default values for pagination
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 100;
    const offset = (page - 1) * limit;

    // Build query based on the date parameter
    const query = "SELECT * FROM sensor_readings WHERE date = $1 ORDER BY time LIMIT $2 OFFSET $3";
    const values = date ? [date, limit, offset] : [null, limit, offset]; // Apply date filter if provided

    const result = await db.any(query, values);

    res.json(result);
  } catch (err) {
    console.error("Error retrieving sensor readings:", err);
    res.status(500).send("Error retrieving data");
  }
});

/**
 * @swagger
 * /sensor-readings/procedure:
 *   get:
 *     summary: Retrieve sensor readings by date using the stored procedure.
 *     description: Get sensor readings for a specific date.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date for which sensor readings are requested (format: YYYY-MM-DD). Example: 2017-12-22
 *     responses:
 *       200:
 *         description: A list of sensor readings for the specified date.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get("/sensor-readings/procedure", async (req, res) => {
  const { date } = req.query;  // Get the date from query parameters (format: YYYY-MM-DD)

  try {
    // Call the stored procedure 'get_sensor_readings_by_date'
    const result = await db.any(
      "SELECT * FROM get_sensor_readings_by_date($1)", [date]
    );

    // Return the result to the client
    res.json(result);
  } catch (err) {
    console.error("Error retrieving sensor readings:", err);
    res.status(500).send("Error retrieving data");
  }
});

/**
 * @swagger
 * /sensor-readings:
 *   post:
 *     summary: Add a new sensor reading
 *     description: Store a new sensor reading in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - temperature
 *               - humidity
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Successfully created.
 */
app.post("/sensor-readings", async (req, res) => {
  const { date, temperature, humidity } = req.body;
  try {
    await db.none(
      "INSERT INTO sensor_readings (date, temperature, humidity) VALUES ($1, $2, $3)",
      [date, temperature, humidity]
    );
    res.status(201).send("Sensor reading added successfully");
  } catch (err) {
    console.error("Error adding sensor reading:", err);
    res.status(500).send("Error adding data");
  }
});

/**
 * @swagger
 * /sensor-readings:
 *   put:
 *     summary: Update an existing sensor reading
 *     description: Modify an existing sensor reading by date, temperature, and humidity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - temperature
 *               - humidity
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully updated.
 */
app.put("/sensor-readings", async (req, res) => {
  const { date, temperature, humidity } = req.body;
  try {
    // Update based on date, temperature, and humidity
    await db.none(
      "UPDATE sensor_readings SET temperature=$1, humidity=$2 WHERE date=$3 AND temperature=$4 AND humidity=$5",
      [temperature, humidity, date, temperature, humidity]
    );
    res.send("Sensor reading updated successfully");
  } catch (err) {
    console.error("Error updating sensor reading:", err);
    res.status(500).send("Error updating data");
  }
});

/**
 * @swagger
 * /sensor-readings:
 *   delete:
 *     summary: Delete a sensor reading
 *     description: Remove a specific sensor reading based on date, temperature, and humidity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - temperature
 *               - humidity
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully deleted.
 */
app.delete("/sensor-readings", async (req, res) => {
  const { date, temperature, humidity } = req.body;
  try {
    // Delete the record based on date, temperature, and humidity
    await db.none(
      "DELETE FROM sensor_readings WHERE date=$1 AND temperature=$2 AND humidity=$3",
      [date, temperature, humidity]
    );
    res.send("Sensor reading deleted successfully");
  } catch (err) {
    console.error("Error deleting sensor reading:", err);
    res.status(500).send("Error deleting data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
