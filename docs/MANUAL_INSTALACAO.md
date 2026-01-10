# Manual de Instalação - MikroTik Study Lab

## 📋 Requisitos do Sistema

### Servidor (Backend)
- **Node.js** 18 ou superior
- **npm** ou **yarn**
- Sistema operacional: Windows, Linux ou macOS
- Mínimo 512MB de RAM
- 100MB de espaço em disco

### Cliente (Frontend)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexão de rede com o servidor

---

## 🚀 Instalação Rápida

### Passo 1: Baixar o Projeto

```bash
# Clone o repositório do GitHub
git clone https://github.com/SEU_USUARIO/mikrotik-study-lab.git

# Entre na pasta do projeto
cd mikrotik-study-lab
```

### Passo 2: Instalar o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

Você verá uma mensagem como:
```
╔════════════════════════════════════════════════════╗
║     MikroTik Study Lab - Backend Local             ║
╠════════════════════════════════════════════════════╣
║  Servidor rodando em: http://0.0.0.0:3001          ║
║                                                    ║
║  Admin padrão:                                     ║
║    Usuário: admin                                  ║
║    Senha:   admin123                               ║
╚════════════════════════════════════════════════════╝
```

### Passo 3: Instalar o Frontend

Em outro terminal:

```bash
# Volte para a pasta raiz do projeto
cd ..

# Instale as dependências do frontend
npm install

# Inicie o frontend em modo desenvolvimento
npm run dev
```

### Passo 4: Acessar o Sistema

Abra o navegador e acesse: **http://localhost:5173**

---

## 🌐 Instalação em Rede Local

Para permitir que outros computadores da sua rede acessem o sistema:

### Opção A: Acesso Direto (Desenvolvimento)

1. Descubra o IP do servidor:
   ```bash
   # Linux/Mac
   ip addr show | grep inet
   
   # Windows
   ipconfig
   ```

2. Inicie o frontend com host exposto:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```

3. Outros computadores acessam via: `http://IP_DO_SERVIDOR:5173`

4. Na tela de login, clique em "Configurar servidor" e defina a URL da API:
   ```
   http://IP_DO_SERVIDOR:3001
   ```

### Opção B: Produção com Nginx (Recomendado)

1. **Compile o frontend para produção:**
   ```bash
   npm run build
   ```
   Isso gera a pasta `dist/` com os arquivos estáticos.

2. **Instale o Nginx:**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install nginx
   
   # CentOS/RHEL
   sudo yum install nginx
   ```

3. **Configure o Nginx:**
   
   Crie o arquivo `/etc/nginx/sites-available/mikrotik-study`:
   ```nginx
   server {
       listen 80;
       server_name estudo.seudominio.local;  # ou IP do servidor
       
       # Frontend (arquivos estáticos)
       root /caminho/para/mikrotik-study-lab/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API (proxy)
       location /api {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Ative a configuração:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/mikrotik-study /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Mantenha o backend rodando:**
   ```bash
   # Usando PM2 (recomendado)
   npm install -g pm2
   cd backend
   pm2 start server.js --name mikrotik-backend
   pm2 save
   pm2 startup  # Para iniciar automaticamente no boot
   ```

---

## 📧 Configuração de Email (Opcional)

Para habilitar recuperação de senha por email:

### Usando Gmail

1. Ative "Senhas de app" na sua conta Google:
   - Acesse: https://myaccount.google.com/apppasswords
   - Gere uma senha para "Email"

2. Configure as variáveis de ambiente antes de iniciar o backend:
   ```bash
   export SMTP_HOST=smtp.gmail.com
   export SMTP_PORT=587
   export SMTP_USER=seu.email@gmail.com
   export SMTP_PASS=sua_senha_de_app
   export SMTP_FROM="MikroTik Study <seu.email@gmail.com>"
   export APP_URL=http://IP_DO_SERVIDOR:5173
   
   npm start
   ```

### Usando Outro Servidor SMTP

```bash
export SMTP_HOST=smtp.seuservidor.com
export SMTP_PORT=587
export SMTP_USER=usuario
export SMTP_PASS=senha
export SMTP_FROM="MikroTik Study <noreply@seudominio.com>"
export APP_URL=http://seu-endereco.com

npm start
```

> **Nota:** Sem configuração de email, o sistema ainda funciona - ele mostra o link de recuperação diretamente na tela.

---

## 🔒 Configurações de Segurança

### Alterar Senha do Admin

**IMPORTANTE:** Altere a senha padrão do administrador após a instalação!

1. Faça login com `admin` / `admin123`
2. Vá em **Configurações** → **Alterar Senha**
3. Defina uma nova senha segura

### Variáveis de Ambiente de Segurança

```bash
# Chave secreta para tokens JWT (OBRIGATÓRIO mudar em produção!)
export JWT_SECRET=sua_chave_super_secreta_aqui_123456

# Porta do servidor (padrão: 3001)
export PORT=3001
```

---

## 💾 Backup dos Dados

O banco de dados fica no arquivo `backend/database.sqlite`.

### Backup Manual
```bash
cp backend/database.sqlite backup/database_$(date +%Y%m%d).sqlite
```

### Backup Automático (Linux - cron)
```bash
# Edite o crontab
crontab -e

# Adicione para backup diário às 2h da manhã
0 2 * * * cp /caminho/backend/database.sqlite /caminho/backups/database_$(date +\%Y\%m\%d).sqlite
```

---

## 🔧 Solução de Problemas

### Erro: "EADDRINUSE: address already in use"
O servidor já está rodando. Pare-o primeiro:
```bash
# Linux/Mac
pkill -f "node server.js"

# Ou mude a porta
export PORT=3002 && npm start
```

### Erro: "Cannot connect to API"
1. Verifique se o backend está rodando
2. Confirme o IP/porta na configuração do servidor (tela de login)
3. Verifique se o firewall permite a porta 3001

### Erro: "SQLITE_CANTOPEN"
Verifique permissões da pasta:
```bash
chmod 755 backend/
chmod 644 backend/database.sqlite
```

### Frontend não carrega
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📞 Suporte

- Repositório: [GitHub](https://github.com/SEU_USUARIO/mikrotik-study-lab)
- Documentação MikroTik: [help.mikrotik.com](https://help.mikrotik.com)

---

*MikroTik Study Lab v1.0.0*
