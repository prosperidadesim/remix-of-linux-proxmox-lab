# MikroTik Study Lab - Backend Local

Backend Node.js + SQLite para controle de usuários e acompanhamento de desempenho.

## Requisitos

- Node.js 18+ 
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
