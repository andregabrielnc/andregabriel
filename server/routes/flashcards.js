import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ─── FSRS helpers (replicados no servidor para calcular novos estados) ────────
const W = [0.4072,1.1829,3.1262,15.4722,7.2102,0.5316,1.0651,0.0589,1.5330,0.1544,1.0070,1.9395,0.1100,0.2900,2.2700,0.0000,2.9898];
const DECAY = -0.5, FACTOR = 19/81;
const clamp = (v,lo,hi) => Math.min(Math.max(v,lo),hi);
const retrievability = (t,S) => S > 0 ? (1 + FACTOR*t/S)**DECAY : 0;
const nextInterval = (S) => clamp(Math.round(S),1,36500);
const initStability = (r) => Math.max(W[r-1],0.1);
const initDifficulty = (r) => clamp(W[4]-Math.exp(W[5]*(r-1))+1,1,10);
const D0_4 = W[4] - Math.exp(W[5]*3) + 1;  // ≈ 3.28 — alvo correto da regressão à média
const nextDifficulty = (D,r) => clamp(W[7]*D0_4+(1-W[7])*(D-W[6]*(r-3)),1,10);
const recallStability = (D,S,R,r) => S*( Math.exp(W[8])*(11-D)*S**(-W[9])*(Math.exp((1-R)*W[10])-1)*(r===2?W[15]:1)*(r===4?W[16]:1)+1 );
const forgetStability = (D,S,R) => W[11]*D**(-W[12])*((S+1)**W[13]-1)*Math.exp((1-R)*W[14]);

function computeNextState(card, rating) {
  const { state='new', stability=0.1, difficulty=W[4], elapsed_days=0, lapses=0 } = card;
  const S = Math.max(stability,0.1), D = clamp(difficulty,1,10);
  const R = state==='new' ? 1 : retrievability(elapsed_days,S);

  if (state === 'new') {
    const newS=initStability(rating), newD=initDifficulty(rating);
    if (rating===1) return { state:'learning',  stability:newS, difficulty:newD, interval:1/1440,   scheduled_days:0, lapses };
    if (rating===2) return { state:'learning',  stability:newS, difficulty:newD, interval:5/1440,   scheduled_days:0, lapses };
    if (rating===3) { const i=nextInterval(newS);   return { state:'review', stability:newS,       difficulty:newD, interval:i,     scheduled_days:i, lapses }; }
    const bS=newS*(W[16]||1.3), i=nextInterval(bS);
    return { state:'review', stability:bS, difficulty:newD, interval:i, scheduled_days:i, lapses };
  }

  if (state==='learning'||state==='relearning') {
    const newD=nextDifficulty(D,rating), newS=initStability(rating);
    if (rating===1) return { state, stability:newS, difficulty:newD, interval:1/1440,  scheduled_days:0, lapses };
    if (rating===2) return { state, stability:newS, difficulty:newD, interval:10/1440, scheduled_days:0, lapses };
    const i=nextInterval(newS);
    return { state:'review', stability:newS, difficulty:newD, interval:i, scheduled_days:i, lapses };
  }

  // review
  const newD=nextDifficulty(D,rating);
  if (rating===1) {
    const newS=Math.max(forgetStability(newD,S,R),0.1);
    return { state:'relearning', stability:newS, difficulty:newD, interval:10/1440, scheduled_days:0, lapses:lapses+1 };
  }
  const newS=recallStability(newD,S,R,rating), i=nextInterval(newS);
  return { state:'review', stability:newS, difficulty:newD, interval:i, scheduled_days:i, lapses };
}

// ─── DECKS ────────────────────────────────────────────────────────────────────

