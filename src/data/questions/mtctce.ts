import { Question } from '@/types/question';

export const mtctceQuestions: Question[] = [
  // ==================== HTB ====================
  {
    id: 'mtctce-htb-001',
    certificacao: 'MTCTCE',
    categoria: 'HTB',
    dificuldade: 'Easy',
    pergunta: 'O que significa HTB em gerenciamento de tráfego?',
    opcoes: [
      'Hierarchical Token Bucket',
      'High Throughput Bandwidth',
      'Hybrid Traffic Balancer',
      'Host Traffic Bridge',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'HTB (Hierarchical Token Bucket) é o algoritmo de filas usado pelo RouterOS para controle de banda.',
    explicacoesPorOpcao: [
      'Correto! HTB organiza filas hierarquicamente.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'Queues', url: 'https://help.mikrotik.com/docs/display/ROS/Queues' },
    ],
    tags: ['htb', 'qos', 'básico'],
    rosVersion: 'ambos',
  },
  // ==================== SIMPLE QUEUES ====================
  {
    id: 'mtctce-simple-001',
    certificacao: 'MTCTCE',
    categoria: 'Simple Queues',
    dificuldade: 'Easy',
    pergunta: 'Qual é a forma mais simples de limitar banda no RouterOS?',
    opcoes: ['Simple Queue', 'Queue Tree', 'Mangle', 'Firewall'],
    corretaIndex: 0,
    explicacaoCorreta: 'Simple Queue permite limitar banda por IP ou subnet de forma direta e fácil.',
    explicacoesPorOpcao: [
      'Correto! Simple Queue é o método mais direto.',
      'Incorreto. Queue Tree é mais complexo.',
      'Incorreto. Mangle marca pacotes, não limita diretamente.',
      'Incorreto. Firewall bloqueia, não limita banda.',
    ],
    linksOficiais: [
      { titulo: 'Simple Queue', url: 'https://help.mikrotik.com/docs/display/ROS/Queues#Queues-SimpleQueues' },
    ],
    tags: ['queues', 'simples', 'básico'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Criar Simple Queue',
      descricao: 'Limitar banda de cliente via API',
      codigo: `queues = api.path('/queue/simple')
queues.add(
    name='cliente-001',
    target='192.168.88.100/32',
    max_limit='10M/10M'
)`,
    },
  },
  // ==================== QUEUE TREE ====================
  {
    id: 'mtctce-tree-001',
    certificacao: 'MTCTCE',
    categoria: 'Queue Tree',
    dificuldade: 'Medium',
    pergunta: 'Qual é a principal diferença entre Simple Queue e Queue Tree?',
    opcoes: [
      'Queue Tree requer marcação de pacotes via Mangle',
      'Simple Queue é mais flexível',
      'Queue Tree só funciona com IPv6',
      'Não há diferença',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Queue Tree usa packet-marks definidos no Mangle, oferecendo mais flexibilidade para cenários complexos.',
    explicacoesPorOpcao: [
      'Correto! Queue Tree precisa de marks do Mangle.',
      'Incorreto. Queue Tree é mais flexível.',
      'Incorreto. Funciona com ambos.',
      'Incorreto. Há diferenças significativas.',
    ],
    linksOficiais: [
      { titulo: 'Queue Tree', url: 'https://help.mikrotik.com/docs/display/ROS/Queues#Queues-QueueTree' },
    ],
    tags: ['queue tree', 'mangle', 'avançado'],
    rosVersion: 'ambos',
  },
  // ==================== MANGLE ====================
  {
    id: 'mtctce-mangle-001',
    certificacao: 'MTCTCE',
    categoria: 'Mangle',
    dificuldade: 'Medium',
    pergunta: 'Qual é a função principal do Mangle no RouterOS?',
    opcoes: [
      'Marcar pacotes para processamento posterior',
      'Bloquear tráfego malicioso',
      'Traduzir endereços IP',
      'Rotear pacotes',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Mangle marca pacotes e conexões para serem processados por outras funcionalidades como QoS e routing.',
    explicacoesPorOpcao: [
      'Correto! Mangle cria marks para QoS, routing, etc.',
      'Incorreto. Bloqueio é função do Filter.',
      'Incorreto. Tradução é função do NAT.',
      'Incorreto. Routing usa tabelas de rota.',
    ],
    linksOficiais: [
      { titulo: 'Mangle', url: 'https://help.mikrotik.com/docs/display/ROS/Mangle' },
    ],
    tags: ['mangle', 'marks', 'qos'],
    rosVersion: 'ambos',
    comandoRelacionado: '/ip firewall mangle',
  },
  {
    id: 'mtctce-mangle-002',
    certificacao: 'MTCTCE',
    categoria: 'Mangle',
    dificuldade: 'Hard',
    pergunta: 'Qual chain do Mangle deve ser usada para marcar pacotes de download?',
    opcoes: ['forward ou postrouting', 'prerouting', 'input', 'output'],
    corretaIndex: 0,
    explicacaoCorreta: 'Para downloads (tráfego de internet para clientes), usa-se forward ou postrouting.',
    explicacoesPorOpcao: [
      'Correto! Forward/postrouting para tráfego passante.',
      'Incorreto. Prerouting é antes do roteamento.',
      'Incorreto. Input é para tráfego ao roteador.',
      'Incorreto. Output é tráfego do roteador.',
    ],
    linksOficiais: [
      { titulo: 'Mangle Chains', url: 'https://help.mikrotik.com/docs/display/ROS/Mangle' },
    ],
    tags: ['mangle', 'chains', 'download'],
    rosVersion: 'ambos',
  },
  // ==================== BURST ====================
  {
    id: 'mtctce-burst-001',
    certificacao: 'MTCTCE',
    categoria: 'Burst',
    dificuldade: 'Medium',
    pergunta: 'O que é Burst em QoS?',
    opcoes: [
      'Velocidade temporariamente maior que o limite configurado',
      'Tipo de fila',
      'Protocolo de marcação',
      'Método de priorização',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Burst permite velocidade acima do limite por um curto período, melhorando experiência em downloads pequenos.',
    explicacoesPorOpcao: [
      'Correto! Burst dá "turbo" temporário.',
      'Incorreto. Burst é funcionalidade de queue.',
      'Incorreto. Marcação é feita no Mangle.',
      'Incorreto. Priorização usa priority.',
    ],
    linksOficiais: [
      { titulo: 'Queue Burst', url: 'https://help.mikrotik.com/docs/display/ROS/Queues#Queues-Burst' },
    ],
    tags: ['burst', 'qos', 'velocidade'],
    rosVersion: 'ambos',
  },
  // ==================== PCQ ====================
  {
    id: 'mtctce-pcq-001',
    certificacao: 'MTCTCE',
    categoria: 'PCQ',
    dificuldade: 'Medium',
    pergunta: 'O que é PCQ (Per Connection Queue)?',
    opcoes: [
      'Tipo de fila que divide banda igualmente entre substreams',
      'Protocolo de conexão',
      'Tipo de marcação',
      'Ferramenta de monitoramento',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'PCQ cria sub-filas dinâmicas, dividindo a banda entre usuários ou conexões automaticamente.',
    explicacoesPorOpcao: [
      'Correto! PCQ equaliza banda entre classificadores.',
      'Incorreto. PCQ é tipo de queue.',
      'Incorreto. Marcação é no Mangle.',
      'Incorreto. PCQ não monitora, controla.',
    ],
    linksOficiais: [
      { titulo: 'PCQ', url: 'https://help.mikrotik.com/docs/display/ROS/Queues#Queues-PerConnectionQueue(PCQ)' },
    ],
    tags: ['pcq', 'qos', 'equalização'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtctce-pcq-002',
    certificacao: 'MTCTCE',
    categoria: 'PCQ',
    dificuldade: 'Hard',
    pergunta: 'Qual classificador PCQ divide a banda por IP de origem?',
    opcoes: ['src-address', 'dst-address', 'src-port', 'dst-port'],
    corretaIndex: 0,
    explicacaoCorreta: 'O classificador src-address cria uma sub-fila para cada IP de origem único.',
    explicacoesPorOpcao: [
      'Correto! src-address agrupa por IP de origem.',
      'Incorreto. dst-address agrupa por destino.',
      'Incorreto. src-port agrupa por porta de origem.',
      'Incorreto. dst-port agrupa por porta de destino.',
    ],
    linksOficiais: [
      { titulo: 'PCQ Classifiers', url: 'https://help.mikrotik.com/docs/display/ROS/Queues#Queues-PerConnectionQueue(PCQ)' },
    ],
    tags: ['pcq', 'classificadores', 'origem'],
    rosVersion: 'ambos',
  },
  // ==================== TRAFFIC PRIORITIZATION ====================
  {
    id: 'mtctce-prio-001',
    certificacao: 'MTCTCE',
    categoria: 'Traffic Prioritization',
    dificuldade: 'Medium',
    pergunta: 'Como priorizar tráfego VoIP sobre outros tipos de tráfego?',
    opcoes: [
      'Usar priority menor nas filas de VoIP',
      'Usar priority maior nas filas de VoIP',
      'Aumentar o limite de banda',
      'Desabilitar outras filas',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'No RouterOS, priority 1 é a mais alta (maior prioridade). Tráfego VoIP deve ter priority baixa (1-3).',
    explicacoesPorOpcao: [
      'Correto! Priority 1 é a mais prioritária.',
      'Incorreto. Número menor = maior prioridade.',
      'Incorreto. Priorização é diferente de limite.',
      'Incorreto. Outras filas devem funcionar.',
    ],
    linksOficiais: [
      { titulo: 'Queue Priority', url: 'https://help.mikrotik.com/docs/display/ROS/Queues' },
    ],
    tags: ['priorização', 'voip', 'qos'],
    rosVersion: 'ambos',
  },
  // ==================== CONNECTION TRACKING ====================
  {
    id: 'mtctce-conntrack-001',
    certificacao: 'MTCTCE',
    categoria: 'Connection Tracking',
    dificuldade: 'Medium',
    pergunta: 'O que é Connection Tracking no RouterOS?',
    opcoes: [
      'Sistema que rastreia o estado das conexões de rede',
      'Log de conexões',
      'Tipo de firewall',
      'Protocolo de monitoramento',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Connection Tracking mantém informações sobre conexões ativas, permitindo firewall stateful e NAT.',
    explicacoesPorOpcao: [
      'Correto! Conntrack é base para firewall stateful.',
      'Incorreto. Log é separado.',
      'Incorreto. É funcionalidade usada pelo firewall.',
      'Incorreto. Não é protocolo, é funcionalidade.',
    ],
    linksOficiais: [
      { titulo: 'Connection Tracking', url: 'https://help.mikrotik.com/docs/display/ROS/Connection+tracking' },
    ],
    tags: ['conntrack', 'estado', 'firewall'],
    rosVersion: 'ambos',
  },
];
