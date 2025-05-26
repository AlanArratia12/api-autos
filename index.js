const { swaggerUi, specs } = require('./swagger');
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página de inicio
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida
 */
app.get('/', (req, res) => {
  res.send('API de Autos funcionando 🚗');
});

/**
 * @swagger
 * /autos:
 *   get:
 *     summary: Obtener todos los autos
 *     responses:
 *       200:
 *         description: Lista de autos
 */
app.get('/autos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM autos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener autos');
  }
});

/**
 * @swagger
 * /autos/{id}:
 *   get:
 *     summary: Obtener un auto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Auto encontrado
 *       404:
 *         description: Auto no encontrado
 */
app.get('/autos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM autos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Auto no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el auto');
  }
});

/**
 * @swagger
 * /autos:
 *   post:
 *     summary: Agregar un auto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               anio:
 *                 type: integer
 *               color:
 *                 type: string
 *               precio:
 *                 type: number
 *               imagen:
 *                 type: string
 *     responses:
 *       201:
 *         description: Auto creado
 */
app.post('/autos', async (req, res) => {
  const { marca, modelo, anio, color, precio, imagen } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO autos (marca, modelo, anio, color, precio, imagen) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [marca, modelo, anio, color, precio, imagen]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar auto');
  }
});

/**
 * @swagger
 * /autos/{id}:
 *   put:
 *     summary: Actualizar completamente un auto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               anio:
 *                 type: integer
 *               color:
 *                 type: string
 *               precio:
 *                 type: number
 *               imagen:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auto actualizado
 */
app.put('/autos/:id', async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, anio, color, precio, imagen } = req.body;
  try {
    const result = await pool.query(
      'UPDATE autos SET marca=$1, modelo=$2, anio=$3, color=$4, precio=$5, imagen=$6 WHERE id=$7 RETURNING *',
      [marca, modelo, anio, color, precio, imagen, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar auto');
  }
});

/**
 * @swagger
 * /autos/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un auto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Auto parcialmente actualizado
 */
app.patch('/autos/:id', async (req, res) => {
  const { id } = req.params;
  const campos = Object.keys(req.body);
  const valores = Object.values(req.body);

  const setClause = campos.map((campo, i) => `${campo}=$${i + 1}`).join(', ');
  const query = `UPDATE autos SET ${setClause} WHERE id=$${campos.length + 1} RETURNING *`;

  try {
    const result = await pool.query(query, [...valores, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al aplicar cambios parciales');
  }
});

/**
 * @swagger
 * /autos/{id}:
 *   delete:
 *     summary: Eliminar un auto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Auto eliminado
 */
app.delete('/autos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM autos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar auto');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
