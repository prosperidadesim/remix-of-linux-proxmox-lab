const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'infra-study-secret-key-change-in-production';
// URL base usada para links (ex.: reset de senha). Em produção, defina APP_URL.
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Configuração de email (configure com suas credenciais SMTP)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Infra Study Lab <noreply@local>';

// Transporter de email (só funciona se SMTP estiver configurado)
let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  console.log('✓ Email configurado via SMTP');
} else {
  console.log('⚠ Email não configurado (defina SMTP_USER e SMTP_PASS)');
}

// Variável global do banco de dados
let db = null;

// Função para salvar o banco no disco
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Auto-save a cada 30 segundos
setInterval(saveDatabase, 30000);

// Salva ao encerrar
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

  // Endpoint de health check para verificar se o servidor está online
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Servidor online',
      timestamp: new Date().toISOString()
    });
  });

  // ========== FRONTEND (SPA) ==========
  // Se existir build do frontend (pasta "dist" na raiz do projeto), serve tudo pelo mesmo servidor/porta.
  // Isso reduz erros de CORS e permite acessar /admin direto sem configurações extras.
  const FRONTEND_DIST = path.join(__dirname, '..', 'dist');
  const FRONTEND_INDEX = path.join(FRONTEND_DIST, 'index.html');

  if (fs.existsSync(FRONTEND_INDEX)) {
    app.use(express.static(FRONTEND_DIST));

    // Fallback do React Router (mantém /api intacto)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      return res.sendFile(FRONTEND_INDEX);
    });

    console.log('✓ Frontend integrado (servindo dist/)');
  } else {
    console.log('⚠ Frontend não encontrado em dist/. Rode o build do frontend para servir junto ao backend.');
  }

  // Inicia o servidor
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║       MikroTik Study Lab - Backend Server          ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Servidor rodando em: http://0.0.0.0:${PORT}       ║`);
    console.log('║  👤 Login padrão: admin / admin123                 ║');
    console.log('║  💾 Banco de dados: database.sqlite                ║');
    console.log('║  📧 Email SMTP: ' + (transporter ? '✅ Configurado' : '❌ Não configurado').padEnd(35) + '║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
  });
}

// Inicia o servidor
startServer().catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
