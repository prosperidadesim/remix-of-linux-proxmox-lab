const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mikrotik-study-secret-key-change-in-production';

// Inicializa o banco de dados
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Cria as tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS study_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_answered INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_incorrect INTEGER DEFAULT 0,
    questions_answered TEXT DEFAULT '[]',
    marked_for_review TEXT DEFAULT '[]',
    last_study_date INTEGER,
    streak INTEGER DEFAULT 0,
    category_progress TEXT DEFAULT '{}',
    certification_progress TEXT DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    selected_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    timestamp INTEGER NOT NULL,
    mode TEXT NOT NULL,
    exam_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    score REAL DEFAULT 0,
    answers TEXT DEFAULT '[]',
    mode TEXT NOT NULL,
    time_limit INTEGER,
    certification TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Cria admin padrão se não existir
const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (username, email, password, display_name, role) 
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', 'admin@local', hashedPassword, 'Administrador', 'admin');
  console.log('✓ Usuário admin criado (senha: admin123)');
}

app.use(cors());
app.use(express.json());

// Middleware de autenticação
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware de admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}

// ========== AUTENTICAÇÃO ==========

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }
  
  // Atualiza último login
  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, displayName: user.display_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    }
  });
});

// Registro (apenas admin pode criar usuários)
app.post('/api/auth/register', authenticate, requireAdmin, (req, res) => {
  const { username, email, password, displayName, role } = req.body;
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    const result = db.prepare(`
      INSERT INTO users (username, email, password, display_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, email, hashedPassword, displayName, role || 'user');
    
    // Cria progresso inicial
    db.prepare('INSERT INTO study_progress (user_id) VALUES (?)').run(result.lastInsertRowid);
    
    res.json({ success: true, userId: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Usuário ou email já existe' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// Alterar senha (próprio usuário)
app.put('/api/auth/password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
  }
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }
  
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);
  
  res.json({ success: true, message: 'Senha alterada com sucesso' });
});

// Verifica token
app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, username, email, display_name, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
  });
});

// ========== PROGRESSO ==========

// Buscar progresso do usuário
app.get('/api/progress', authenticate, (req, res) => {
  let progress = db.prepare('SELECT * FROM study_progress WHERE user_id = ?').get(req.user.id);
  
  if (!progress) {
    db.prepare('INSERT INTO study_progress (user_id) VALUES (?)').run(req.user.id);
    progress = db.prepare('SELECT * FROM study_progress WHERE user_id = ?').get(req.user.id);
  }
  
  res.json({
    totalAnswered: progress.total_answered,
    totalCorrect: progress.total_correct,
    totalIncorrect: progress.total_incorrect,
    questionsAnswered: JSON.parse(progress.questions_answered),
    markedForReview: JSON.parse(progress.marked_for_review),
    lastStudyDate: progress.last_study_date,
    streak: progress.streak,
    categoryProgress: JSON.parse(progress.category_progress),
    certificationProgress: JSON.parse(progress.certification_progress),
  });
});

// Salvar progresso
app.put('/api/progress', authenticate, (req, res) => {
  const { 
    totalAnswered, totalCorrect, totalIncorrect, questionsAnswered,
    markedForReview, lastStudyDate, streak, categoryProgress, certificationProgress 
  } = req.body;
  
  db.prepare(`
    UPDATE study_progress SET
      total_answered = ?,
      total_correct = ?,
      total_incorrect = ?,
      questions_answered = ?,
      marked_for_review = ?,
      last_study_date = ?,
      streak = ?,
      category_progress = ?,
      certification_progress = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    totalAnswered, totalCorrect, totalIncorrect,
    JSON.stringify(questionsAnswered), JSON.stringify(markedForReview),
    lastStudyDate, streak, JSON.stringify(categoryProgress),
    JSON.stringify(certificationProgress), req.user.id
  );
  
  res.json({ success: true });
});

// ========== RESPOSTAS ==========

// Buscar respostas do usuário
app.get('/api/answers', authenticate, (req, res) => {
  const answers = db.prepare(`
    SELECT question_id as questionId, selected_index as selectedIndex, 
           is_correct as isCorrect, timestamp, mode, exam_id as examId
    FROM user_answers WHERE user_id = ? ORDER BY timestamp ASC
  `).all(req.user.id);
  
  res.json(answers.map(a => ({ ...a, isCorrect: Boolean(a.isCorrect) })));
});

// Registrar resposta
app.post('/api/answers', authenticate, (req, res) => {
  const { questionId, selectedIndex, isCorrect, timestamp, mode, examId } = req.body;
  
  db.prepare(`
    INSERT INTO user_answers (user_id, question_id, selected_index, is_correct, timestamp, mode, exam_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, questionId, selectedIndex, isCorrect ? 1 : 0, timestamp, mode, examId || null);
  
  res.json({ success: true });
});

// ========== ADMIN - DASHBOARD ==========

// Listar todos os usuários (admin)
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.display_name, u.role, u.created_at, u.last_login,
           p.total_answered, p.total_correct, p.total_incorrect, p.streak
    FROM users u
    LEFT JOIN study_progress p ON u.id = p.user_id
    ORDER BY u.created_at DESC
  `).all();
  
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    displayName: u.display_name,
    role: u.role,
    createdAt: u.created_at,
    lastLogin: u.last_login,
    stats: {
      totalAnswered: u.total_answered || 0,
      totalCorrect: u.total_correct || 0,
      totalIncorrect: u.total_incorrect || 0,
      streak: u.streak || 0,
      accuracy: u.total_answered > 0 ? Math.round((u.total_correct / u.total_answered) * 100) : 0,
    }
  })));
});

