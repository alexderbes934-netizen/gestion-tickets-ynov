import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

if (!process.env.DATABASE_URL) {
  console.error('La variable DATABASE_URL est obligatoire.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase fournit une connexion TLS. En local, SSL n'est pas nécessaire.
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true);
    return callback(new Error('Origine non autorisée par la configuration CORS.'));
  },
}));
app.use(express.json({ limit: '20kb' }));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check database error:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/api/tickets', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, titre, description, statut, created_at FROM tickets ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('GET /api/tickets:', error.message);
    res.status(500).json({ error: 'Impossible de récupérer les tickets.' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const titre = typeof req.body?.titre === 'string' ? req.body.titre.trim() : '';
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (!titre || titre.length > 120) {
    return res.status(400).json({ error: 'Le titre est obligatoire et limité à 120 caractères.' });
  }
  if (!description || description.length > 2000) {
    return res.status(400).json({ error: 'La description est obligatoire et limitée à 2 000 caractères.' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO tickets (titre, description) VALUES ($1, $2)
       RETURNING id, titre, description, statut, created_at`, [titre, description]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('POST /api/tickets:', error.message);
    res.status(500).json({ error: 'Impossible de créer le ticket.' });
  }
});

app.patch('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body || {};
  const statuts = ['Ouvert', 'En cours', 'Résolu'];
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Identifiant de ticket invalide.' });
  }
  if (!statuts.includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide. Valeurs acceptées : Ouvert, En cours, Résolu.' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE tickets SET statut = $1 WHERE id = $2
       RETURNING id, titre, description, statut, created_at`, [statut, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Ticket introuvable.' });
    res.json(rows[0]);
  } catch (error) {
    console.error('PATCH /api/tickets/:id:', error.message);
    res.status(500).json({ error: 'Impossible de modifier le ticket.' });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Corps JSON invalide.' });
  }
  if (error.message?.startsWith('Origine non autorisée')) {
    return res.status(403).json({ error: 'Origine non autorisée.' });
  }
  console.error(error);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

const server = app.listen(port, '0.0.0.0', () => console.log(`API prête sur le port ${port}`));
async function shutdown() {
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
