import { useState, useEffect } from "react";

// ─── Constantes ───────────────────────────────────────────────────────────────
const API_URL = "http://192.168.0.206:3001/api/cumpleanos";

const DIAS_ES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fechaHoy() {
  const d = new Date();
  return `${DIAS_ES[d.getDay()]} ${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function iniciales(nombre, apellido) {
  return `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();
}

function colorPorId(id) {
  const paleta = [
    ["#1a1a2e", "#e94560"],
    ["#0f3460", "#e94560"],
    ["#16213e", "#0f3460"],
    ["#533483", "#e94560"],
    ["#1b4332", "#52b788"],
    ["#6d2d92", "#f9c74f"],
  ];
  return paleta[id % paleta.length];
}

// ─── Partículas de confeti ────────────────────────────────────────────────────
function Confetti() {
  const piezas = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${3 + Math.random() * 4}s`,
    color: ["#ffd700","#ff6b6b","#4ecdc4","#45b7d1","#96ceb4","#ff9ff3","#54a0ff"][i % 7],
    size: `${6 + Math.random() * 8}px`,
  }));

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      {piezas.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `caer ${p.duration} ${p.delay} infinite linear`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Tarjeta de agente ────────────────────────────────────────────────────────
// Calcula la edad a partir de fec_nacim
function calcularEdad(fecNacim) {
  if (!fecNacim) return null;
  const hoy = new Date();
  const nac = new Date(fecNacim);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function TarjetaAgente({ agente, index }) {
  const [bg, accent] = colorPorId(agente.id ?? index);
  const delay = `${index * 0.15}s`;

  // Soporta variantes de nombre: nombre/apellido o nombre_completo o similar
  const nombre    = agente.desc_nombr    ?? agente.nom      ?? "";
  const apellido  = agente.desc_appat  ?? agente.apell    ?? "";
  const cargo     = agente.cargo     ?? agente.funcion  ?? agente.puesto ?? "";
  const depto     = agente.departamento ?? agente.depto ?? agente.area   ?? "";
  const fotoUrl   = agente.foto_url  ?? agente.foto     ?? null;
  const edad      = agente.edad      ?? calcularEdad(agente.fec_nacim);

  return (
    <div
      className="tarjeta"
      style={{
        "--bg": bg,
        "--accent": accent,
        animationDelay: delay,
      }}
    >
      {/* Avatar */}
      <div className="avatar-wrap">
        {fotoUrl ? (
          <img src={fotoUrl} alt={nombre} className="avatar-img" />
        ) : (
          <div className="avatar-iniciales" style={{ background: accent }}>
            {iniciales(nombre, apellido)}
          </div>
        )}
        <div className="badge-torta">🎂</div>
      </div>

      {/* Info */}
      <div className="info">
        <h2 className="nombre">{nombre} {apellido}</h2>
        {cargo && <p className="cargo">{cargo}</p>}
        {depto && <p className="depto">{depto}</p>}
        {edad  && <div className="edad-pill" style={{ background: accent }}>{edad} años</div>}
      </div>

      {/* Fondo decorativo */}
      <div className="deco-circle" style={{ borderColor: accent }} />
    </div>
  );
}

// ─── Pantalla vacía ───────────────────────────────────────────────────────────
function SinCumpleanos() {
  return (
    <div className="sin-cumple">
      <div className="sin-cumple-emoji">📅</div>
      <h2>Sin cumpleaños hoy</h2>
      <p>No hay agentes que cumplan años el día de hoy.</p>
    </div>
  );
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [agentes, setAgentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAgentes(data.agentes);
        else setError(data.error ?? "Error desconocido");
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const hayFestejo = agentes.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0d0d1a;
          min-height: 100vh;
          color: #f0f0f5;
        }

        @keyframes caer {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }

        @keyframes aparecer {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        @keyframes pulso {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }

        @keyframes girar {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Layout ── */
        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          padding: 2.5rem 1.5rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }

        /* ── Header ── */
        .header {
          text-align: center;
          max-width: 700px;
        }

        .logo-inst {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 999px;
          padding: 0.4rem 1.1rem;
          font-size: .8rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.7);
          margin-bottom: 1.5rem;
        }

        .titulo {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 6vw, 3.8rem);
          font-weight: 900;
          line-height: 1.1;
          background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #c678dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .subtitulo {
          font-size: 1rem;
          color: rgba(255,255,255,.5);
          letter-spacing: .03em;
        }

        .subtitulo span {
          color: rgba(255,255,255,.85);
          font-weight: 500;
        }

        /* ── Grid de tarjetas ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 360px));
          gap: 1.8rem;
          justify-content: center;
          width: 100%;
          max-width: 1200px;
        }

        /* ── Tarjeta ── */
        .tarjeta {
          position: relative;
          background: linear-gradient(145deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 70%, #1a1a3e) 100%);
          border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
          border-radius: 20px;
          padding: 2rem 1.8rem 1.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          overflow: hidden;
          animation: aparecer 0.6s ease both;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tarjeta:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,.5), 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent);
        }

        .deco-circle {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          border: 40px solid transparent;
          border-color: var(--accent);
          opacity: .05;
          bottom: -80px;
          right: -80px;
          pointer-events: none;
        }

        /* ── Avatar ── */
        .avatar-wrap {
          position: relative;
          width: 90px;
          height: 90px;
        }

        .avatar-img,
        .avatar-iniciales {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255,255,255,.15);
        }

        .badge-torta {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #ffd700;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          animation: pulso 1.8s ease-in-out infinite;
          box-shadow: 0 0 0 3px #0d0d1a;
        }

        /* ── Info ── */
        .info { text-align: center; display: flex; flex-direction: column; align-items: center; gap: .4rem; }

        .nombre {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }

        .cargo {
          font-size: .85rem;
          font-weight: 500;
          color: rgba(255,255,255,.75);
        }

        .depto {
          font-size: .78rem;
          color: rgba(255,255,255,.45);
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        .edad-pill {
          margin-top: .4rem;
          padding: .25rem .9rem;
          border-radius: 999px;
          font-size: .78rem;
          font-weight: 600;
          color: #000;
          letter-spacing: .04em;
        }

        /* ── Sin cumpleaños ── */
        .sin-cumple {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem 2rem;
          opacity: .7;
        }

        .sin-cumple-emoji { font-size: 4rem; }
        .sin-cumple h2 { font-family: 'Playfair Display', serif; font-size: 1.8rem; }
        .sin-cumple p  { color: rgba(255,255,255,.5); }

        /* ── Cargando ── */
        .spinner-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 5rem;
          color: rgba(255,255,255,.5);
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255,255,255,.1);
          border-top-color: #ffd700;
          border-radius: 50%;
          animation: girar 0.9s linear infinite;
        }

        /* ── Error ── */
        .error-box {
          background: rgba(233,69,96,.1);
          border: 1px solid rgba(233,69,96,.4);
          border-radius: 12px;
          padding: 1.5rem 2rem;
          text-align: center;
          max-width: 500px;
        }

        .error-box h3 { color: #e94560; margin-bottom: .5rem; }
        .error-box code { font-size: .8rem; color: rgba(255,255,255,.5); word-break: break-all; }

        /* ── Footer ── */
        .footer {
          color: rgba(255,255,255,.25);
          font-size: .75rem;
          text-align: center;
          letter-spacing: .05em;
        }
      `}</style>

      {hayFestejo && <Confetti />}

      <div className="page">
        {/* Encabezado */}
        <header className="header">
          <div className="logo-inst">Universidad Pedagógica Nacional</div>
          <p className="subtitulo">
            <span>{fechaHoy()}</span>
          </p>
          <h1 className="titulo">
            {hayFestejo ? "Hoy es el cumpleaños de…" : "Cumpleaños"}
          </h1>
       
        </header>

        {/* Contenido */}
        {cargando ? (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p>Consultando la base de datos…</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <h3>⚠️ Error de conexión</h3>
            <p>No se pudo obtener datos del servidor.</p>
            <code>{error}</code>
          </div>
        ) : agentes.length === 0 ? (
          <SinCumpleanos />
        ) : (
          <div className="grid">
            {agentes.map((a, i) => (
              <TarjetaAgente key={a.id ?? i} agente={a} index={i} />
            ))}
          </div>
        )}

        <footer className="footer">
          UNIPE
        </footer>
      </div>
    </>
  );
}
