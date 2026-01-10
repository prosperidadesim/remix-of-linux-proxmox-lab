# MikroTik Study Lab - Backend Local

Backend Node.js + SQLite para controle de usuários e acompanhamento de desempenho.

**Usa `sql.js` (SQLite compilado para JavaScript) - não precisa de ferramentas de compilação C++!**

## Requisitos

- Node.js 18+ (recomendado: v20 ou v22 LTS)
- npm ou yarn

## Instalação

```bash
cd backend
npm install
```

## Executando

```bash
npm start
```

O servidor vai rodar em `http://0.0.0.0:3001`

## Credenciais Padrão

- **Usuário**: admin
- **Senha**: admin123

⚠️ **Importante**: Troque a senha do admin após o primeiro login!

## Expondo na rede com Nginx

Adicione no seu arquivo de configuração do Nginx:

```nginx
server {
    listen 80;
    server_name estudomikrotik.seudominio.local;

    # Frontend (build do React)
    location / {
        root /caminho/para/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Estrutura do Banco de Dados

- **users**: Usuários do sistema (admin e usuários normais)
- **study_progress**: Progresso de estudo de cada usuário
- **user_answers**: Histórico de respostas
- **exams**: Resultados de simulados

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Criar usuário (apenas admin)
- `GET /api/auth/me` - Dados do usuário logado

### Progresso
- `GET /api/progress` - Buscar progresso
- `PUT /api/progress` - Salvar progresso

### Respostas
- `GET /api/answers` - Histórico de respostas
- `POST /api/answers` - Registrar resposta

### Admin
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/users/:id/stats` - Estatísticas de um usuário
- `GET /api/admin/stats` - Estatísticas gerais
- `PUT /api/admin/users/:id` - Atualizar usuário
- `DELETE /api/admin/users/:id` - Deletar usuário
- `POST /api/admin/users/:id/reset` - Resetar progresso

## Backup

O banco de dados fica no arquivo `database.sqlite`. Para fazer backup, basta copiar esse arquivo.

## Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3001)
- `JWT_SECRET`: Chave secreta para tokens JWT (troque em produção!)
- `APP_URL`: URL do frontend (padrão: http://localhost:5173)

### Configuração de Email (SMTP)

Para habilitar a recuperação de senha por email, configure as variáveis SMTP:

```bash
# Windows (CMD)
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_USER=seu-email@gmail.com
set SMTP_PASS=sua-senha-de-app
npm start

# Windows (PowerShell)
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="seu-email@gmail.com"
$env:SMTP_PASS="sua-senha-de-app"
npm start

# Linux/Mac
SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=seu-email@gmail.com SMTP_PASS=sua-senha-de-app npm start
```

**Dica Gmail**: Use uma "Senha de App" em vez da senha normal. Gere em: Conta Google → Segurança → Senhas de app.

Se o email não estiver configurado, o sistema ainda funciona mas mostra o link de reset no próprio sistema (útil para testes).
