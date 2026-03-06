const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./routes/auth.routes');
const terrenosRoutes = require("./routes/terrenos");
const adminRoutes = require('./routes/admin.routes');
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    credentials: true,              // 🔥 MUY IMPORTANTE
  })
);

app.use(cookieParser());


app.use((req, res, next) => {
  console.log("Petición recibida en backend:", req.method, req.url);
  next();
});

app.use('/api/auth', authRoutes);
app.use("/api/terrenos", terrenosRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'API funcionando',
      databaseTime: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});