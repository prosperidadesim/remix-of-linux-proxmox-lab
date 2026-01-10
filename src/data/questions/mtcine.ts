import { Question } from '@/types/question';

export const mtcineQuestions: Question[] = [
  // ==================== MPLS ====================
  {
    id: 'mtcine-mpls-001',
    certificacao: 'MTCINE',
    categoria: 'MPLS',
    dificuldade: 'Medium',
    pergunta: 'O que significa MPLS?',
    opcoes: [
      'Multiprotocol Label Switching',
      'Multiple Path Link Service',
      'Managed Protocol Layer Switch',
      'Multi Point Label System',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'MPLS usa labels para encaminhar pacotes de forma eficiente, independente do protocolo de camada 3.',
    explicacoesPorOpcao: [
      'Correto! MPLS roteia por labels.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'MPLS', url: 'https://help.mikrotik.com/docs/display/ROS/MPLS' },
    ],
    tags: ['mpls', 'labels', 'básico'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Configurar MPLS/LDP',
      descricao: 'Gerenciar MPLS via API',
      codigo: `# Listar interfaces LDP
ldp_interfaces = api.path('/mpls/ldp/interface')
for iface in ldp_interfaces:
    print(f"Interface: {iface.get('interface')}")

# Listar neighbors LDP
neighbors = api.path('/mpls/ldp/neighbor')
for n in neighbors:
    print(f"Transport: {n.get('transport')}")`,
    },
  },
  {
    id: 'mtcine-mpls-002',
    certificacao: 'MTCINE',
    categoria: 'MPLS',
    dificuldade: 'Medium',
    pergunta: 'O que é LDP no contexto do MPLS?',
    opcoes: [
      'Label Distribution Protocol - protocolo para distribuir labels',
      'Link Data Protocol',
      'Local Delivery Point',
      'Layer Distribution Path',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'LDP é usado para trocar informações de labels entre roteadores MPLS.',
    explicacoesPorOpcao: [
      'Correto! LDP distribui mapeamentos label-FEC.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'MPLS LDP', url: 'https://help.mikrotik.com/docs/display/ROS/LDP' },
    ],
    tags: ['mpls', 'ldp', 'labels'],
    rosVersion: 'ambos',
  },
  // ==================== VPLS ====================
  {
    id: 'mtcine-vpls-001',
    certificacao: 'MTCINE',
    categoria: 'VPLS',
    dificuldade: 'Hard',
    pergunta: 'O que é VPLS?',
    opcoes: [
      'Virtual Private LAN Service - L2 VPN multipoint',
      'Virtual Private Link Service',
      'VPN Private LAN Security',
      'Virtual Path Label Switch',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'VPLS cria uma rede L2 privada sobre infraestrutura MPLS, conectando múltiplos sites.',
    explicacoesPorOpcao: [
      'Correto! VPLS é L2VPN multipoint-to-multipoint.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'VPLS', url: 'https://help.mikrotik.com/docs/display/ROS/VPLS' },
    ],
    tags: ['vpls', 'l2vpn', 'mpls'],
    rosVersion: 'ambos',
  },
  // ==================== TRAFFIC ENGINEERING ====================
  {
    id: 'mtcine-te-001',
    certificacao: 'MTCINE',
    categoria: 'Traffic Engineering',
    dificuldade: 'Hard',
    pergunta: 'Qual é o objetivo do MPLS Traffic Engineering?',
    opcoes: [
      'Controlar o caminho do tráfego independente do IGP',
      'Aumentar velocidade',
      'Criptografar dados',
      'Simplificar configuração',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'TE permite definir caminhos explícitos para tráfego, otimizando uso de links.',
    explicacoesPorOpcao: [
      'Correto! TE define LSPs explícitos.',
      'Incorreto. Velocidade depende de hardware.',
      'Incorreto. Criptografia é separada.',
      'Incorreto. TE adiciona complexidade.',
    ],
    linksOficiais: [
      { titulo: 'MPLS TE', url: 'https://help.mikrotik.com/docs/display/ROS/MPLS' },
    ],
    tags: ['te', 'mpls', 'engenharia'],
    rosVersion: 'ambos',
  },
  // ==================== BGP ADVANCED ====================
  {
    id: 'mtcine-bgp-001',
    certificacao: 'MTCINE',
    categoria: 'BGP Advanced',
    dificuldade: 'Hard',
    pergunta: 'O que é BGP Confederation?',
    opcoes: [
      'Dividir um AS em sub-ASs para reduzir mesh iBGP',
      'Unir vários ASs em um',
      'Tipo de comunidade BGP',
      'Modo de autenticação',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Confederation divide um AS grande em sub-ASs que se comportam como eBGP internamente.',
    explicacoesPorOpcao: [
      'Correto! Confederation reduz complexidade iBGP.',
      'Incorreto. É o oposto.',
      'Incorreto. Communities são diferentes.',
      'Incorreto. Autenticação é separada.',
    ],
    linksOficiais: [
      { titulo: 'BGP', url: 'https://help.mikrotik.com/docs/display/ROS/BGP' },
    ],
    tags: ['bgp', 'confederation', 'avançado'],
    rosVersion: 'ambos',
  },
  // ==================== ROUTE REFLECTION ====================
  {
    id: 'mtcine-rr-001',
    certificacao: 'MTCINE',
    categoria: 'Route Reflection',
    dificuldade: 'Hard',
    pergunta: 'O que é um Route Reflector?',
    opcoes: [
      'Roteador iBGP que reflete rotas para outros clientes',
      'Espelho de rotas para backup',
      'Tipo de firewall',
      'Protocolo de descoberta',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Route Reflector elimina necessidade de full-mesh iBGP, refletindo rotas entre clientes.',
    explicacoesPorOpcao: [
      'Correto! RR escala iBGP sem full-mesh.',
      'Incorreto. Não é backup.',
      'Incorreto. Não é firewall.',
      'Incorreto. Não é descoberta.',
    ],
    linksOficiais: [
      { titulo: 'BGP RR', url: 'https://help.mikrotik.com/docs/display/ROS/BGP' },
    ],
    tags: ['bgp', 'route reflector', 'ibgp'],
    rosVersion: 'ambos',
  },
  // ==================== ECMP ====================
  {
    id: 'mtcine-ecmp-001',
    certificacao: 'MTCINE',
    categoria: 'ECMP',
    dificuldade: 'Medium',
    pergunta: 'O que significa ECMP?',
    opcoes: [
      'Equal Cost Multi-Path - balanceamento entre rotas de mesmo custo',
      'Enhanced Control Management Protocol',
      'Extended Configuration Management Process',
      'Encrypted Channel Multi-Point',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'ECMP distribui tráfego entre múltiplas rotas com mesmo custo.',
    explicacoesPorOpcao: [
      'Correto! ECMP balanceia carga entre rotas iguais.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'ECMP', url: 'https://help.mikrotik.com/docs/display/ROS/IP+Routing' },
    ],
    tags: ['ecmp', 'balanceamento', 'routing'],
    rosVersion: 'ambos',
  },
  // ==================== LOAD BALANCING ====================
  {
    id: 'mtcine-lb-001',
    certificacao: 'MTCINE',
    categoria: 'Load Balancing',
    dificuldade: 'Medium',
    pergunta: 'Qual método de load balancing usa marcação de conexões?',
    opcoes: [
      'PCC (Per Connection Classifier)',
      'ECMP',
      'Round Robin',
      'Least Connections',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'PCC classifica conexões por hash e direciona para links diferentes mantendo sessões.',
    explicacoesPorOpcao: [
      'Correto! PCC usa mangle para classificar.',
      'Incorreto. ECMP não usa mangle.',
      'Incorreto. Round Robin não existe assim no ROS.',
      'Incorreto. Least Connections é para servidores.',
    ],
    linksOficiais: [
      { titulo: 'Load Balancing', url: 'https://help.mikrotik.com/docs/display/ROS/Mangle' },
    ],
    tags: ['load balancing', 'pcc', 'multi-wan'],
    rosVersion: 'ambos',
  },
  // ==================== L2VPN/L3VPN ====================
  {
    id: 'mtcine-vpn-001',
    certificacao: 'MTCINE',
    categoria: 'L2VPN/L3VPN',
    dificuldade: 'Hard',
    pergunta: 'Qual é a diferença entre L2VPN e L3VPN?',
    opcoes: [
      'L2VPN transporta frames Ethernet, L3VPN transporta pacotes IP',
      'L2VPN é mais seguro',
      'L3VPN é mais rápido',
      'Não há diferença',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'L2VPN (VPLS) opera em Layer 2, L3VPN usa VRF e roteia em Layer 3.',
    explicacoesPorOpcao: [
      'Correto! L2 = frames, L3 = pacotes.',
      'Incorreto. Segurança depende de configuração.',
      'Incorreto. Velocidade é similar.',
      'Incorreto. São diferentes.',
    ],
    linksOficiais: [
      { titulo: 'MPLS VPN', url: 'https://help.mikrotik.com/docs/display/ROS/MPLS' },
    ],
    tags: ['l2vpn', 'l3vpn', 'mpls'],
    rosVersion: 'ambos',
  },
];
