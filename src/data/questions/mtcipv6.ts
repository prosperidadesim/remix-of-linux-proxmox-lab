import { Question } from '@/types/question';

export const mtcipv6Questions: Question[] = [
  // ==================== IPV6 FUNDAMENTALS ====================
  {
    id: 'mtcipv6-fund-001',
    certificacao: 'MTCIPv6',
    categoria: 'IPv6 Fundamentals',
    dificuldade: 'Easy',
    pergunta: 'Qual é o tamanho de um endereço IPv6 em bits?',
    opcoes: ['128 bits', '64 bits', '32 bits', '256 bits'],
    corretaIndex: 0,
    explicacaoCorreta: 'IPv6 usa endereços de 128 bits, permitindo 2^128 endereços únicos.',
    explicacoesPorOpcao: [
      'Correto! 128 bits = 8 grupos de 16 bits.',
      'Incorreto. 64 bits é apenas metade.',
      'Incorreto. 32 bits é IPv4.',
      'Incorreto. Não é 256 bits.',
    ],
    linksOficiais: [
      { titulo: 'IPv6', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6' },
    ],
    tags: ['ipv6', 'endereçamento', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcipv6-fund-002',
    certificacao: 'MTCIPv6',
    categoria: 'IPv6 Fundamentals',
    dificuldade: 'Easy',
    pergunta: 'Qual é a representação correta de um endereço IPv6?',
    opcoes: [
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      '2001.0db8.85a3.0000.0000.8a2e.0370.7334',
      '2001-0db8-85a3-0000-0000-8a2e-0370-7334',
      '2001/0db8/85a3/0000/0000/8a2e/0370/7334',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'IPv6 usa dois-pontos (:) para separar os 8 grupos de 16 bits em hexadecimal.',
    explicacoesPorOpcao: [
      'Correto! Formato padrão do IPv6.',
      'Incorreto. Pontos são usados em IPv4.',
      'Incorreto. Hífens não são usados.',
      'Incorreto. Barras não são usadas.',
    ],
    linksOficiais: [
      { titulo: 'IPv6', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6' },
    ],
    tags: ['ipv6', 'formato', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcipv6-fund-003',
    certificacao: 'MTCIPv6',
    categoria: 'IPv6 Fundamentals',
    dificuldade: 'Medium',
    pergunta: 'O que representa o prefixo ::1?',
    opcoes: [
      'Endereço de loopback',
      'Endereço de broadcast',
      'Endereço privado',
      'Endereço público',
    ],
    corretaIndex: 0,
    explicacaoCorreta: '::1 é o endereço de loopback IPv6, equivalente ao 127.0.0.1 do IPv4.',
    explicacoesPorOpcao: [
      'Correto! ::1 = localhost.',
      'Incorreto. IPv6 não tem broadcast.',
      'Incorreto. Endereços privados são fc00::/7.',
      'Incorreto. Públicos começam com 2000::/3.',
    ],
    linksOficiais: [
      { titulo: 'IPv6', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6' },
    ],
    tags: ['ipv6', 'loopback', 'endereços'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Gerenciar IPv6',
      descricao: 'Listar e adicionar endereços IPv6 via API',
      codigo: `addresses = api.path('/ipv6/address')
for addr in addresses:
    print(f"{addr.get('address')} em {addr.get('interface')}")

# Adicionar IPv6
addresses.add(
    address='2001:db8::1/64',
    interface='ether1',
    advertise=True
)`,
    },
  },
  // ==================== SLAAC ====================
  {
    id: 'mtcipv6-slaac-001',
    certificacao: 'MTCIPv6',
    categoria: 'SLAAC',
    dificuldade: 'Medium',
    pergunta: 'O que significa SLAAC?',
    opcoes: [
      'Stateless Address Autoconfiguration',
      'Static Local Address Assignment Configuration',
      'Secure Layer Address Auto Configuration',
      'Simple Local Area Address Configuration',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'SLAAC permite que hosts configurem seus endereços IPv6 automaticamente sem servidor DHCP.',
    explicacoesPorOpcao: [
      'Correto! SLAAC usa Router Advertisements.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'IPv6 ND', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6+Neighbor+Discovery' },
    ],
    tags: ['slaac', 'autoconfiguração', 'ipv6'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcipv6-slaac-002',
    certificacao: 'MTCIPv6',
    categoria: 'SLAAC',
    dificuldade: 'Medium',
    pergunta: 'Qual mensagem o roteador envia para anunciar prefixos IPv6?',
    opcoes: [
      'Router Advertisement (RA)',
      'Router Solicitation (RS)',
      'Neighbor Advertisement (NA)',
      'Neighbor Solicitation (NS)',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Router Advertisement (RA) contém prefixos, flags e outras informações para autoconfiguração.',
    explicacoesPorOpcao: [
      'Correto! RA anuncia prefixos e opções.',
      'Incorreto. RS é enviado pelo host para solicitar RA.',
      'Incorreto. NA responde a NS.',
      'Incorreto. NS é para resolução de endereço.',
    ],
    linksOficiais: [
      { titulo: 'IPv6 ND', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6+Neighbor+Discovery' },
    ],
    tags: ['slaac', 'ra', 'nd'],
    rosVersion: 'ambos',
  },
  // ==================== DHCPv6 ====================
  {
    id: 'mtcipv6-dhcpv6-001',
    certificacao: 'MTCIPv6',
    categoria: 'DHCPv6',
    dificuldade: 'Medium',
    pergunta: 'Qual é a principal diferença entre DHCPv6 Stateful e Stateless?',
    opcoes: [
      'Stateful atribui IPs, Stateless só distribui informações como DNS',
      'Stateful é mais rápido',
      'Stateless é mais seguro',
      'Não há diferença',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'DHCPv6 Stateful gerencia IPs, Stateless apenas fornece informações complementares.',
    explicacoesPorOpcao: [
      'Correto! Stateful mantém estado dos IPs atribuídos.',
      'Incorreto. Velocidade é similar.',
      'Incorreto. Segurança depende de configuração.',
      'Incorreto. Há diferença significativa.',
    ],
    linksOficiais: [
      { titulo: 'DHCPv6', url: 'https://help.mikrotik.com/docs/display/ROS/DHCP' },
    ],
    tags: ['dhcpv6', 'stateful', 'stateless'],
    rosVersion: 'ambos',
  },
  // ==================== IPv6 ROUTING ====================
  {
    id: 'mtcipv6-routing-001',
    certificacao: 'MTCIPv6',
    categoria: 'IPv6 Routing',
    dificuldade: 'Medium',
    pergunta: 'Como funciona o roteamento IPv6 no RouterOS?',
    opcoes: [
      'Similar ao IPv4, usando tabela de rotas separada',
      'Completamente diferente do IPv4',
      'Não requer configuração',
      'Usa apenas rotas default',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'IPv6 routing usa /ipv6/route, conceitos similares ao IPv4 com tabela própria.',
    explicacoesPorOpcao: [
      'Correto! Mesmos conceitos, menus separados.',
      'Incorreto. Conceitos são similares.',
      'Incorreto. Requer configuração.',
      'Incorreto. Suporta todas as rotas.',
    ],
    linksOficiais: [
      { titulo: 'IPv6 Routes', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6' },
    ],
    tags: ['ipv6', 'roteamento', 'rotas'],
    rosVersion: 'ambos',
  },
  // ==================== DUAL STACK ====================
  {
    id: 'mtcipv6-dual-001',
    certificacao: 'MTCIPv6',
    categoria: 'Dual Stack',
    dificuldade: 'Easy',
    pergunta: 'O que é Dual Stack?',
    opcoes: [
      'Operação simultânea de IPv4 e IPv6',
      'Dois roteadores em paralelo',
      'Backup de configuração',
      'Tipo de VLAN',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Dual Stack permite que dispositivos usem IPv4 e IPv6 simultaneamente.',
    explicacoesPorOpcao: [
      'Correto! Dual Stack é transição suave.',
      'Incorreto. Não é sobre redundância.',
      'Incorreto. Não é backup.',
      'Incorreto. Não é VLAN.',
    ],
    linksOficiais: [
      { titulo: 'IPv6', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6' },
    ],
    tags: ['dual stack', 'transição', 'ipv4'],
    rosVersion: 'ambos',
  },
  // ==================== TUNNELING ====================
  {
    id: 'mtcipv6-tunnel-001',
    certificacao: 'MTCIPv6',
    categoria: 'Tunneling',
    dificuldade: 'Medium',
    pergunta: 'O que é 6to4 tunneling?',
    opcoes: [
      'Túnel automático para transportar IPv6 sobre IPv4',
      'Túnel manual entre dois pontos',
      'Protocolo de roteamento',
      'Tipo de criptografia',
    ],
    corretaIndex: 0,
    explicacaoCorreta: '6to4 encapsula IPv6 em IPv4, permitindo conectividade IPv6 sobre infraestrutura IPv4.',
    explicacoesPorOpcao: [
      'Correto! 6to4 é técnica de transição.',
      'Incorreto. Túnel manual é diferente.',
      'Incorreto. Não é protocolo de roteamento.',
      'Incorreto. Não é criptografia.',
    ],
    linksOficiais: [
      { titulo: 'IPv6 Tunnels', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6' },
    ],
    tags: ['6to4', 'túnel', 'transição'],
    rosVersion: 'ambos',
  },
  // ==================== IPv6 FIREWALL ====================
  {
    id: 'mtcipv6-fw-001',
    certificacao: 'MTCIPv6',
    categoria: 'IPv6 Firewall',
    dificuldade: 'Medium',
    pergunta: 'O firewall IPv6 é configurado no mesmo lugar que o IPv4?',
    opcoes: [
      'Não, usa /ipv6/firewall separado',
      'Sim, mesmo menu',
      'IPv6 não precisa de firewall',
      'Usa apenas ACLs',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'IPv6 firewall é configurado em /ipv6/firewall, separado do /ip/firewall.',
    explicacoesPorOpcao: [
      'Correto! Menus separados para IPv4 e IPv6.',
      'Incorreto. São menus diferentes.',
      'Incorreto. IPv6 precisa de firewall.',
      'Incorreto. Usa firewall completo.',
    ],
    linksOficiais: [
      { titulo: 'IPv6 Firewall', url: 'https://help.mikrotik.com/docs/display/ROS/IPv6+Firewall' },
    ],
    tags: ['ipv6', 'firewall', 'segurança'],
    rosVersion: 'ambos',
  },
];
