import { Question } from '@/types/question';

export const mtcsweQuestions: Question[] = [
  // ==================== VLANs ====================
  {
    id: 'mtcswe-vlan-001',
    certificacao: 'MTCSWE',
    categoria: 'VLANs',
    dificuldade: 'Easy',
    pergunta: 'O que é uma VLAN?',
    opcoes: [
      'Virtual Local Area Network - segmentação lógica de rede',
      'Very Long Area Network',
      'Virtual Link Access Node',
      'Variable LAN',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'VLAN permite segmentar uma rede física em múltiplas redes lógicas isoladas.',
    explicacoesPorOpcao: [
      'Correto! VLAN isola domínios de broadcast.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'VLANs', url: 'https://help.mikrotik.com/docs/display/ROS/VLAN' },
    ],
    tags: ['vlan', 'segmentação', 'básico'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Gerenciar VLANs',
      descricao: 'Listar e criar VLANs via API',
      codigo: `vlans = api.path('/interface/vlan')
for vlan in vlans:
    print(f"Name: {vlan.get('name')} - VLAN ID: {vlan.get('vlan-id')}")

# Criar VLAN
vlans.add(
    name='vlan100-vendas',
    vlan_id=100,
    interface='bridge1'
)`,
    },
  },
  {
    id: 'mtcswe-vlan-002',
    certificacao: 'MTCSWE',
    categoria: 'VLANs',
    dificuldade: 'Medium',
    pergunta: 'Qual é a diferença entre porta trunk e access?',
    opcoes: [
      'Trunk carrega múltiplas VLANs com tags, Access é uma VLAN sem tag',
      'Access carrega múltiplas VLANs',
      'Trunk é mais lento',
      'Não há diferença',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Trunk transporta múltiplas VLANs tagueadas, Access conecta dispositivos finais a uma VLAN.',
    explicacoesPorOpcao: [
      'Correto! Trunk = tagged, Access = untagged.',
      'Incorreto. Access é para uma VLAN.',
      'Incorreto. Velocidade é a mesma.',
      'Incorreto. Há diferença importante.',
    ],
    linksOficiais: [
      { titulo: 'Bridge VLAN', url: 'https://help.mikrotik.com/docs/display/ROS/Bridge+VLAN+Filtering' },
    ],
    tags: ['vlan', 'trunk', 'access'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcswe-vlan-003',
    certificacao: 'MTCSWE',
    categoria: 'VLANs',
    dificuldade: 'Medium',
    pergunta: 'Como configurar VLAN filtering em uma bridge no RouterOS?',
    opcoes: [
      'Ativar vlan-filtering na bridge e configurar VLANs',
      'Criar interfaces VLAN separadas',
      'Usar firewall',
      'Configurar routing',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Bridge VLAN Filtering é o método moderno para VLANs em switches MikroTik.',
    explicacoesPorOpcao: [
      'Correto! vlan-filtering é eficiente com hardware.',
      'Incorreto. É método antigo.',
      'Incorreto. Firewall não configura VLANs.',
      'Incorreto. Routing é L3.',
    ],
    linksOficiais: [
      { titulo: 'Bridge VLAN Filtering', url: 'https://help.mikrotik.com/docs/display/ROS/Bridge+VLAN+Filtering' },
    ],
    tags: ['vlan', 'bridge', 'filtering'],
    rosVersion: 'ambos',
  },
  // ==================== STP/RSTP ====================
  {
    id: 'mtcswe-stp-001',
    certificacao: 'MTCSWE',
    categoria: 'STP/RSTP',
    dificuldade: 'Medium',
    pergunta: 'Qual é o objetivo do STP (Spanning Tree Protocol)?',
    opcoes: [
      'Prevenir loops em redes L2',
      'Rotear pacotes',
      'Criptografar dados',
      'Limitar banda',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'STP detecta e bloqueia caminhos redundantes para evitar loops de broadcast.',
    explicacoesPorOpcao: [
      'Correto! STP cria topologia sem loops.',
      'Incorreto. Routing é L3.',
      'Incorreto. Criptografia é segurança.',
      'Incorreto. Banda é QoS.',
    ],
    linksOficiais: [
      { titulo: 'STP', url: 'https://help.mikrotik.com/docs/display/ROS/Spanning+Tree+Protocol' },
    ],
    tags: ['stp', 'loops', 'redundância'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcswe-stp-002',
    certificacao: 'MTCSWE',
    categoria: 'STP/RSTP',
    dificuldade: 'Medium',
    pergunta: 'Qual é a vantagem do RSTP sobre STP?',
    opcoes: [
      'Convergência muito mais rápida (segundos vs minutos)',
      'Mais seguro',
      'Mais canais',
      'Menor uso de CPU',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'RSTP (Rapid STP) converge em segundos, enquanto STP clássico leva 30-50 segundos.',
    explicacoesPorOpcao: [
      'Correto! RSTP é muito mais rápido.',
      'Incorreto. Segurança é similar.',
      'Incorreto. Canais não são afetados.',
      'Incorreto. CPU é similar.',
    ],
    linksOficiais: [
      { titulo: 'RSTP', url: 'https://help.mikrotik.com/docs/display/ROS/Spanning+Tree+Protocol' },
    ],
    tags: ['rstp', 'convergência', 'rápido'],
    rosVersion: 'ambos',
  },
  // ==================== LACP ====================
  {
    id: 'mtcswe-lacp-001',
    certificacao: 'MTCSWE',
    categoria: 'LACP',
    dificuldade: 'Medium',
    pergunta: 'O que é LACP?',
    opcoes: [
      'Link Aggregation Control Protocol - agregação de links',
      'Local Area Control Protocol',
      'Layer Access Control Protocol',
      'Link Authentication Control Process',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'LACP permite agregar múltiplos links físicos em um link lógico para maior banda e redundância.',
    explicacoesPorOpcao: [
      'Correto! LACP combina links (bonding).',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'Bonding', url: 'https://help.mikrotik.com/docs/display/ROS/Bonding' },
    ],
    tags: ['lacp', 'bonding', 'agregação'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcswe-lacp-002',
    certificacao: 'MTCSWE',
    categoria: 'LACP',
    dificuldade: 'Medium',
    pergunta: 'Qual modo de bonding usa LACP?',
    opcoes: ['802.3ad', 'balance-rr', 'active-backup', 'balance-xor'],
    corretaIndex: 0,
    explicacaoCorreta: 'O modo 802.3ad (LACP) requer negociação com o switch parceiro.',
    explicacoesPorOpcao: [
      'Correto! 802.3ad é o modo LACP.',
      'Incorreto. balance-rr não usa LACP.',
      'Incorreto. active-backup é failover simples.',
      'Incorreto. balance-xor não usa LACP.',
    ],
    linksOficiais: [
      { titulo: 'Bonding Modes', url: 'https://help.mikrotik.com/docs/display/ROS/Bonding' },
    ],
    tags: ['lacp', '802.3ad', 'modos'],
    rosVersion: 'ambos',
  },
  // ==================== PORT ISOLATION ====================
  {
    id: 'mtcswe-isolation-001',
    certificacao: 'MTCSWE',
    categoria: 'Port Isolation',
    dificuldade: 'Medium',
    pergunta: 'O que é Port Isolation (Private VLAN)?',
    opcoes: [
      'Impedir comunicação direta entre portas, mesmo na mesma VLAN',
      'Criar VLANs separadas',
      'Tipo de firewall',
      'Protocolo de roteamento',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Port Isolation bloqueia comunicação L2 entre portas isoladas, útil para ISPs.',
    explicacoesPorOpcao: [
      'Correto! Isola clientes na mesma VLAN.',
      'Incorreto. É dentro da mesma VLAN.',
      'Incorreto. Opera em L2.',
      'Incorreto. Não é routing.',
    ],
    linksOficiais: [
      { titulo: 'Bridge Port', url: 'https://help.mikrotik.com/docs/display/ROS/Bridge' },
    ],
    tags: ['isolation', 'pvlan', 'segurança'],
    rosVersion: 'ambos',
  },
  // ==================== SWITCH CHIP ====================
  {
    id: 'mtcswe-chip-001',
    certificacao: 'MTCSWE',
    categoria: 'Switch Chip',
    dificuldade: 'Medium',
    pergunta: 'Qual é a vantagem de usar switch chip em vez de bridge por software?',
    opcoes: [
      'Processamento em hardware, maior throughput',
      'Mais fácil de configurar',
      'Mais seguro',
      'Mais barato',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Switch chip processa em hardware (wire-speed), liberando CPU para outras tarefas.',
    explicacoesPorOpcao: [
      'Correto! Hardware offload = melhor performance.',
      'Incorreto. Configuração é similar.',
      'Incorreto. Segurança é igual.',
      'Incorreto. Custo depende do modelo.',
    ],
    linksOficiais: [
      { titulo: 'Switch Chip', url: 'https://help.mikrotik.com/docs/display/ROS/Switch+Chip+Features' },
    ],
    tags: ['switch chip', 'hardware', 'offload'],
    rosVersion: 'ambos',
  },
  // ==================== L3 SWITCHING ====================
  {
    id: 'mtcswe-l3-001',
    certificacao: 'MTCSWE',
    categoria: 'L3 Switching',
    dificuldade: 'Hard',
    pergunta: 'O que é L3 Hardware Offload?',
    opcoes: [
      'Roteamento processado pelo chip de switch',
      'Balanceamento de carga L3',
      'VPN L3',
      'Firewall L3',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'L3 HW Offload permite roteamento entre VLANs diretamente no switch chip.',
    explicacoesPorOpcao: [
      'Correto! Routing inter-VLAN em hardware.',
      'Incorreto. Load balancing é diferente.',
      'Incorreto. VPN é em software.',
      'Incorreto. Firewall é em software.',
    ],
    linksOficiais: [
      { titulo: 'L3 HW Offload', url: 'https://help.mikrotik.com/docs/display/ROS/L3+Hardware+Offloading' },
    ],
    tags: ['l3 switching', 'hardware', 'offload'],
    rosVersion: 'v7',
  },
  // ==================== IGMP SNOOPING ====================
  {
    id: 'mtcswe-igmp-001',
    certificacao: 'MTCSWE',
    categoria: 'IGMP Snooping',
    dificuldade: 'Medium',
    pergunta: 'O que é IGMP Snooping?',
    opcoes: [
      'Técnica para entregar multicast apenas para portas interessadas',
      'Protocolo de roteamento',
      'Tipo de firewall',
      'Método de criptografia',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'IGMP Snooping monitora mensagens IGMP e limita multicast às portas com receptores.',
    explicacoesPorOpcao: [
      'Correto! Evita flood de multicast.',
      'Incorreto. Routing é L3.',
      'Incorreto. Firewall é filtragem.',
      'Incorreto. Criptografia é segurança.',
    ],
    linksOficiais: [
      { titulo: 'IGMP Snooping', url: 'https://help.mikrotik.com/docs/display/ROS/IGMP+Snooping' },
    ],
    tags: ['igmp', 'multicast', 'snooping'],
    rosVersion: 'ambos',
  },
  // ==================== PORT SECURITY ====================
  {
    id: 'mtcswe-sec-001',
    certificacao: 'MTCSWE',
    categoria: 'Port Security',
    dificuldade: 'Medium',
    pergunta: 'Como limitar o número de MACs aprendidos em uma porta?',
    opcoes: [
      'Usar max-learned-mac na bridge port',
      'Criar regras de firewall',
      'Usar VLANs',
      'Configurar DHCP',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'max-learned-mac limita quantos MACs podem ser aprendidos em uma porta, prevenindo ataques.',
    explicacoesPorOpcao: [
      'Correto! Limita MACs por porta.',
      'Incorreto. Firewall é L3.',
      'Incorreto. VLANs não limitam MACs.',
      'Incorreto. DHCP não controla MACs.',
    ],
    linksOficiais: [
      { titulo: 'Bridge Port', url: 'https://help.mikrotik.com/docs/display/ROS/Bridge' },
    ],
    tags: ['port security', 'mac', 'limite'],
    rosVersion: 'ambos',
  },
];
