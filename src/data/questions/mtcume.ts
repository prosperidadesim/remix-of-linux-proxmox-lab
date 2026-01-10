import { Question } from '@/types/question';

export const mtcumeQuestions: Question[] = [
  // ==================== USER MANAGER ====================
  {
    id: 'mtcume-userman-001',
    certificacao: 'MTCUME',
    categoria: 'User Manager',
    dificuldade: 'Easy',
    pergunta: 'Qual é a função principal do User Manager no RouterOS?',
    opcoes: [
      'Gerenciar usuários para autenticação PPP, Hotspot e VPN',
      'Gerenciar configurações do sistema',
      'Controlar atualizações de firmware',
      'Monitorar tráfego de rede',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'User Manager é um servidor RADIUS integrado para gerenciar autenticação de usuários.',
    explicacoesPorOpcao: [
      'Correto! User Manager centraliza autenticação.',
      'Incorreto. Configurações são em /system.',
      'Incorreto. Atualizações são em /system package.',
      'Incorreto. Monitoramento usa outras ferramentas.',
    ],
    linksOficiais: [
      { titulo: 'User Manager', url: 'https://help.mikrotik.com/docs/display/ROS/User+Manager' },
    ],
    tags: ['user manager', 'radius', 'autenticação'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Gerenciar Usuários',
      descricao: 'Listar e criar usuários no User Manager via API',
      codigo: `users = api.path('/user-manager/user')
for user in users:
    print(f"User: {user.get('name')} - Group: {user.get('group')}")

# Criar usuário
users.add(
    name='cliente001',
    password='senha123',
    group='default'
)`,
    },
  },
  // ==================== RADIUS ====================
  {
    id: 'mtcume-radius-001',
    certificacao: 'MTCUME',
    categoria: 'RADIUS',
    dificuldade: 'Easy',
    pergunta: 'O que significa RADIUS?',
    opcoes: [
      'Remote Authentication Dial-In User Service',
      'Remote Access Direct Internet User System',
      'Routing And Dial-In User Service',
      'Remote Authorization Data Interface',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'RADIUS é um protocolo de autenticação, autorização e contabilidade (AAA).',
    explicacoesPorOpcao: [
      'Correto! RADIUS é protocolo AAA padrão.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'RADIUS', url: 'https://help.mikrotik.com/docs/display/ROS/RADIUS' },
    ],
    tags: ['radius', 'aaa', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcume-radius-002',
    certificacao: 'MTCUME',
    categoria: 'RADIUS',
    dificuldade: 'Medium',
    pergunta: 'Quais são as três funções principais do RADIUS (AAA)?',
    opcoes: [
      'Authentication, Authorization, Accounting',
      'Access, Audit, Administration',
      'Authentication, Access, Audit',
      'Authorization, Audit, Access',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'AAA: Autenticação (quem é), Autorização (o que pode fazer), Contabilidade (o que fez).',
    explicacoesPorOpcao: [
      'Correto! São os três pilares do RADIUS.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'RADIUS', url: 'https://help.mikrotik.com/docs/display/ROS/RADIUS' },
    ],
    tags: ['radius', 'aaa', 'conceitos'],
    rosVersion: 'ambos',
  },
  // ==================== HOTSPOT ADVANCED ====================
  {
    id: 'mtcume-hotspot-001',
    certificacao: 'MTCUME',
    categoria: 'Hotspot Advanced',
    dificuldade: 'Medium',
    pergunta: 'O que é Walled Garden no Hotspot?',
    opcoes: [
      'Lista de sites/IPs acessíveis sem autenticação',
      'Firewall do Hotspot',
      'Página de login',
      'Limite de banda',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Walled Garden define recursos que podem ser acessados antes do login, como sites de pagamento.',
    explicacoesPorOpcao: [
      'Correto! Walled Garden permite acesso pré-autenticação.',
      'Incorreto. Firewall é separado.',
      'Incorreto. Login page é outro componente.',
      'Incorreto. Limite é no profile.',
    ],
    linksOficiais: [
      { titulo: 'Hotspot Walled Garden', url: 'https://help.mikrotik.com/docs/display/ROS/Hotspot' },
    ],
    tags: ['hotspot', 'walled garden', 'acesso'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcume-hotspot-002',
    certificacao: 'MTCUME',
    categoria: 'Hotspot Advanced',
    dificuldade: 'Medium',
    pergunta: 'Qual método de autenticação Hotspot usa cookies para lembrar usuários?',
    opcoes: ['Cookie', 'HTTP-PAP', 'HTTP-CHAP', 'MAC'],
    corretaIndex: 0,
    explicacaoCorreta: 'O método Cookie armazena credenciais no navegador para auto-login.',
    explicacoesPorOpcao: [
      'Correto! Cookie mantém sessão no navegador.',
      'Incorreto. HTTP-PAP envia senha em texto.',
      'Incorreto. HTTP-CHAP usa hash da senha.',
      'Incorreto. MAC autentica pelo endereço MAC.',
    ],
    linksOficiais: [
      { titulo: 'Hotspot Authentication', url: 'https://help.mikrotik.com/docs/display/ROS/Hotspot' },
    ],
    tags: ['hotspot', 'cookie', 'autenticação'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Listar Sessões Hotspot Ativas',
      descricao: 'Obter usuários conectados ao Hotspot',
      codigo: `active = api.path('/ip/hotspot/active')
for session in active:
    print(f"User: {session.get('user')} - IP: {session.get('address')} - Uptime: {session.get('uptime')}")`,
    },
  },
  // ==================== PPPoE ====================
  {
    id: 'mtcume-pppoe-001',
    certificacao: 'MTCUME',
    categoria: 'PPPoE',
    dificuldade: 'Easy',
    pergunta: 'O que significa PPPoE?',
    opcoes: [
      'Point-to-Point Protocol over Ethernet',
      'Peer-to-Peer Protocol over Ethernet',
      'Point Protocol over Extended Ethernet',
      'Private Point Protocol over Ethernet',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'PPPoE encapsula PPP em frames Ethernet, comum em conexões de banda larga.',
    explicacoesPorOpcao: [
      'Correto! PPPoE é PPP sobre Ethernet.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'PPPoE', url: 'https://help.mikrotik.com/docs/display/ROS/PPPoE' },
    ],
    tags: ['pppoe', 'protocolos', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcume-pppoe-002',
    certificacao: 'MTCUME',
    categoria: 'PPPoE',
    dificuldade: 'Medium',
    pergunta: 'Como atribuir IP automaticamente a clientes PPPoE?',
    opcoes: [
      'Usar um Pool de IPs no PPPoE Server',
      'Configurar DHCP separado',
      'IP é atribuído pelo cliente',
      'Usar NAT',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'O PPPoE Server pode atribuir IPs de um pool configurado ou usar IPs específicos por usuário.',
    explicacoesPorOpcao: [
      'Correto! Pool de IPs é configurado no server ou profile.',
      'Incorreto. DHCP é para Ethernet, não PPP.',
      'Incorreto. Servidor atribui o IP.',
      'Incorreto. NAT não atribui IPs.',
    ],
    linksOficiais: [
      { titulo: 'PPPoE Server', url: 'https://help.mikrotik.com/docs/display/ROS/PPPoE' },
    ],
    tags: ['pppoe', 'pool', 'servidor'],
    rosVersion: 'ambos',
  },
  // ==================== PROFILES ====================
  {
    id: 'mtcume-profile-001',
    certificacao: 'MTCUME',
    categoria: 'Profiles',
    dificuldade: 'Medium',
    pergunta: 'Para que serve um Profile no User Manager?',
    opcoes: [
      'Definir limites e permissões para grupos de usuários',
      'Armazenar logs de acesso',
      'Configurar interfaces de rede',
      'Monitorar banda',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Profiles definem limites de banda, tempo de sessão, e outras restrições aplicadas a usuários.',
    explicacoesPorOpcao: [
      'Correto! Profile agrupa configurações de limite.',
      'Incorreto. Logs são separados.',
      'Incorreto. Interfaces são em /interface.',
      'Incorreto. Monitoramento usa Torch/Graphs.',
    ],
    linksOficiais: [
      { titulo: 'User Manager Profiles', url: 'https://help.mikrotik.com/docs/display/ROS/User+Manager' },
    ],
    tags: ['profiles', 'limites', 'user manager'],
    rosVersion: 'ambos',
  },
  // ==================== ACCOUNTING ====================
  {
    id: 'mtcume-accounting-001',
    certificacao: 'MTCUME',
    categoria: 'Accounting',
    dificuldade: 'Medium',
    pergunta: 'O que é RADIUS Accounting?',
    opcoes: [
      'Registro de uso de recursos pelos usuários',
      'Cobrança automática',
      'Autenticação de usuários',
      'Controle de banda',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Accounting registra uso de sessão: tempo online, bytes transferidos, etc.',
    explicacoesPorOpcao: [
      'Correto! Accounting rastreia uso para billing.',
      'Incorreto. Cobrança é feita por sistemas externos.',
      'Incorreto. Autenticação é outra função.',
      'Incorreto. Banda é controlada por queues.',
    ],
    linksOficiais: [
      { titulo: 'RADIUS Accounting', url: 'https://help.mikrotik.com/docs/display/ROS/RADIUS' },
    ],
    tags: ['accounting', 'radius', 'billing'],
    rosVersion: 'ambos',
  },
  // ==================== VOUCHERS ====================
  {
    id: 'mtcume-voucher-001',
    certificacao: 'MTCUME',
    categoria: 'Vouchers',
    dificuldade: 'Easy',
    pergunta: 'O que são vouchers no contexto do Hotspot/User Manager?',
    opcoes: [
      'Códigos pré-gerados para acesso temporário',
      'Certificados de segurança',
      'Logs de autenticação',
      'Backups de configuração',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Vouchers são códigos de uso único para autenticação no Hotspot, comuns em cyber cafés.',
    explicacoesPorOpcao: [
      'Correto! Vouchers dão acesso por tempo/volume.',
      'Incorreto. Certificados são para VPN/SSL.',
      'Incorreto. Logs registram eventos.',
      'Incorreto. Backups são arquivos de config.',
    ],
    linksOficiais: [
      { titulo: 'User Manager', url: 'https://help.mikrotik.com/docs/display/ROS/User+Manager' },
    ],
    tags: ['vouchers', 'hotspot', 'acesso'],
    rosVersion: 'ambos',
  },
];
