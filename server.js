const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Configuración de conexión a PostgreSQL ───────────────────────────────────
// Modificá estos valores según tu base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// ─── Ruta: agentes que cumplen años hoy ──────────────────────────────────────
app.get("/api/cumpleanos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM mapuche.dh01
      WHERE date_part('day',   fec_nacim) = date_part('day',   CURRENT_DATE)
        AND date_part('month', fec_nacim) = date_part('month', CURRENT_DATE) order by tipo_sexo DESC
    `);
    res.json({ success: true, agentes: result.rows });
  } catch (err) {
    console.error("Error consultando la BD:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});



// ─── Ruta: health check ───────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`)
);