// GET /api/decks — lista decks com estatísticas por sessão
router.get('/decks', async (req, res) => {
  const { session_id } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        d.*,
        COUNT(c.id)::int                                          AS total_cards,
        COUNT(cs.id) FILTER (WHERE cs.state = 'new')::int        AS learning_new,
        COUNT(cs.id) FILTER (WHERE cs.due <= NOW() AND cs.state IN ('learning','relearning'))::int AS due_learning,
        COUNT(cs.id) FILTER (WHERE cs.due <= NOW() AND cs.state = 'review')::int                   AS due_review,
        COUNT(cs.id) FILTER (WHERE cs.due < DATE_TRUNC('day', NOW()) AND cs.state = 'review')::int AS overdue,
        COUNT(c.id) FILTER (WHERE cs.id IS NULL)::int            AS unseen
      FROM decks d
      LEFT JOIN cards c ON c.deck_id = d.id AND c.active = TRUE
      LEFT JOIN card_states cs ON cs.card_id = c.id AND cs.session_id = $1
      GROUP BY d.id
      ORDER BY d.parent_id NULLS FIRST, d.name
    `, [session_id || '']);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/decks
router.post('/decks', async (req, res) => {
  const { name, description, discipline, icon, parent_id } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO decks (name, description, discipline, icon, parent_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description||'', discipline||'', icon||'layers', parent_id||null]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/decks/:id
router.put('/decks/:id', async (req, res) => {
  const { name, description, discipline, icon, parent_id } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE decks SET name=$1, description=$2, discipline=$3, icon=$4, parent_id=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, description||'', discipline||'', icon||'layers', parent_id||null, req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/decks/:id
router.delete('/decks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM decks WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── CARDS ────────────────────────────────────────────────────────────────────

// GET /api/decks/:id/cards
router.get('/decks/:id/cards', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM cards WHERE deck_id=$1 AND active=TRUE ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/cards
router.post('/cards', async (req, res) => {
  const { deck_id, front, back, hint, tags } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO cards (deck_id,front,back,hint,tags) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [deck_id, front, back, hint||'', tags||[]]
    );
    await pool.query('UPDATE decks SET card_count=(SELECT COUNT(*) FROM cards WHERE deck_id=$1 AND active=TRUE) WHERE id=$1',[deck_id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/cards/:id
router.put('/cards/:id', async (req, res) => {
  const { front, back, hint, tags } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE cards SET front=$1,back=$2,hint=$3,tags=$4,updated_at=NOW() WHERE id=$5 RETURNING *',
      [front, back, hint||'', tags||[], req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/cards/:id
router.delete('/cards/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('UPDATE cards SET active=FALSE WHERE id=$1 RETURNING deck_id',[req.params.id]);
    if (rows[0]) await pool.query('UPDATE decks SET card_count=(SELECT COUNT(*) FROM cards WHERE deck_id=$1 AND active=TRUE) WHERE id=$1',[rows[0].deck_id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ESTUDO ───────────────────────────────────────────────────────────────────

// GET /api/study/:deckId?session_id=xxx — retorna fila de estudo
router.get('/study/:deckId', async (req, res) => {
  const { session_id } = req.query;
  const { deckId } = req.params;
  try {
    // Relearning + Learning vencidos primeiro, depois review vencido, depois novos
    const { rows } = await pool.query(`
      SELECT c.*, cs.state, cs.stability, cs.difficulty, cs.ease_factor,
             cs.interval_days, cs.reps, cs.lapses, cs.due, cs.last_review,
             cs.elapsed_days, cs.scheduled_days,
             EXTRACT(EPOCH FROM (NOW() - COALESCE(cs.last_review, NOW()))) / 86400 AS days_since_review
      FROM cards c
      LEFT JOIN card_states cs ON cs.card_id = c.id AND cs.session_id = $1
      WHERE c.deck_id = $2 AND c.active = TRUE
        AND (cs.id IS NULL OR cs.due <= NOW())
      ORDER BY
        CASE COALESCE(cs.state,'new')
          WHEN 'relearning' THEN 1
          WHEN 'learning'   THEN 2
          WHEN 'review'     THEN 3
          ELSE 4
        END,
        cs.due ASC NULLS LAST
      LIMIT 50
    `, [session_id, deckId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/review — submete avaliação FSRS
router.post('/review', async (req, res) => {
  const { card_id, session_id, rating, elapsed_days } = req.body;
  // elapsed_days do cliente = tempo de resposta (segundos → dias); usado só para logging
  const responseTimeDays = Math.max(0, parseFloat(elapsed_days) || 0);

  try {
    // Busca estado atual
    const { rows: stateRows } = await pool.query(
      'SELECT * FROM card_states WHERE card_id=$1 AND session_id=$2',
      [card_id, session_id]
    );
    const current = stateRows[0] || { state:'new', stability:0.1, difficulty:7.2102, elapsed_days:0, lapses:0, reps:0 };

    // Garante que state nulo (card nunca visto) seja tratado como 'new'
    if (!current.state || current.state === 'null') current.state = 'new';

    // ── Bug Fix: elapsed_days para FSRS deve ser dias desde a última revisão,
    //    não o tempo de sessão. Calculamos a partir do timestamp do BD.
    const daysSinceReview = current.last_review
      ? Math.max(0, (Date.now() - new Date(current.last_review).getTime()) / 86400000)
      : 0;

    // Calcula próximo estado FSRS com elapsed_days correto
    const next = computeNextState({ ...current, elapsed_days: daysSinceReview }, rating);

    // Próxima data de revisão (interval está em dias, pode ser fração)
    const dueDate = new Date(Date.now() + next.interval * 24 * 60 * 60 * 1000);

    // Upsert card_state
    await pool.query(`
      INSERT INTO card_states (card_id, session_id, state, stability, difficulty, ease_factor,
        interval_days, reps, lapses, due, last_review, elapsed_days, scheduled_days)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),$11,$12)
      ON CONFLICT (card_id, session_id) DO UPDATE SET
        state=$3, stability=$4, difficulty=$5, ease_factor=$6,
        interval_days=$7, reps=card_states.reps+1, lapses=$9,
        due=$10, last_review=NOW(), elapsed_days=$11, scheduled_days=$12, updated_at=NOW()
    `, [
      card_id, session_id, next.state, next.stability, next.difficulty,
      next.stability,
      next.scheduled_days,
      (current.reps || 0) + 1,
      next.lapses,
      dueDate,
      daysSinceReview,   // elapsed_days no card_state = dias reais desde última revisão
      next.scheduled_days,
    ]);

    // Log da revisão
    await pool.query(`
      INSERT INTO review_logs (card_id, session_id, rating, state_before, state_after, elapsed_days, scheduled_days, ease_factor)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `, [card_id, session_id, rating, current.state, next.state, responseTimeDays, next.scheduled_days, next.stability]);

    res.json({ ok: true, next });
  } catch (e) {
    console.error('[review] ERROR:', e.message, { card_id, session_id, rating, elapsed_days });
    res.status(500).json({ error: e.message });
  }
});

// ─── ESTATÍSTICAS ─────────────────────────────────────────────────────────────

router.get('/stats/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [retention, heatmap, forecast, counts, trueRetention] = await Promise.all([
      // Taxa de retenção + tempo médio por card
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE rating >= 2)::float / NULLIF(COUNT(*),0) AS retention,
          COUNT(*) AS total_reviews,
          COUNT(*) FILTER (WHERE rating = 1)::int AS lapses,
          AVG(elapsed_days) * 86400 AS avg_seconds_per_card
        FROM review_logs WHERE session_id=$1
      `, [sessionId]),

      // Heatmap: revisões por dia (últimos 365 dias)
      pool.query(`
        SELECT DATE(reviewed_at) AS day, COUNT(*)::int AS count
        FROM review_logs
        WHERE session_id=$1 AND reviewed_at >= NOW() - INTERVAL '365 days'
        GROUP BY DATE(reviewed_at)
        ORDER BY day
      `, [sessionId]),

      // Previsão: cards vencendo nos próximos 30 dias
      pool.query(`
        SELECT DATE(due) AS day, COUNT(*)::int AS count
        FROM card_states
        WHERE session_id=$1 AND due BETWEEN NOW() AND NOW() + INTERVAL '30 days'
        GROUP BY DATE(due)
        ORDER BY day
      `, [sessionId]),

      // Contagens gerais
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE state='new')::int           AS total_new,
          COUNT(*) FILTER (WHERE state='learning')::int      AS total_learning,
          COUNT(*) FILTER (WHERE state='review')::int        AS total_review,
          COUNT(*) FILTER (WHERE state='relearning')::int    AS total_relearning,
          AVG(stability)::float                              AS avg_stability
        FROM card_states WHERE session_id=$1
      `, [sessionId]),

      // True Retention: maturos (state_before='review') vs jovens (learning/relearning)
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE state_before='review')::int                              AS mature_total,
          COUNT(*) FILTER (WHERE state_before='review' AND rating >= 2)::int              AS mature_pass,
          COUNT(*) FILTER (WHERE state_before IN ('learning','relearning'))::int          AS young_total,
          COUNT(*) FILTER (WHERE state_before IN ('learning','relearning') AND rating>=2)::int AS young_pass
        FROM review_logs WHERE session_id=$1
      `, [sessionId]),
    ]);

    res.json({
      retention:     retention.rows[0],
      heatmap:       heatmap.rows,
      forecast:      forecast.rows,
      counts:        counts.rows[0],
      trueRetention: trueRetention.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── IMAGE OCCLUSION ──────────────────────────────────────────────────────────

// GET /api/occlusion/:id
router.get('/occlusion/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM occlusion_notes WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/occlusion — cria nota + cards
router.post('/occlusion', async (req, res) => {
  const { deck_id, image_data, shapes, mode, header, footer, remarks, sources } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [note] } = await client.query(
      'INSERT INTO occlusion_notes (deck_id, image_data, shapes, mode, header, footer, remarks, sources) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [deck_id, image_data, JSON.stringify(shapes), mode || 'hide_all', header || '', footer || '', remarks || '', sources || '']
    );
    const cardIds = [];
    for (let i = 0; i < shapes.length; i++) {
      const label = shapes[i].label || `${i + 1}`;
      const { rows: [card] } = await client.query(
        'INSERT INTO cards (deck_id, front, back, occlusion_note_id, shape_index) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [deck_id, `[occlusion:${note.id}:${i}]`, label, note.id, i]
      );
      cardIds.push(card.id);
    }
    await client.query('UPDATE decks SET card_count=(SELECT COUNT(*) FROM cards WHERE deck_id=$1 AND active=TRUE) WHERE id=$1', [deck_id]);
    await client.query('COMMIT');
    res.json({ note, card_count: cardIds.length });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

// PUT /api/occlusion/:id — atualiza nota + recria cards
router.put('/occlusion/:id', async (req, res) => {
  const { image_data, shapes, mode, header, footer, remarks, sources } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [note] } = await client.query(
      'UPDATE occlusion_notes SET image_data=$1, shapes=$2, mode=$3, header=$4, footer=$5, remarks=$6, sources=$7 WHERE id=$8 RETURNING *',
      [image_data, JSON.stringify(shapes), mode || 'hide_all', header || '', footer || '', remarks || '', sources || '', req.params.id]
    );
    // Remove old cards e recria
    await client.query('DELETE FROM cards WHERE occlusion_note_id=$1', [req.params.id]);
    for (let i = 0; i < shapes.length; i++) {
      const label = shapes[i].label || `${i + 1}`;
      await client.query(
        'INSERT INTO cards (deck_id, front, back, occlusion_note_id, shape_index) VALUES ($1,$2,$3,$4,$5)',
        [note.deck_id, `[occlusion:${note.id}:${i}]`, label, note.id, i]
      );
    }
    await client.query('UPDATE decks SET card_count=(SELECT COUNT(*) FROM cards WHERE deck_id=$1 AND active=TRUE) WHERE id=$1', [note.deck_id]);
    await client.query('COMMIT');
    res.json({ note, card_count: shapes.length });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

export default router;
