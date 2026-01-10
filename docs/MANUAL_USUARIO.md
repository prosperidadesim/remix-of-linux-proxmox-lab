# Manual do Usuário - MikroTik Study Lab

## 📚 Introdução

O **MikroTik Study Lab** é uma plataforma de estudos para certificações MikroTik. Permite estudar questões, fazer simulados, acompanhar seu progresso e, para administradores, gerenciar a equipe.

---

## 🔐 Acesso ao Sistema

### Login

1. Acesse o endereço do sistema no navegador
2. Digite seu **usuário** ou **email**
3. Digite sua **senha**
4. Clique em **Entrar**

![Tela de Login](./images/login.png)

### Esqueci a Senha

1. Na tela de login, clique em **"Esqueceu a senha?"**
2. Digite seu email cadastrado
3. Você receberá um link para redefinir a senha (por email ou diretamente na tela)
4. Clique no link e crie uma nova senha

### Configurar Servidor (Primeiro Acesso)

Se estiver acessando de outra máquina na rede:

1. Na tela de login, clique em **"Configurar servidor"**
2. Digite a URL da API: `http://IP_DO_SERVIDOR:3001`
3. Clique em **"Salvar e recarregar"**

---

## 📖 Áreas do Sistema

### Menu Lateral

| Ícone | Área | Descrição |
|-------|------|-----------|
| 📖 | **Estudar** | Página inicial com questões para estudo |
| 🧠 | **Simulado** | Provas simuladas cronometradas |
| 🔄 | **Revisão** | Questões marcadas e erradas |
| 📁 | **Banco de Questões** | Visualizar e gerenciar questões |
| 💻 | **Scripts** | Scripts úteis do RouterOS |
| 🐍 | **API Python** | Exemplos de automação com Python |
| 📊 | **Estatísticas** | Seu desempenho detalhado |
| ⚙️ | **Configurações** | Preferências e conta |
| 🛡️ | **Painel Admin** | Gerenciar equipe (apenas admin) |

---

## 📖 Estudar

A área principal de estudos apresenta questões para você responder.

### Como Estudar

1. Acesse **Estudar** no menu
2. Selecione os **filtros** desejados:
   - Certificação (MTCNA, MTCRE, etc.)
   - Categoria
   - Dificuldade
   - Versão do RouterOS
3. Clique em **Iniciar Estudo**
4. Para cada questão:
   - Leia atentamente
   - Selecione sua resposta
   - Clique em **Confirmar**
   - Veja a explicação detalhada

### Recursos das Questões

- **⭐ Marcar para Revisão**: Salva a questão para revisar depois
- **📎 Links Oficiais**: Acesse a documentação MikroTik relacionada
- **🐍 API Python**: Veja exemplos de código (quando disponível)

---

## 🧠 Simulado

Faça provas simuladas para testar seus conhecimentos.

### Tipos de Simulado

| Modo | Descrição |
|------|-----------|
| **Prova** | Cronometrado, sem ver respostas até o final |
| **Treino** | Veja a resposta correta após cada questão |

### Como Fazer um Simulado

1. Acesse **Simulado** no menu
2. Selecione a **certificação** desejada
3. Escolha:
   - Número de questões (10, 20, 30, 40)
   - Tempo limite (ou sem limite)
   - Modo (Prova ou Treino)
4. Clique em **Iniciar Simulado**
5. Responda todas as questões
6. Ao finalizar, veja seu resultado detalhado

### Resultado do Simulado

- Nota final (%)
- Tempo utilizado
- Questões corretas/incorretas
- Revisão de cada questão com explicação

---

## 🔄 Revisão

Revise questões importantes para fixar o conteúdo.

### Abas Disponíveis

| Aba | Conteúdo |
|-----|----------|
| **Marcadas** | Questões que você marcou com ⭐ |
| **Erradas** | Questões que você errou |
| **Todas** | Histórico completo de respostas |

### Como Revisar

1. Acesse **Revisão** no menu
2. Selecione a aba desejada
3. Clique em uma questão para ver detalhes
4. Use os filtros para encontrar questões específicas

---

## 📊 Estatísticas

Acompanhe seu progresso de estudos.

### Métricas Disponíveis

- **Taxa de Acerto**: Percentual de respostas corretas
- **Questões Respondidas**: Total de questões estudadas
- **Cobertura do Banco**: Quanto do banco você já estudou
- **Sequência de Dias**: Dias consecutivos estudando

### Gráficos

- **Evolução do Desempenho**: Sua taxa de acerto ao longo do tempo
- **Atividade Semanal**: Questões respondidas por dia
- **Por Certificação**: Desempenho em cada certificação
- **Por Categoria**: Pontos fortes e fracos

---

## ⚙️ Configurações

Personalize sua experiência e gerencie sua conta.

### Minha Conta