// Buscar estatísticas detalhadas de um usuário (admin)
app.get('/api/admin/users/:id/stats', authenticate, requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const progress = db.prepare('SELECT * FROM study_progress WHERE user_id = ?').get(userId);
  const answers = db.prepare(`
    SELECT question_id as questionId, selected_index as selectedIndex, 
           is_correct as isCorrect, timestamp, mode
    FROM user_answers WHERE user_id = ? ORDER BY timestamp DESC
  `).all(userId);
  
  const exams = db.prepare('SELECT * FROM exams WHERE user_id = ? ORDER BY start_time DESC').all(userId);
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    },
    progress: progress ? {
      totalAnswered: progress.total_answered,
      totalCorrect: progress.total_correct,
      totalIncorrect: progress.total_incorrect,
      questionsAnswered: JSON.parse(progress.questions_answered),
      markedForReview: JSON.parse(progress.marked_for_review),
      lastStudyDate: progress.last_study_date,
      streak: progress.streak,
      categoryProgress: JSON.parse(progress.category_progress),
      certificationProgress: JSON.parse(progress.certification_progress),
    } : null,
    recentAnswers: answers.slice(0, 50).map(a => ({ ...a, isCorrect: Boolean(a.isCorrect) })),
    exams: exams.map(e => ({
      id: e.id,
      startTime: e.start_time,
      endTime: e.end_time,
      totalQuestions: e.total_questions,
      correctAnswers: e.correct_answers,
      score: e.score,
      mode: e.mode,
      certification: e.certification,
    })),
  });
});

// Estatísticas gerais (admin)
app.get('/api/admin/stats', authenticate, requireAdmin, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const activeUsers = db.prepare(`
    SELECT COUNT(*) as count FROM study_progress 
    WHERE last_study_date > ?
  `).get(Date.now() - 7 * 24 * 60 * 60 * 1000).count;
  
  const totalAnswers = db.prepare('SELECT COUNT(*) as count FROM user_answers').get().count;
  const correctAnswers = db.prepare('SELECT COUNT(*) as count FROM user_answers WHERE is_correct = 1').get().count;
  
  // Top 10 usuários por acertos
  const topUsers = db.prepare(`
    SELECT u.id, u.display_name, u.username, p.total_answered, p.total_correct, p.streak
    FROM users u
    JOIN study_progress p ON u.id = p.user_id
    WHERE p.total_answered > 0
    ORDER BY p.total_correct DESC
    LIMIT 10
  `).all();
  
  // Atividade por dia (últimos 7 dias)
  const now = Date.now();
  const dailyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
    const dayEnd = now - i * 24 * 60 * 60 * 1000;
    const count = db.prepare(`
      SELECT COUNT(*) as count FROM user_answers 
      WHERE timestamp >= ? AND timestamp < ?
    `).get(dayStart, dayEnd).count;
    
    const date = new Date(dayEnd);
    dailyActivity.push({
      date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      count,
    });
  }
  
  res.json({
    totalUsers,
    activeUsers,
    totalAnswers,
    correctAnswers,
    globalAccuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
    topUsers: topUsers.map(u => ({
      id: u.id,
      displayName: u.display_name,
      username: u.username,
      totalAnswered: u.total_answered,
      totalCorrect: u.total_correct,
      streak: u.streak,
      accuracy: u.total_answered > 0 ? Math.round((u.total_correct / u.total_answered) * 100) : 0,
    })),
    dailyActivity,
  });
});

// Deletar usuário (admin)
app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  if (userId == req.user.id) {
    return res.status(400).json({ error: 'Você não pode deletar a si mesmo' });
  }
  
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ success: true });
});

// Atualizar usuário (admin)
app.put('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
  const userId = req.params.id;
  const { displayName, role, password } = req.body;
  
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET display_name = ?, role = ?, password = ? WHERE id = ?')
      .run(displayName, role, hashedPassword, userId);
  } else {
    db.prepare('UPDATE users SET display_name = ?, role = ? WHERE id = ?')
      .run(displayName, role, userId);
  }
  
  res.json({ success: true });
});

// Resetar progresso de usuário (admin)
app.post('/api/admin/users/:id/reset', authenticate, requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  db.prepare(`
    UPDATE study_progress SET
      total_answered = 0, total_correct = 0, total_incorrect = 0,
      questions_answered = '[]', marked_for_review = '[]',
      streak = 0, category_progress = '{}', certification_progress = '{}'
    WHERE user_id = ?
  `).run(userId);
  
  db.prepare('DELETE FROM user_answers WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM exams WHERE user_id = ?').run(userId);
  
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║     MikroTik Study Lab - Backend Local             ║
╠════════════════════════════════════════════════════╣
║  Servidor rodando em: http://0.0.0.0:${PORT}          ║
║                                                    ║
║  Admin padrão:                                     ║
║    Usuário: admin                                  ║
║    Senha:   admin123                               ║
║                                                    ║
║  Banco de dados: database.sqlite                   ║
╚════════════════════════════════════════════════════╝
  `);
});
