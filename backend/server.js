const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Conditional imports for optional modules
let WebSocket, multer;
try { WebSocket = require('ws'); } catch (e) { console.log('⚠ ws not installed, terminal disabled'); }
try { multer = require('multer'); } catch (e) { console.log('⚠ multer not installed, uploads disabled'); }

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'infra-study-secret-key-change-in-production';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Upload/Storage config
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '500');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'storage', 'uploads');

// Search providers
const SEARXNG_URL = process.env.SEARXNG_URL || '';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('✓ Diretório de uploads criado:', UPLOAD_DIR);
}

// Configure multer if available
let upload = null;
if (multer) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50);
      cb(null, `${uniqueSuffix}-${safeName}`);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use PDF, MP4 ou WebM.'), false);
    }
  };
  
  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }
  });
}

// SMTP configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Infra Study Lab <noreply@local>';

let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  console.log('✓ Email configurado via SMTP');
} else {
  console.log('⚠ Email não configurado (defina SMTP_USER e SMTP_PASS)');
}

let db = null;

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

setInterval(saveDatabase, 30000);

process.on('SIGINT', () => {
  console.log('\n💾 Salvando banco de dados...');
  saveDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveDatabase();
  process.exit(0);
});

// Inicializa o servidor
async function startServer() {
  // Inicializa SQL.js
  const SQL = await initSqlJs();
  
  // Carrega banco existente ou cria novo
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✓ Banco de dados carregado');
  } else {
    db = new SQL.Database();
    console.log('✓ Novo banco de dados criado');
  }

  // Cria as tabelas se não existirem
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  db.run(`
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
    )
  `);

  db.run(`
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
    )
  `);

  db.run(`
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
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ========== NOVAS TABELAS: CONTENT HUB ==========
  db.run(`
    CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('pdf', 'video')),
      track TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      level TEXT DEFAULT 'iniciante' CHECK(level IN ('iniciante', 'intermediario', 'avancado')),
      status TEXT DEFAULT 'rascunho' CHECK(status IN ('rascunho', 'publicado')),
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      pages INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS content_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content_id INTEGER NOT NULL,
      status TEXT DEFAULT 'em_andamento' CHECK(status IN ('em_andamento', 'concluido')),
      last_position INTEGER DEFAULT 0,
      completed_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
      UNIQUE(user_id, content_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS terminal_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT NOT NULL UNIQUE,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      commands_count INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS search_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_hash TEXT NOT NULL UNIQUE,
      query TEXT NOT NULL,
      results TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at INTEGER NOT NULL
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_contents_track ON contents(track)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_content_progress_user ON content_progress(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_search_cache_hash ON search_cache(query_hash)`);

  // Cria admin padrão se não existir
  const adminResult = db.exec("SELECT id FROM users WHERE role = 'admin'");
  if (adminResult.length === 0 || adminResult[0].values.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      `INSERT INTO users (username, email, password, display_name, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@local', hashedPassword, 'Administrador', 'admin']
    );
    saveDatabase();
    console.log('✓ Usuário admin criado (senha: admin123)');
  }

  app.use(cors());
  app.use(express.json());

  // Helper para executar queries com retorno de resultados
  function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  function queryOne(sql, params = []) {
    const results = queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  function runQuery(sql, params = []) {
    db.run(sql, params);
    saveDatabase();
    return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
  }

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
    
    const user = queryOne('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Atualiza último login
    runQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    
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
      const result = runQuery(
        `INSERT INTO users (username, email, password, display_name, role) VALUES (?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, displayName, role || 'user']
      );
      
      // Cria progresso inicial
      runQuery('INSERT INTO study_progress (user_id) VALUES (?)', [result.lastInsertRowid]);
      
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
    
    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    runQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ success: true, message: 'Senha alterada com sucesso' });
  });

  // Solicitar recuperação de senha
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    
    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) {
      return res.json({ success: true, message: 'Se o email existir, você receberá instruções' });
    }
    
    // Gera token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora
    
    // Invalida tokens anteriores
    runQuery('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [user.id]);
    
    // Salva novo token
    runQuery(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [user.id, token, expiresAt]
    );
    
    const resetLink = `${APP_URL}/reset-password?token=${token}`;
    
    // Tenta enviar email se configurado
    if (transporter) {
      try {
        await transporter.sendMail({
          from: SMTP_FROM,
          to: user.email,
          subject: 'Recuperação de Senha - Infra Study Lab',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #E57000;">Recuperação de Senha</h2>
              <p>Olá <strong>${user.display_name}</strong>,</p>
              <p>Recebemos uma solicitação para redefinir sua senha no Infra Study Lab.</p>
              <p>Clique no botão abaixo para criar uma nova senha:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #E57000; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Redefinir Senha
                </a>
              </p>
              <p>Ou copie e cole este link no navegador:</p>
              <p style="background: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">
                ${resetLink}
              </p>
              <p><strong>Este link expira em 1 hora.</strong></p>
              <p>Se você não solicitou esta recuperação, ignore este email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #888; font-size: 12px;">Infra Study Lab - Linux + Proxmox</p>
            </div>
          `,
        });
        console.log(`✓ Email de recuperação enviado para ${user.email}`);
      } catch (err) {
        console.error('Erro ao enviar email:', err.message);
        return res.json({ 
          success: true, 
          message: 'Email não pôde ser enviado. Use o link manual.',
          resetLink: resetLink,
          warning: 'Configure SMTP para envio de emails'
        });
      }
    } else {
      console.log(`⚠ SMTP não configurado. Link de reset: ${resetLink}`);
      return res.json({ 
        success: true, 
        message: 'Email não configurado. Use o link abaixo.',
        resetLink: resetLink,
        warning: 'Configure SMTP_USER e SMTP_PASS para envio de emails'
      });
    }
    
    res.json({ success: true, message: 'Email de recuperação enviado' });
  });

  // Validar token de reset
  app.get('/api/auth/reset-password/:token', (req, res) => {
    const { token } = req.params;
    
    const resetToken = queryOne(
      `SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?`,
      [token, Date.now()]
    );
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    const user = queryOne('SELECT display_name, email FROM users WHERE id = ?', [resetToken.user_id]);
    
    res.json({ 
      valid: true, 
      displayName: user?.display_name,
      email: user?.email 
    });
  });

  // Redefinir senha com token
  app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }
    
    const resetToken = queryOne(
      `SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?`,
      [token, Date.now()]
    );
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    // Atualiza senha
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    runQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetToken.user_id]);
    
    // Marca token como usado
    runQuery('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetToken.id]);
    
    res.json({ success: true, message: 'Senha alterada com sucesso' });
  });

  // Verifica token
  app.get('/api/auth/me', authenticate, (req, res) => {
    const user = queryOne('SELECT id, username, email, display_name, role FROM users WHERE id = ?', [req.user.id]);
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
    let progress = queryOne('SELECT * FROM study_progress WHERE user_id = ?', [req.user.id]);
    
    if (!progress) {
      runQuery('INSERT INTO study_progress (user_id) VALUES (?)', [req.user.id]);
      progress = queryOne('SELECT * FROM study_progress WHERE user_id = ?', [req.user.id]);
    }
    
    res.json({
      totalAnswered: progress.total_answered,
      totalCorrect: progress.total_correct,
      totalIncorrect: progress.total_incorrect,
      questionsAnswered: JSON.parse(progress.questions_answered || '[]'),
      markedForReview: JSON.parse(progress.marked_for_review || '[]'),
      lastStudyDate: progress.last_study_date,
      streak: progress.streak,
      categoryProgress: JSON.parse(progress.category_progress || '{}'),
      certificationProgress: JSON.parse(progress.certification_progress || '{}'),
    });
  });

  // Salvar progresso
  app.put('/api/progress', authenticate, (req, res) => {
    const { 
      totalAnswered, totalCorrect, totalIncorrect, questionsAnswered,
      markedForReview, lastStudyDate, streak, categoryProgress, certificationProgress 
    } = req.body;
    
    runQuery(`
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
    `, [
      totalAnswered, totalCorrect, totalIncorrect,
      JSON.stringify(questionsAnswered), JSON.stringify(markedForReview),
      lastStudyDate, streak, JSON.stringify(categoryProgress),
      JSON.stringify(certificationProgress), req.user.id
    ]);
    
    res.json({ success: true });
  });

  // ========== RESPOSTAS ==========

  // Buscar respostas do usuário
  app.get('/api/answers', authenticate, (req, res) => {
    const answers = queryAll(`
      SELECT question_id as questionId, selected_index as selectedIndex, 
             is_correct as isCorrect, timestamp, mode, exam_id as examId
      FROM user_answers WHERE user_id = ? ORDER BY timestamp ASC
    `, [req.user.id]);
    
    res.json(answers.map(a => ({ ...a, isCorrect: Boolean(a.isCorrect) })));
  });

  // Registrar resposta
  app.post('/api/answers', authenticate, (req, res) => {
    const { questionId, selectedIndex, isCorrect, timestamp, mode, examId } = req.body;
    
    runQuery(`
      INSERT INTO user_answers (user_id, question_id, selected_index, is_correct, timestamp, mode, exam_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, questionId, selectedIndex, isCorrect ? 1 : 0, timestamp, mode, examId || null]);
    
    res.json({ success: true });
  });

  // ========== ADMIN - DASHBOARD ==========

  // Listar todos os usuários (admin)
  app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
    const users = queryAll(`
      SELECT u.id, u.username, u.email, u.display_name, u.role, u.created_at, u.last_login,
             p.total_answered, p.total_correct, p.total_incorrect, p.streak
      FROM users u
      LEFT JOIN study_progress p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);
    
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
    
    const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const progress = queryOne('SELECT * FROM study_progress WHERE user_id = ?', [userId]);
    const answers = queryAll(`
      SELECT question_id, selected_index, is_correct, timestamp, mode
      FROM user_answers WHERE user_id = ? ORDER BY timestamp DESC
    `, [userId]);
    
    // Estatísticas por dia (últimos 7 dias)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentAnswers = answers.filter(a => a.timestamp > sevenDaysAgo);
    
    const dailyStats = {};
    recentAnswers.forEach(a => {
      const day = new Date(a.timestamp).toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { total: 0, correct: 0 };
      }
      dailyStats[day].total++;
      if (a.is_correct) dailyStats[day].correct++;
    });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      progress: progress ? {
        totalAnswered: progress.total_answered,
        totalCorrect: progress.total_correct,
        totalIncorrect: progress.total_incorrect,
        streak: progress.streak,
        categoryProgress: JSON.parse(progress.category_progress || '{}'),
        certificationProgress: JSON.parse(progress.certification_progress || '{}'),
      } : null,
      recentAnswers: answers.slice(0, 50),
      dailyStats,
    });
  });

  // Estatísticas gerais (admin)
  app.get('/api/admin/stats', authenticate, requireAdmin, (req, res) => {
    const totalUsersRow = queryOne('SELECT COUNT(*) as count FROM users');

    // Usuários ativos nos últimos 7 dias
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeUsersRow = queryOne(
      `SELECT COUNT(DISTINCT user_id) as count FROM user_answers WHERE timestamp > ?`,
      [sevenDaysAgo]
    );

    const totalAnswersRow = queryOne('SELECT COUNT(*) as count FROM user_answers');
    const correctAnswersRow = queryOne('SELECT COUNT(*) as count FROM user_answers WHERE is_correct = 1');

    const totalUsers = Number(totalUsersRow?.count || 0);
    const activeUsers = Number(activeUsersRow?.count || 0);
    const totalAnswers = Number(totalAnswersRow?.count || 0);
    const correctAnswers = Number(correctAnswersRow?.count || 0);

    const globalAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Atividade por dia (últimos 7 dias) — array no formato esperado pelo frontend
    const recentActivity = queryAll(`SELECT timestamp FROM user_answers WHERE timestamp > ?`, [sevenDaysAgo]);
    const dailyMap = new Map();

    // Inicializa todos os dias para evitar buracos no gráfico
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const day = d.toISOString().split('T')[0];
      dailyMap.set(day, 0);
    }

    recentActivity.forEach(a => {
      const day = new Date(a.timestamp).toISOString().split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    });

    const dailyActivity = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    // Top usuários (por total de acertos)
    const topUsersRows = queryAll(`
      SELECT u.id, u.username, u.display_name,
             COALESCE(p.total_answered, 0) as total_answered,
             COALESCE(p.total_correct, 0) as total_correct,
             COALESCE(p.total_incorrect, 0) as total_incorrect,
             COALESCE(p.streak, 0) as streak
      FROM users u
      LEFT JOIN study_progress p ON u.id = p.user_id
      ORDER BY total_correct DESC, total_answered DESC
      LIMIT 10
    `);

    const topUsers = topUsersRows.map(u => ({
      id: u.id,
      displayName: u.display_name,
      username: u.username,
      totalAnswered: u.total_answered || 0,
      totalCorrect: u.total_correct || 0,
      streak: u.streak || 0,
      accuracy: u.total_answered > 0 ? Math.round((u.total_correct / u.total_answered) * 100) : 0,
    }));

    res.json({
      totalUsers,
      activeUsers,
      totalAnswers,
      correctAnswers,
      globalAccuracy,
      topUsers,
      dailyActivity,
    });
  });

  // Deletar usuário (admin)
  app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    // Não permite deletar a si mesmo
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível deletar a si mesmo' });
    }
    
    const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Deleta dados relacionados
    runQuery('DELETE FROM user_answers WHERE user_id = ?', [userId]);
    runQuery('DELETE FROM study_progress WHERE user_id = ?', [userId]);
    runQuery('DELETE FROM exams WHERE user_id = ?', [userId]);
    runQuery('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
    runQuery('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true });
  });

  // Atualizar usuário (admin)
  app.put('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
    const userId = req.params.id;
    const { displayName, email, role, password } = req.body;
    
    const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Atualiza campos
    if (displayName) {
      runQuery('UPDATE users SET display_name = ? WHERE id = ?', [displayName, userId]);
    }
    if (email) {
      runQuery('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
    }
    if (role && ['admin', 'user'].includes(role)) {
      runQuery('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    }
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      runQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    }
    
    res.json({ success: true });
  });

  // Resetar progresso de um usuário (admin)
  app.post('/api/admin/users/:id/reset', authenticate, requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Reseta progresso
    runQuery(`
      UPDATE study_progress SET
        total_answered = 0,
        total_correct = 0,
        total_incorrect = 0,
        questions_answered = '[]',
        marked_for_review = '[]',
        last_study_date = NULL,
        streak = 0,
        category_progress = '{}',
        certification_progress = '{}',
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [userId]);
    
    // Deleta respostas e simulados
    runQuery('DELETE FROM user_answers WHERE user_id = ?', [userId]);
    runQuery('DELETE FROM exams WHERE user_id = ?', [userId]);
    
    res.json({ success: true });
  });

  // ========== CONTENT HUB API ==========

  // List contents (public - only published for regular users)
  app.get('/api/contents', authenticate, (req, res) => {
    const { track, type, status, search } = req.query;
    const isAdmin = req.user.role === 'admin';
    
    let sql = `SELECT * FROM contents WHERE 1=1`;
    const params = [];
    
    // Non-admins only see published content
    if (!isAdmin) {
      sql += ` AND status = 'publicado'`;
    } else if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    
    if (track) {
      sql += ` AND track = ?`;
      params.push(track);
    }
    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }
    if (search) {
      sql += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ` ORDER BY featured DESC, sort_order ASC, created_at DESC`;
    
    const contents = queryAll(sql, params);
    res.json(contents.map(c => ({
      ...c,
      tags: JSON.parse(c.tags || '[]'),
      featured: Boolean(c.featured)
    })));
  });

  // Get single content
  app.get('/api/contents/:id', authenticate, (req, res) => {
    const content = queryOne('SELECT * FROM contents WHERE id = ?', [req.params.id]);
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    // Non-admins can only see published content
    if (req.user.role !== 'admin' && content.status !== 'publicado') {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    res.json({
      ...content,
      tags: JSON.parse(content.tags || '[]'),
      featured: Boolean(content.featured)
    });
  });

  // Create content (admin)
  app.post('/api/admin/contents', authenticate, requireAdmin, (req, res) => {
    const { title, description, type, track, tags, level, status, featured, sort_order } = req.body;
    
    if (!title || !type || !track) {
      return res.status(400).json({ error: 'Título, tipo e trilha são obrigatórios' });
    }
    
    const result = runQuery(`
      INSERT INTO contents (title, description, type, track, tags, level, status, featured, sort_order, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description || '', type, track,
      JSON.stringify(tags || []), level || 'iniciante',
      status || 'rascunho', featured ? 1 : 0, sort_order || 0, req.user.id
    ]);
    
    res.json({ success: true, id: result.lastInsertRowid });
  });

  // Update content (admin)
  app.put('/api/admin/contents/:id', authenticate, requireAdmin, (req, res) => {
    const { title, description, track, tags, level, status, featured, sort_order, duration, pages } = req.body;
    
    const content = queryOne('SELECT * FROM contents WHERE id = ?', [req.params.id]);
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    runQuery(`
      UPDATE contents SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        track = COALESCE(?, track),
        tags = COALESCE(?, tags),
        level = COALESCE(?, level),
        status = COALESCE(?, status),
        featured = COALESCE(?, featured),
        sort_order = COALESCE(?, sort_order),
        duration = COALESCE(?, duration),
        pages = COALESCE(?, pages),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, description, track,
      tags ? JSON.stringify(tags) : null, level, status,
      featured !== undefined ? (featured ? 1 : 0) : null,
      sort_order, duration, pages, req.params.id
    ]);
    
    res.json({ success: true });
  });

  // Delete content (admin)
  app.delete('/api/admin/contents/:id', authenticate, requireAdmin, (req, res) => {
    const content = queryOne('SELECT * FROM contents WHERE id = ?', [req.params.id]);
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    // Delete file if exists
    if (content.file_path) {
      const filePath = path.join(UPLOAD_DIR, content.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete progress records
    runQuery('DELETE FROM content_progress WHERE content_id = ?', [req.params.id]);
    runQuery('DELETE FROM contents WHERE id = ?', [req.params.id]);
    
    res.json({ success: true });
  });

  // Upload file for content (admin)
  if (upload) {
    app.post('/api/admin/contents/:id/upload', authenticate, requireAdmin, upload.single('file'), (req, res) => {
      const content = queryOne('SELECT * FROM contents WHERE id = ?', [req.params.id]);
      if (!content) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }
      
      // Delete old file if exists
      if (content.file_path) {
        const oldPath = path.join(UPLOAD_DIR, content.file_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      runQuery(`
        UPDATE contents SET
          file_path = ?,
          file_name = ?,
          file_size = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [req.file.filename, req.file.originalname, req.file.size, req.params.id]);
      
      res.json({ 
        success: true, 
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size
        }
      });
    });
  }

  // Serve uploaded files (authenticated)
  app.get('/api/files/:filename', authenticate, (req, res) => {
    const filename = req.params.filename;
    
    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Nome de arquivo inválido' });
    }
    
    const filePath = path.join(UPLOAD_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    res.sendFile(filePath);
  });

  // Get user progress for a content
  app.get('/api/contents/:id/progress', authenticate, (req, res) => {
    const progress = queryOne(
      'SELECT * FROM content_progress WHERE user_id = ? AND content_id = ?',
      [req.user.id, req.params.id]
    );
    
    if (!progress) {
      return res.json({ status: 'nao_iniciado', last_position: 0 });
    }
    
    res.json({
      status: progress.status,
      last_position: progress.last_position,
      completed_at: progress.completed_at,
      updated_at: progress.updated_at
    });
  });

  // Save user progress for a content
  app.put('/api/contents/:id/progress', authenticate, (req, res) => {
    const { status, last_position } = req.body;
    const contentId = req.params.id;
    
    const existing = queryOne(
      'SELECT * FROM content_progress WHERE user_id = ? AND content_id = ?',
      [req.user.id, contentId]
    );
    
    if (existing) {
      runQuery(`
        UPDATE content_progress SET
          status = COALESCE(?, status),
          last_position = COALESCE(?, last_position),
          completed_at = CASE WHEN ? = 'concluido' THEN CURRENT_TIMESTAMP ELSE completed_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND content_id = ?
      `, [status, last_position, status, req.user.id, contentId]);
    } else {
      runQuery(`
        INSERT INTO content_progress (user_id, content_id, status, last_position, completed_at)
        VALUES (?, ?, ?, ?, CASE WHEN ? = 'concluido' THEN CURRENT_TIMESTAMP ELSE NULL END)
      `, [req.user.id, contentId, status || 'em_andamento', last_position || 0, status]);
    }
    
    res.json({ success: true });
  });

  // ========== SEARCH API ==========

  app.get('/api/search', authenticate, async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
    }
    
    const query = q.trim();
    const queryHash = crypto.createHash('md5').update(query.toLowerCase()).digest('hex');
    
    // Check cache
    const cached = queryOne(
      'SELECT * FROM search_cache WHERE query_hash = ? AND expires_at > ?',
      [queryHash, Date.now()]
    );
    
    if (cached) {
      return res.json(JSON.parse(cached.results));
    }
    
    // Try SearXNG first
    if (SEARXNG_URL) {
      try {
        const searchUrl = `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&format=json&categories=general`;
        const response = await fetch(searchUrl, { timeout: 10000 });
        const data = await response.json();
        
        const results = (data.results || []).slice(0, 10).map(r => ({
          title: r.title,
          snippet: r.content || r.description || '',
          url: r.url,
          source: new URL(r.url).hostname
        }));
        
        // Cache for 1 hour
        runQuery(`
          INSERT OR REPLACE INTO search_cache (query_hash, query, results, expires_at)
          VALUES (?, ?, ?, ?)
        `, [queryHash, query, JSON.stringify({ results, provider: 'searxng' }), Date.now() + 3600000]);
        
        return res.json({ results, provider: 'searxng' });
      } catch (err) {
        console.error('SearXNG error:', err.message);
      }
    }
    
    // Try Serper API as fallback
    if (SERPER_API_KEY) {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: query, num: 10 })
        });
        const data = await response.json();
        
        const results = (data.organic || []).map(r => ({
          title: r.title,
          snippet: r.snippet || '',
          url: r.link,
          source: new URL(r.link).hostname
        }));
        
        // Cache for 1 hour
        runQuery(`
          INSERT OR REPLACE INTO search_cache (query_hash, query, results, expires_at)
          VALUES (?, ?, ?, ?)
        `, [queryHash, query, JSON.stringify({ results, provider: 'serper' }), Date.now() + 3600000]);
        
        return res.json({ results, provider: 'serper' });
      } catch (err) {
        console.error('Serper error:', err.message);
      }
    }
    
    // No provider configured or all failed
    return res.status(503).json({ 
      error: 'Nenhum provedor de busca configurado',
      message: 'Configure SEARXNG_URL ou SERPER_API_KEY no servidor'
    });
  });

  // ========== TERMINAL WEBSOCKET ==========

  if (WebSocket) {
    const wss = new WebSocket.Server({ server, path: '/api/terminal' });
    
    // Allowed commands whitelist (for fallback mode)
    const ALLOWED_COMMANDS = [
      'help', 'echo', 'date', 'whoami', 'pwd', 'ls', 'cat', 'head', 'tail',
      'wc', 'sort', 'uniq', 'grep', 'find', 'which', 'type', 'file',
      'uname', 'hostname', 'uptime', 'df', 'du', 'free', 'ps', 'top',
      'env', 'printenv', 'export', 'alias', 'history', 'clear',
      'ip', 'ping', 'netstat', 'ss', 'curl', 'wget',
      'chmod', 'chown', 'mkdir', 'rmdir', 'touch', 'cp', 'mv', 'rm',
      'tar', 'gzip', 'gunzip', 'zip', 'unzip',
      'man', 'info', 'apropos', 'whatis'
    ];
    
    wss.on('connection', (ws, req) => {
      // Extract token from query string
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.send(JSON.stringify({ type: 'error', message: 'Token não fornecido' }));
        ws.close();
        return;
      }
      
      let user;
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Token inválido' }));
        ws.close();
        return;
      }
      
      const sessionId = crypto.randomBytes(16).toString('hex');
      
      // Log session start
      runQuery(`
        INSERT INTO terminal_sessions (user_id, session_id)
        VALUES (?, ?)
      `, [user.id, sessionId]);
      
      ws.send(JSON.stringify({ 
        type: 'session', 
        sessionId,
        sandboxType: 'whitelist',
        message: 'Terminal conectado (modo whitelist)'
      }));
      
      let commandCount = 0;
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'command') {
            const cmd = data.data.trim();
            
            if (!cmd) {
              ws.send(JSON.stringify({ type: 'output', data: '\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ' }));
              return;
            }
            
            commandCount++;
            
            // Extract base command
            const baseCmd = cmd.split(/\s+/)[0];
            
            // Check whitelist
            if (!ALLOWED_COMMANDS.includes(baseCmd)) {
              ws.send(JSON.stringify({ 
                type: 'output', 
                data: `\x1b[31mComando não permitido: ${baseCmd}\x1b[0m\r\n\x1b[33mUse 'help' para ver comandos disponíveis.\x1b[0m\r\n\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ `
              }));
              return;
            }
            
            // Handle help command specially
            if (baseCmd === 'help') {
              const helpText = `\x1b[1;33mComandos disponíveis:\x1b[0m\r\n\r\n` +
                `\x1b[1mNavegação:\x1b[0m ls, pwd, cd, find, which\r\n` +
                `\x1b[1mArquivos:\x1b[0m cat, head, tail, wc, file, touch, mkdir, cp, mv, rm\r\n` +
                `\x1b[1mTexto:\x1b[0m echo, grep, sort, uniq\r\n` +
                `\x1b[1mSistema:\x1b[0m uname, hostname, uptime, df, du, free, ps, date, whoami\r\n` +
                `\x1b[1mRede:\x1b[0m ip, ping, netstat, ss, curl, wget\r\n` +
                `\x1b[1mCompressão:\x1b[0m tar, gzip, gunzip, zip, unzip\r\n` +
                `\x1b[1mAjuda:\x1b[0m man, info, apropos, whatis\r\n\r\n` +
                `\x1b[33mNota: Este é um sandbox com comandos restritos.\x1b[0m\r\n` +
                `\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ `;
              ws.send(JSON.stringify({ type: 'output', data: helpText }));
              return;
            }
            
            // Execute command (simulated responses for safety)
            let output = '';
            
            switch (baseCmd) {
              case 'date':
                output = new Date().toString();
                break;
              case 'whoami':
                output = 'sandbox-user';
                break;
              case 'pwd':
                output = '/home/sandbox';
                break;
              case 'hostname':
                output = 'infra-study-sandbox';
                break;
              case 'uname':
                output = cmd.includes('-a') ? 'Linux infra-study-sandbox 5.15.0 #1 SMP x86_64 GNU/Linux' : 'Linux';
                break;
              case 'uptime':
                output = ' ' + new Date().toLocaleTimeString() + ' up 1 day, 2:34, 1 user, load average: 0.00, 0.01, 0.05';
                break;
              case 'echo':
                output = cmd.slice(5);
                break;
              case 'clear':
                ws.send(JSON.stringify({ type: 'output', data: '\x1b[2J\x1b[H\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ' }));
                return;
              case 'ls':
                output = cmd.includes('-l') 
                  ? 'total 0\ndrwxr-xr-x 2 sandbox sandbox 4096 Jan 1 00:00 documents\ndrwxr-xr-x 2 sandbox sandbox 4096 Jan 1 00:00 scripts'
                  : 'documents  scripts';
                break;
              case 'env':
              case 'printenv':
                output = 'USER=sandbox-user\nHOME=/home/sandbox\nPATH=/usr/local/bin:/usr/bin:/bin\nSHELL=/bin/bash\nTERM=xterm-256color';
                break;
              default:
                output = `\x1b[33mSimulação: ${cmd}\x1b[0m`;
            }
            
            ws.send(JSON.stringify({ 
              type: 'output', 
              data: output + '\r\n\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ '
            }));
          }
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: 'Erro ao processar comando' }));
        }
      });
      
      ws.on('close', () => {
        // Update session end
        runQuery(`
          UPDATE terminal_sessions SET ended_at = CURRENT_TIMESTAMP, commands_count = ?
          WHERE session_id = ?
        `, [commandCount, sessionId]);
      });
    });
    
    console.log('✓ Terminal WebSocket habilitado');
  }

  // ========== HEALTH CHECK ==========

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Servidor online',
      timestamp: new Date().toISOString(),
      features: {
        upload: !!upload,
        terminal: !!WebSocket,
        search: !!(SEARXNG_URL || SERPER_API_KEY)
      }
    });
  });

  // ========== FRONTEND (SPA) ==========
  const FRONTEND_DIST = path.join(__dirname, '..', 'dist');
  const FRONTEND_INDEX = path.join(FRONTEND_DIST, 'index.html');

  if (fs.existsSync(FRONTEND_INDEX)) {
    app.use(express.static(FRONTEND_DIST));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      return res.sendFile(FRONTEND_INDEX);
    });

    console.log('✓ Frontend integrado (servindo dist/)');
  } else {
    console.log('⚠ Frontend não encontrado em dist/. Rode o build do frontend para servir junto ao backend.');
  }

  // Start server with HTTP server (for WebSocket support)
  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║        Infra Study Lab - Backend Server            ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Servidor rodando em: http://0.0.0.0:${PORT}       ║`);
    console.log('║  👤 Login padrão: admin / admin123                 ║');
    console.log('║  💾 Banco de dados: database.sqlite                ║');
    console.log('║  📂 Uploads: ' + (upload ? '✅ Habilitado' : '❌ Desabilitado').padEnd(35) + '║');
    console.log('║  🖥️  Terminal: ' + (WebSocket ? '✅ Habilitado' : '❌ Desabilitado').padEnd(34) + '║');
    console.log('║  🔍 Pesquisa: ' + (SEARXNG_URL || SERPER_API_KEY ? '✅ Configurado' : '❌ Não configurado').padEnd(35) + '║');
    console.log('║  📧 Email SMTP: ' + (transporter ? '✅ Configurado' : '❌ Não configurado').padEnd(33) + '║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
  });
}

startServer().catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
