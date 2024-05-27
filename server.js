// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const GameScore = require('./models/GameScore');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para parsear JSON y datos de formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Ruta para guardar una nueva puntuación
app.post('/api/scores', async (req, res) => {
  try {
    const { initials, score } = req.body;
    const newScore = new GameScore({ initials, score });
    await newScore.save();
    res.json(newScore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Ruta para obtener todas las puntuaciones
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await GameScore.find().sort({ score: -1, date: 1 }).limit(10); // Ordena por score descendente y fecha ascendente
    res.json(scores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
