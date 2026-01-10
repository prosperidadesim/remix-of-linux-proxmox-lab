import { Question } from '@/types/question';

export const mtcseQuestions: Question[] = [
  // ==================== FIREWALL ADVANCED ====================
  {
    id: 'mtcse-fw-001',
    certificacao: 'MTCSE',
    categoria: 'Firewall Advanced',
    dificuldade: 'Medium',
    pergunta: 'Qual é a diferença entre DROP e REJECT no firewall?',
    opcoes: [
      'DROP descarta silenciosamente, REJECT envia resposta de erro',
      'REJECT é mais rápido que DROP',
      'DROP só funciona na chain input',
      'Não há diferença',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'DROP não responde ao remetente, REJECT envia ICMP port-unreachable ou TCP RST.',
    explicacoesPorOpcao: [
      'Correto! DROP é stealth, REJECT notifica o remetente.',
      'Incorreto. DROP pode ser mais leve por não gerar resposta.',
      'Incorreto. Ambos funcionam em todas as chains.',
      'Incorreto. Há diferença no comportamento.',
    ],
    linksOficiais: [
      { titulo: 'Firewall Actions', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['firewall', 'drop', 'reject'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcse-fw-002',
    certificacao: 'MTCSE',
    categoria: 'Firewall Advanced',
    dificuldade: 'Hard',
    pergunta: 'O que é Connection State e qual é a ordem recomendada de verificação?',
    opcoes: [
      'established,related primeiro, depois invalid e new',
      'new primeiro, depois established',
      'Ordem não importa',
      'invalid deve ser verificado por último',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'A ordem otimizada: aceitar established,related (mais comum), dropar invalid, depois processar new.',
    explicacoesPorOpcao: [
      'Correto! Established é maioria do tráfego.',
      'Incorreto. New é minoria.',
      'Incorreto. Ordem afeta performance.',
      'Incorreto. Invalid deve ser dropado cedo.',
    ],
    linksOficiais: [
      { titulo: 'Connection Tracking', url: 'https://help.mikrotik.com/docs/display/ROS/Connection+tracking' },
    ],
    tags: ['firewall', 'conntrack', 'otimização'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Listar Regras de Firewall',
      descricao: 'Obter todas as regras de firewall via API',
      codigo: `rules = api.path('/ip/firewall/filter')
for rule in rules:
    print(f"Chain: {rule.get('chain')} - Action: {rule.get('action')}")`,
    },
  },
  // ==================== ATTACK PREVENTION ====================
  {
    id: 'mtcse-attack-001',
    certificacao: 'MTCSE',
    categoria: 'Attack Prevention',
    dificuldade: 'Medium',
    pergunta: 'Como proteger contra ataques de força bruta no SSH?',
    opcoes: [
      'Usar address-lists para bloquear IPs após tentativas falhas',
      'Desativar SSH completamente',
      'Usar porta padrão 22',
      'Remover senha do admin',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Criar regras que adicionam IPs a blacklist após X tentativas de conexão em período de tempo.',
    explicacoesPorOpcao: [
      'Correto! Address-lists com timeout bloqueiam atacantes.',
      'Incorreto. SSH pode ser necessário.',
      'Incorreto. Porta padrão é mais vulnerável.',
      'Incorreto. Isso elimina autenticação.',
    ],
    linksOficiais: [
      { titulo: 'Firewall Address Lists', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['segurança', 'ssh', 'brute force'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcse-attack-002',
    certificacao: 'MTCSE',
    categoria: 'Attack Prevention',
    dificuldade: 'Medium',
    pergunta: 'O que é SYN Flood e como mitigar no RouterOS?',
    opcoes: [
      'Ataque que envia muitos pacotes SYN; usar SYN cookies ou limitar conexões',
      'Ataque de DNS; bloquear porta 53',
      'Ataque de ping; desativar ICMP',
      'Ataque de email; bloquear SMTP',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'SYN Flood esgota recursos com conexões TCP incompletas. SYN cookies e rate limiting ajudam.',
    explicacoesPorOpcao: [
      'Correto! TCP SYN attack é mitigado com cookies.',
      'Incorreto. DNS é outro tipo de ataque.',
      'Incorreto. ICMP flood é diferente.',
      'Incorreto. SMTP é outro vetor.',
    ],
    linksOficiais: [
      { titulo: 'DoS Protection', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['segurança', 'syn flood', 'dos'],
    rosVersion: 'ambos',
  },
  // ==================== IPSEC ====================
  {
    id: 'mtcse-ipsec-001',
    certificacao: 'MTCSE',
    categoria: 'IPsec',
    dificuldade: 'Medium',
    pergunta: 'Quais são os dois modos de operação do IPsec?',
    opcoes: [
      'Transport e Tunnel',
      'Client e Server',
      'Active e Passive',
      'Push e Pull',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Transport criptografa payload, Tunnel encapsula todo o pacote IP original.',
    explicacoesPorOpcao: [
      'Correto! Transport (L4) e Tunnel (L3).',
      'Incorreto. Não são modos IPsec.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'IPsec', url: 'https://help.mikrotik.com/docs/display/ROS/IPsec' },
    ],
    tags: ['ipsec', 'vpn', 'modos'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Gerenciar Peers IPsec',
      descricao: 'Listar peers IPsec via API',
      codigo: `peers = api.path('/ip/ipsec/peer')
for peer in peers:
    print(f"Address: {peer.get('address')} - State: {peer.get('state')}")`,
    },
  },
  {
    id: 'mtcse-ipsec-002',
    certificacao: 'MTCSE',
    categoria: 'IPsec',
    dificuldade: 'Hard',
    pergunta: 'Qual é a diferença entre IKEv1 e IKEv2?',
    opcoes: [
      'IKEv2 é mais simples, rápido e suporta MOBIKE',
      'IKEv1 é mais seguro',
      'Não há diferença prática',
      'IKEv2 só funciona em IPv6',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'IKEv2 simplifica negociação, é mais resistente a DoS e suporta mobilidade (MOBIKE).',
    explicacoesPorOpcao: [
      'Correto! IKEv2 é recomendado para novas implantações.',
      'Incorreto. IKEv2 é geralmente mais seguro.',
      'Incorreto. IKEv2 tem várias melhorias.',
      'Incorreto. Funciona em ambos.',
    ],
    linksOficiais: [
      { titulo: 'IPsec IKE', url: 'https://help.mikrotik.com/docs/display/ROS/IPsec' },
    ],
    tags: ['ipsec', 'ike', 'vpn'],
    rosVersion: 'ambos',
  },
  // ==================== CERTIFICATES ====================
  {
    id: 'mtcse-cert-001',
    certificacao: 'MTCSE',
    categoria: 'Certificates',
    dificuldade: 'Medium',
    pergunta: 'Para que servem certificados digitais no RouterOS?',
    opcoes: [
      'Autenticação segura em VPNs e serviços HTTPS',
      'Apenas para criptografar backup',
      'Controle de banda',
      'Monitoramento de rede',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Certificados são usados para autenticação em SSTP, OpenVPN, IPsec e WebFig HTTPS.',
    explicacoesPorOpcao: [
      'Correto! Certificados fornecem autenticação forte.',
      'Incorreto. Backup usa criptografia própria.',
      'Incorreto. Banda usa queues.',
      'Incorreto. Monitoramento usa outras ferramentas.',
    ],
    linksOficiais: [
      { titulo: 'Certificates', url: 'https://help.mikrotik.com/docs/display/ROS/Certificates' },
    ],
    tags: ['certificados', 'segurança', 'vpn'],
    rosVersion: 'ambos',
  },
  // ==================== PORT KNOCKING ====================
  {
    id: 'mtcse-knock-001',
    certificacao: 'MTCSE',
    categoria: 'Port Knocking',
    dificuldade: 'Hard',
    pergunta: 'O que é Port Knocking?',
    opcoes: [
      'Técnica que libera portas após sequência específica de tentativas de conexão',
      'Tipo de firewall',
      'Protocolo de roteamento',
      'Método de criptografia',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Port Knocking oculta serviços até que uma sequência secreta de portas seja acessada.',
    explicacoesPorOpcao: [
      'Correto! Aumenta segurança por obscuridade.',
      'Incorreto. É uma técnica, não um firewall.',
      'Incorreto. Não está relacionado a roteamento.',
      'Incorreto. Não é criptografia.',
    ],
    linksOficiais: [
      { titulo: 'Port Knocking', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['port knocking', 'segurança', 'obscuridade'],
    rosVersion: 'ambos',
  },
  // ==================== SECURE PROTOCOLS ====================
  {
    id: 'mtcse-secure-001',
    certificacao: 'MTCSE',
    categoria: 'Secure Protocols',
    dificuldade: 'Easy',
    pergunta: 'Qual protocolo deve ser desativado por segurança: Telnet ou SSH?',
    opcoes: [
      'Telnet deve ser desativado',
      'SSH deve ser desativado',
      'Ambos devem ser desativados',
      'Ambos são igualmente seguros',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Telnet transmite dados em texto puro, SSH é criptografado.',
    explicacoesPorOpcao: [
      'Correto! Telnet é inseguro, use SSH.',
      'Incorreto. SSH é seguro.',
      'Incorreto. SSH pode ser mantido.',
      'Incorreto. SSH é muito mais seguro.',
    ],
    linksOficiais: [
      { titulo: 'Services', url: 'https://help.mikrotik.com/docs/display/ROS/Services' },
    ],
    tags: ['protocolos', 'segurança', 'telnet'],
    rosVersion: 'ambos',
  },
  // ==================== INTRUSION DETECTION ====================
  {
    id: 'mtcse-ids-001',
    certificacao: 'MTCSE',
    categoria: 'Intrusion Detection',
    dificuldade: 'Medium',
    pergunta: 'Como detectar port scanning no RouterOS?',
    opcoes: [
      'Usar regras de firewall com PSD (Port Scan Detection)',
      'Ativar SNMP',
      'Configurar DHCP',
      'Usar bridges',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'O RouterOS suporta detecção de port scan via opções de firewall como psd.',
    explicacoesPorOpcao: [
      'Correto! PSD detecta padrões de varredura de portas.',
      'Incorreto. SNMP é para monitoramento.',
      'Incorreto. DHCP não detecta ataques.',
      'Incorreto. Bridges são para L2.',
    ],
    linksOficiais: [
      { titulo: 'Firewall Extras', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['detecção', 'port scan', 'segurança'],
    rosVersion: 'ambos',
  },
];
