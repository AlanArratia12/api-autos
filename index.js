const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Autos funcionando 🚗');
});

// Obtener todos los autos
app.get('/autos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM autos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener autos');
  }
});

// Agregar un auto
app.post('/autos', async (req, res) => {
  const { marca, modelo, anio, color, precio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO autos (marca, modelo, anio, color, precio) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [marca, modelo, anio, color, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar auto');
  }
});

// Actualizar auto completamente
app.put('/autos/:id', async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, anio, color, precio } = req.body;
  try {
    const result = await pool.query(
      'UPDATE autos SET marca=$1, modelo=$2, anio=$3, color=$4, precio=$5 WHERE id=$6 RETURNING *',
      [marca, modelo, anio, color, precio, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar auto');
  }
});

// Actualizar parcialmente auto
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

// Eliminar auto
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

