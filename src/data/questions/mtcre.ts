import { Question } from '@/types/question';

export const mtcreQuestions: Question[] = [
  // ==================== STATIC ROUTING ====================
  {
    id: 'mtcre-static-001',
    certificacao: 'MTCRE',
    categoria: 'Static Routing',
    dificuldade: 'Easy',
    pergunta: 'Qual é a principal vantagem do roteamento estático sobre o dinâmico?',
    opcoes: [
      'Menor uso de CPU e previsibilidade',
      'Adaptação automática a falhas',
      'Escalabilidade para grandes redes',
      'Configuração automática',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Rotas estáticas não consomem CPU para cálculos e são previsíveis, ideais para redes pequenas ou rotas fixas.',
    explicacoesPorOpcao: [
      'Correto! Estático é mais leve e previsível.',
      'Incorreto. Adaptação automática é vantagem do dinâmico.',
      'Incorreto. Dinâmico escala melhor.',
      'Incorreto. Estático requer configuração manual.',
    ],
    linksOficiais: [
      { titulo: 'IP Routing', url: 'https://help.mikrotik.com/docs/display/ROS/IP+Routing' },
    ],
    tags: ['routing', 'estático', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcre-static-002',
    certificacao: 'MTCRE',
    categoria: 'Static Routing',
    dificuldade: 'Medium',
    pergunta: 'O que é uma rota de "blackhole" no RouterOS?',
    opcoes: [
      'Uma rota que descarta pacotes silenciosamente',
      'Uma rota para destinos desconhecidos',
      'Uma rota de backup',
      'Uma rota para VPN',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Rota blackhole descarta pacotes para o destino especificado, útil para bloquear tráfego ou evitar loops.',
    explicacoesPorOpcao: [
      'Correto! Blackhole descarta sem enviar ICMP unreachable.',
      'Incorreto. Destinos desconhecidos usam a default route.',
      'Incorreto. Backup é rota com maior distance.',
      'Incorreto. VPN usa interfaces de túnel.',
    ],
    linksOficiais: [
      { titulo: 'Routes', url: 'https://help.mikrotik.com/docs/display/ROS/IP+Routing' },
    ],
    tags: ['routing', 'blackhole', 'segurança'],
    rosVersion: 'ambos',
    comandoRelacionado: '/ip route add dst-address=10.0.0.0/8 type=blackhole',
  },
  // ==================== OSPF ====================
  {
    id: 'mtcre-ospf-001',
    certificacao: 'MTCRE',
    categoria: 'OSPF',
    dificuldade: 'Easy',
    pergunta: 'O que significa OSPF?',
    opcoes: [
      'Open Shortest Path First',
      'Open Secure Protocol Framework',
      'Optimized Shortest Path First',
      'Open Standard Protocol Format',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'OSPF significa Open Shortest Path First, um protocolo de roteamento link-state.',
    explicacoesPorOpcao: [
      'Correto! OSPF usa algoritmo SPF (Dijkstra).',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'OSPF', url: 'https://help.mikrotik.com/docs/display/ROS/OSPF' },
    ],
    tags: ['ospf', 'protocolos', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcre-ospf-002',
    certificacao: 'MTCRE',
    categoria: 'OSPF',
    dificuldade: 'Medium',
    pergunta: 'Qual é a área obrigatória em toda rede OSPF?',
    opcoes: ['Area 0 (Backbone)', 'Area 1', 'Area 255', 'Stub Area'],
    corretaIndex: 0,
    explicacaoCorreta: 'A Área 0 (backbone) é obrigatória e todas as outras áreas devem se conectar a ela.',
    explicacoesPorOpcao: [
      'Correto! Backbone é o núcleo da rede OSPF.',
      'Incorreto. Area 1 é opcional.',
      'Incorreto. Area 255 não tem significado especial.',
      'Incorreto. Stub é um tipo de área, não obrigatória.',
    ],
    linksOficiais: [
      { titulo: 'OSPF Areas', url: 'https://help.mikrotik.com/docs/display/ROS/OSPF' },
    ],
    tags: ['ospf', 'áreas', 'backbone'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Listar Vizinhos OSPF',
      descricao: 'Obter vizinhos OSPF via API',
      codigo: `neighbors = api.path('/routing/ospf/neighbor')
for n in neighbors:
    print(f"Router ID: {n.get('router-id')} - State: {n.get('state')}")`,
    },
  },
  {
    id: 'mtcre-ospf-003',
    certificacao: 'MTCRE',
    categoria: 'OSPF',
    dificuldade: 'Medium',
    pergunta: 'Qual estado indica que dois roteadores OSPF formaram adjacência completa?',
    opcoes: ['Full', 'Two-Way', 'Exchange', 'Loading'],
    corretaIndex: 0,
    explicacaoCorreta: 'O estado Full indica que os roteadores sincronizaram suas LSDBs e formaram adjacência completa.',
    explicacoesPorOpcao: [
      'Correto! Full significa adjacência estabelecida.',
      'Incorreto. Two-Way significa comunicação bidirecional, mas sem adjacência.',
      'Incorreto. Exchange é fase de troca de LSA.',
      'Incorreto. Loading é fase de requisição de LSAs.',
    ],
    linksOficiais: [
      { titulo: 'OSPF Neighbors', url: 'https://help.mikrotik.com/docs/display/ROS/OSPF' },
    ],
    tags: ['ospf', 'estados', 'adjacência'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcre-ospf-004',
    certificacao: 'MTCRE',
    categoria: 'OSPF',
    dificuldade: 'Hard',
    pergunta: 'O que é o OSPF Cost e como é calculado por padrão?',
    opcoes: [
      'Referência de banda (100 Mbps) / Banda da interface',
      'Número de hops até o destino',
      'Latência em milissegundos',
      'Prioridade configurada manualmente',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'O Cost OSPF é calculado como Reference Bandwidth / Interface Bandwidth. Menor cost = caminho preferido.',
    explicacoesPorOpcao: [
      'Correto! Cost padrão = 100 Mbps / Banda da interface.',
      'Incorreto. Hop count é usado em RIP.',
      'Incorreto. OSPF não usa latência diretamente.',
      'Incorreto. Prioridade é para eleição de DR/BDR.',
    ],
    linksOficiais: [
      { titulo: 'OSPF Cost', url: 'https://help.mikrotik.com/docs/display/ROS/OSPF' },
    ],
    tags: ['ospf', 'cost', 'métricas'],
    rosVersion: 'ambos',
  },
  // ==================== BGP ====================
  {
    id: 'mtcre-bgp-001',
    certificacao: 'MTCRE',
    categoria: 'BGP',
    dificuldade: 'Easy',
    pergunta: 'O que significa AS em BGP?',
    opcoes: [
      'Autonomous System',
      'Automatic Switching',
      'Advanced Security',
      'Application Server',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'AS (Autonomous System) é um conjunto de redes sob uma única administração com política de roteamento comum.',
    explicacoesPorOpcao: [
      'Correto! BGP roteia entre Autonomous Systems.',
      'Incorreto.',
      'Incorreto.',
      'Incorreto.',
    ],
    linksOficiais: [
      { titulo: 'BGP', url: 'https://help.mikrotik.com/docs/display/ROS/BGP' },
    ],
    tags: ['bgp', 'conceitos', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcre-bgp-002',
    certificacao: 'MTCRE',
    categoria: 'BGP',
    dificuldade: 'Medium',
    pergunta: 'Qual é a diferença entre iBGP e eBGP?',
    opcoes: [
      'iBGP é entre roteadores do mesmo AS, eBGP entre ASs diferentes',
      'iBGP é mais rápido que eBGP',
      'iBGP usa TCP, eBGP usa UDP',
      'iBGP não precisa de configuração manual',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'iBGP (internal) é entre roteadores do mesmo AS, eBGP (external) entre ASs diferentes.',
    explicacoesPorOpcao: [
      'Correto! A diferença é se estão no mesmo AS ou não.',
      'Incorreto. Ambos têm performance similar.',
      'Incorreto. Ambos usam TCP porta 179.',
      'Incorreto. Ambos requerem configuração.',
    ],
    linksOficiais: [
      { titulo: 'BGP', url: 'https://help.mikrotik.com/docs/display/ROS/BGP' },
    ],
    tags: ['bgp', 'ibgp', 'ebgp'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Gerenciar Peers BGP',
      descricao: 'Listar e adicionar peers BGP via API',
      codigo: `peers = api.path('/routing/bgp/peer')
for peer in peers:
    print(f"Name: {peer.get('name')} - Remote AS: {peer.get('remote-as')} - State: {peer.get('state')}")

# Adicionar peer
peers.add(
    name='ISP1',
    remote_address='200.200.200.1',
    remote_as=65001
)`,
    },
  },
  {
    id: 'mtcre-bgp-003',
    certificacao: 'MTCRE',
    categoria: 'BGP',
    dificuldade: 'Hard',
    pergunta: 'Qual atributo BGP tem maior prioridade na seleção de rota?',
    opcoes: [
      'Weight (local)',
      'Local Preference',
      'AS Path',
      'MED',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Weight é o primeiro critério (Cisco) ou Local Preference em padrão. No MikroTik, considera-se primeiro rotas válidas.',
    explicacoesPorOpcao: [
      'Correto! Weight é verificado primeiro (configuração local).',
      'Incorreto. Local Pref vem após Weight.',
      'Incorreto. AS Path vem depois.',
      'Incorreto. MED tem prioridade mais baixa.',
    ],
    linksOficiais: [
      { titulo: 'BGP Best Path Selection', url: 'https://help.mikrotik.com/docs/display/ROS/BGP' },
    ],
    tags: ['bgp', 'atributos', 'seleção'],
    rosVersion: 'ambos',
  },
  // ==================== RIP ====================
  {
    id: 'mtcre-rip-001',
    certificacao: 'MTCRE',
    categoria: 'RIP',
    dificuldade: 'Easy',
    pergunta: 'Qual é a métrica usada pelo RIP?',
    opcoes: ['Hop Count', 'Bandwidth', 'Delay', 'Cost'],
    corretaIndex: 0,
    explicacaoCorreta: 'RIP usa hop count (número de saltos) como métrica, com máximo de 15 hops.',
    explicacoesPorOpcao: [
      'Correto! RIP conta o número de roteadores até o destino.',
      'Incorreto. Bandwidth é usado por EIGRP/OSPF.',
      'Incorreto. Delay é usado por EIGRP.',
      'Incorreto. Cost é usado por OSPF.',
    ],
    linksOficiais: [
      { titulo: 'RIP', url: 'https://help.mikrotik.com/docs/display/ROS/RIP' },
    ],
    tags: ['rip', 'métricas', 'básico'],
    rosVersion: 'ambos',
  },
  // ==================== VRF ====================
  {
    id: 'mtcre-vrf-001',
    certificacao: 'MTCRE',
    categoria: 'VRF',
    dificuldade: 'Medium',
    pergunta: 'O que é VRF (Virtual Routing and Forwarding)?',
    opcoes: [
      'Tecnologia que permite múltiplas tabelas de roteamento no mesmo roteador',
      'Protocolo de roteamento virtual',
      'Firewall virtual',
      'Tipo de VLAN',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'VRF permite ter múltiplas instâncias de tabelas de roteamento independentes em um único roteador.',
    explicacoesPorOpcao: [
      'Correto! VRF isola tabelas de roteamento.',
      'Incorreto. VRF não é um protocolo.',
      'Incorreto. VRF é sobre roteamento, não firewall.',
      'Incorreto. VRF não é VLAN, mas pode ser usado junto.',
    ],
    linksOficiais: [
      { titulo: 'VRF', url: 'https://help.mikrotik.com/docs/display/ROS/VRF' },
    ],
    tags: ['vrf', 'virtualização', 'routing'],
    rosVersion: 'v7',
  },
  // ==================== ROUTING FILTERS ====================
  {
    id: 'mtcre-filter-001',
    certificacao: 'MTCRE',
    categoria: 'Routing Filters',
    dificuldade: 'Medium',
    pergunta: 'Para que servem os Routing Filters no RouterOS?',
    opcoes: [
      'Filtrar e modificar rotas recebidas ou anunciadas',
      'Bloquear tráfego de dados',
      'Limitar velocidade de conexão',
      'Configurar DNS',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Routing Filters permitem aceitar, rejeitar ou modificar atributos de rotas em protocolos dinâmicos.',
    explicacoesPorOpcao: [
      'Correto! Filters controlam quais rotas são aceitas/anunciadas.',
      'Incorreto. Firewall bloqueia tráfego.',
      'Incorreto. Queues limitam velocidade.',
      'Incorreto. DNS é configurado separadamente.',
    ],
    linksOficiais: [
      { titulo: 'Routing Filters', url: 'https://help.mikrotik.com/docs/display/ROS/Route+Selection+and+Filters' },
    ],
    tags: ['filtros', 'routing', 'políticas'],
    rosVersion: 'ambos',
  },
  // ==================== MME ====================
  {
    id: 'mtcre-mme-001',
    certificacao: 'MTCRE',
    categoria: 'MME',
    dificuldade: 'Hard',
    pergunta: 'O que é MME (MikroTik Mesh Made Easy)?',
    opcoes: [
      'Protocolo proprietário para roteamento mesh wireless',
      'Ferramenta de monitoramento',
      'Tipo de criptografia',
      'Modo de bridge',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'MME é um protocolo proprietário da MikroTik para criar redes mesh wireless de forma simplificada.',
    explicacoesPorOpcao: [
      'Correto! MME facilita a criação de redes mesh.',
      'Incorreto. Monitoramento usa outras ferramentas.',
      'Incorreto. Criptografia é WPA/WPA2.',
      'Incorreto. Bridge é outra funcionalidade.',
    ],
    linksOficiais: [
      { titulo: 'Mesh', url: 'https://help.mikrotik.com/docs/display/ROS/Mesh' },
    ],
    tags: ['mme', 'mesh', 'wireless'],
    rosVersion: 'ambos',
  },
];