Visualize suas informações:
- Nome
- Email
- Usuário
- Função (Admin ou Usuário)

### Alterar Senha

1. Digite sua **senha atual**
2. Digite a **nova senha** (mínimo 6 caracteres)
3. **Confirme** a nova senha
4. Clique em **Alterar Senha**

### Aparência

- **Tema Escuro/Claro**: Alterne conforme sua preferência

### Gerenciar Dados

- **Resetar Progresso Local**: Limpa o cache do navegador
- **Limpar Cache Local**: Remove dados temporários

> **Nota**: Seus dados ficam salvos no servidor. Limpar o cache local não apaga seu progresso real.

---

## 🛡️ Painel Administrativo

*Disponível apenas para usuários administradores.*

### Visão Geral

O painel mostra métricas globais da equipe:
- Total de usuários
- Usuários ativos (últimos 7 dias)
- Total de respostas
- Taxa de acerto global

### Gerenciar Usuários

#### Criar Novo Usuário

1. Clique em **Novo Usuário**
2. Preencha:
   - Usuário (login)
   - Email
   - Nome completo
   - Senha
   - Função (Usuário ou Admin)
3. Clique em **Criar**

#### Editar Usuário

1. Na tabela de usuários, clique no ícone **✏️**
2. Altere nome, função ou senha
3. Clique em **Salvar**

#### Ações de Usuário

| Ícone | Ação |
|-------|------|
| 👁️ | Ver detalhes e estatísticas |
| ✏️ | Editar usuário |
| 🔄 | Resetar progresso |
| 🗑️ | Excluir usuário |

### Ranking

Veja os 10 melhores desempenhos da equipe, ordenados por:
- Total de acertos
- Taxa de acerto
- Sequência de dias

### Atividade

Gráfico mostrando a atividade da equipe nos últimos 7 dias.

### Exportar Relatórios

Clique em **Exportar** para gerar relatórios:

| Formato | Conteúdo |
|---------|----------|
| **Excel (.xlsx)** | 3 planilhas: Resumo, Usuários, Ranking |
| **PDF** | Relatório visual com gráficos |

#### O Relatório PDF Inclui:
- Métricas gerais
- Tabela de desempenho por usuário
- Top 10 ranking
- Gráfico de atividade semanal
- Taxa de acerto por usuário (colorido)
- Indicadores de performance

---

## 💡 Dicas de Estudo

### Estratégia Recomendada

1. **Comece pela MTCNA**: É a base para todas as outras
2. **Estude por categoria**: Foque em uma área por vez
3. **Revise os erros**: A aba "Erradas" é sua amiga
4. **Faça simulados**: Pratique em condições de prova
5. **Mantenha a sequência**: Estude um pouco todo dia

### Preparação para a Prova

| Semana | Atividade |
|--------|-----------|
| 1-2 | Estudo geral, todas as categorias |
| 3 | Foco nas categorias com menor taxa de acerto |
| 4 | Simulados intensivos + revisão de erros |

### Recursos Externos

- [help.mikrotik.com](https://help.mikrotik.com) - Documentação oficial
- [wiki.mikrotik.com](https://wiki.mikrotik.com) - Wiki da comunidade
- [forum.mikrotik.com](https://forum.mikrotik.com) - Fórum oficial

---

## ❓ Perguntas Frequentes

### Meu progresso está salvo?

**Sim!** Seu progresso é sincronizado automaticamente com o servidor. Você pode acessar de qualquer dispositivo.

### Posso estudar offline?

Parcialmente. As questões ficam em cache no navegador, mas para sincronizar o progresso você precisa de conexão com o servidor.

### Como sei se estou pronto para a prova?

- Taxa de acerto acima de **80%** é um bom indicador
- Faça vários simulados no modo **Prova**
- Certifique-se de cobrir pelo menos **90%** do banco de questões

### Esqueci minha senha, e agora?

1. Na tela de login, clique em **"Esqueceu a senha?"**
2. Digite seu email
3. Siga as instruções recebidas

Se o email não estiver configurado, peça ao administrador para resetar sua senha.

### Como reportar um erro em uma questão?

Entre em contato com o administrador do sistema informando:
- ID da questão
- Qual o problema encontrado

---

## 🎯 Atalhos Úteis

| Atalho | Ação |
|--------|------|
| `Enter` | Confirmar resposta |
| `1-5` | Selecionar alternativa |
| `→` | Próxima questão |
| `←` | Questão anterior |

---

## 📱 Acesso Mobile

O sistema é responsivo e funciona em smartphones e tablets:

1. Acesse pelo navegador do celular
2. Use o menu hambúrguer (☰) para navegar
3. Todas as funcionalidades estão disponíveis

**Dica**: Adicione à tela inicial para acesso rápido!

---

*MikroTik Study Lab v1.0.0*  
*Bons estudos e boa prova! 🎓*
