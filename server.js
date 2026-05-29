const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

//const DOMINIOS_PERMITIDOS = (
//  process.env.FRONTEND_URL || "https://192.168.1.82"
//).split(",").map((d) => d.trim());
 
//const corsOptions = {
//  origin: (origin, callback) => {
    // Sin origin: Postman, curl, mismo servidor → permitir
//    if (!origin) return callback(null, true);
//    if (DOMINIOS_PERMITIDOS.includes(origin)) return callback(null, true);
//    callback(new Error(`CORS bloqueado para el origen: ${origin}`));
//  },
//  methods: ["GET", "OPTIONS"],
//  allowedHeaders: ["Content-Type"],
//  optionsSuccessStatus: 200,
//};

//app.options("*", cors(corsOptions));
//app.use(cors(corsOptions));



app.use(cors());
app.use(express.json());


// ─── Configuración de conexión a PostgreSQL ───────────────────────────────────
// Modificá estos valores según tu base de datos

const pool = new Pool({
  host: process.env.DB_HOST || process.env.IP_BASE,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || process.env.DB_NAME,
  user: process.env.DB_USER || process.env.USER_NAME,
  password: process.env.DB_PASSWORD || process.env.DB_PASSWORD,
});

// ─── Ruta: agentes que cumplen años hoy ──────────────────────────────────────
app.get("/api/cumpleanos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM mapuche.dh01
      WHERE date_part('day',   fec_nacim) = date_part('day',   2026-05-19)
        AND date_part('month', fec_nacim) = date_part('month', 2026-05-19)
    `);
    res.json({ success: true, agentes: result.rows });
  } catch (err) {
    console.error("Error consultando la BD:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Ruta: health check ───────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`)
);
