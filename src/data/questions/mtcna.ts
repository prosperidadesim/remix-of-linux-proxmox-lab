import { Question } from '@/types/question';

export const mtcnaQuestions: Question[] = [
  // ==================== INTRODUÇÃO AO MIKROTIK ====================
  {
    id: 'mtcna-intro-001',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Easy',
    pergunta: 'Qual é o sistema operacional utilizado pelos roteadores MikroTik?',
    opcoes: ['RouterOS', 'Cisco IOS', 'JunOS', 'VyOS'],
    corretaIndex: 0,
    explicacaoCorreta: 'RouterOS é o sistema operacional proprietário desenvolvido pela MikroTik para seus dispositivos de rede.',
    explicacoesPorOpcao: [
      'Correto! RouterOS é o sistema operacional da MikroTik, baseado em Linux.',
      'Incorreto. Cisco IOS é o sistema operacional da Cisco Systems.',
      'Incorreto. JunOS é o sistema operacional da Juniper Networks.',
      'Incorreto. VyOS é um sistema operacional de roteamento open-source.',
    ],
    linksOficiais: [
      { titulo: 'RouterOS Overview', url: 'https://help.mikrotik.com/docs/display/ROS/RouterOS' },
    ],
    tags: ['básico', 'sistema operacional'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Conectar ao RouterOS via Python',
      descricao: 'Estabelecer conexão com a API do RouterOS',
      codigo: `from librouteros import connect

api = connect(
    username='admin',
    password='',
    host='192.168.88.1'
)
# Obter informações do sistema
resource = api.path('/system/resource')
info = list(resource)[0]
print(f"RouterOS Version: {info.get('version')}")`,
    },
  },
  {
    id: 'mtcna-intro-002',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Easy',
    pergunta: 'Qual ferramenta gráfica é utilizada para configurar dispositivos MikroTik?',
    opcoes: ['Winbox', 'Putty', 'TeamViewer', 'WinSCP'],
    corretaIndex: 0,
    explicacaoCorreta: 'Winbox é a ferramenta gráfica oficial da MikroTik para configuração e gerenciamento.',
    explicacoesPorOpcao: [
      'Correto! Winbox é a ferramenta oficial oferecendo interface gráfica completa.',
      'Incorreto. PuTTY é um cliente SSH/Telnet genérico.',
      'Incorreto. TeamViewer é software de acesso remoto para desktops.',
      'Incorreto. WinSCP é um cliente SFTP/SCP para transferência de arquivos.',
    ],
    linksOficiais: [
      { titulo: 'Winbox', url: 'https://help.mikrotik.com/docs/display/ROS/Winbox' },
    ],
    tags: ['básico', 'ferramentas', 'winbox'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-intro-003',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Easy',
    pergunta: 'Qual protocolo o Winbox utiliza para descobrir dispositivos na rede local?',
    opcoes: ['MNDP', 'CDP', 'LLDP', 'ARP'],
    corretaIndex: 0,
    explicacaoCorreta: 'MNDP (MikroTik Neighbor Discovery Protocol) é o protocolo proprietário usado pelo Winbox.',
    explicacoesPorOpcao: [
      'Correto! MNDP permite que o Winbox encontre dispositivos mesmo sem configuração IP.',
      'Incorreto. CDP (Cisco Discovery Protocol) é proprietário da Cisco.',
      'Incorreto. LLDP é um protocolo padrão IEEE, mas não é usado para descoberta no Winbox.',
      'Incorreto. ARP é para resolução de endereços IP para MAC.',
    ],
    linksOficiais: [
      { titulo: 'Neighbor Discovery', url: 'https://help.mikrotik.com/docs/display/ROS/Neighbor+discovery' },
    ],
    tags: ['básico', 'protocolos', 'mndp'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-intro-004',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Easy',
    pergunta: 'Qual é a porta padrão do serviço SSH no RouterOS?',
    opcoes: ['22', '23', '8291', '80'],
    corretaIndex: 0,
    explicacaoCorreta: 'A porta 22 é a porta padrão do SSH (Secure Shell) no RouterOS.',
    explicacoesPorOpcao: [
      'Correto! Porta 22 é o padrão do SSH em todos os sistemas.',
      'Incorreto. Porta 23 é a porta padrão do Telnet.',
      'Incorreto. Porta 8291 é a porta padrão do Winbox.',
      'Incorreto. Porta 80 é a porta padrão do HTTP/WebFig.',
    ],
    linksOficiais: [
      { titulo: 'SSH', url: 'https://help.mikrotik.com/docs/display/ROS/SSH' },
    ],
    tags: ['básico', 'serviços', 'ssh'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-intro-005',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Easy',
    pergunta: 'Qual comando é usado para reiniciar o RouterOS via terminal?',
    opcoes: ['/system reboot', '/system restart', '/reboot', '/restart'],
    corretaIndex: 0,
    explicacaoCorreta: 'O comando /system reboot reinicia o dispositivo RouterOS.',
    explicacoesPorOpcao: [
      'Correto! /system reboot é o comando oficial para reiniciar.',
      'Incorreto. O comando correto é reboot, não restart.',
      'Incorreto. Deve-se usar o caminho completo /system reboot.',
      'Incorreto. Não existe comando /restart no RouterOS.',
    ],
    linksOficiais: [
      { titulo: 'System', url: 'https://help.mikrotik.com/docs/display/ROS/Resource' },
    ],
    tags: ['básico', 'comandos', 'sistema'],
    rosVersion: 'ambos',
    comandoRelacionado: '/system reboot',
  },
  {
    id: 'mtcna-intro-006',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Easy',
    pergunta: 'Qual é a porta padrão do Winbox?',
    opcoes: ['8291', '22', '80', '443'],
    corretaIndex: 0,
    explicacaoCorreta: 'A porta 8291 é a porta TCP padrão usada pelo Winbox.',
    explicacoesPorOpcao: [
      'Correto! 8291 é a porta padrão do Winbox.',
      'Incorreto. 22 é a porta do SSH.',
      'Incorreto. 80 é a porta do HTTP/WebFig.',
      'Incorreto. 443 é a porta do HTTPS.',
    ],
    linksOficiais: [
      { titulo: 'Winbox', url: 'https://help.mikrotik.com/docs/display/ROS/Winbox' },
    ],
    tags: ['básico', 'winbox', 'portas'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-intro-007',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Medium',
    pergunta: 'Qual é o usuário padrão do RouterOS após uma instalação limpa?',
    opcoes: ['admin', 'root', 'administrator', 'mikrotik'],
    corretaIndex: 0,
    explicacaoCorreta: 'O usuário padrão do RouterOS é "admin" com senha em branco.',
    explicacoesPorOpcao: [
      'Correto! O usuário padrão é "admin" sem senha.',
      'Incorreto. Não existe usuário root por padrão.',
      'Incorreto. O nome é "admin", não "administrator".',
      'Incorreto. "mikrotik" não é o usuário padrão.',
    ],
    linksOficiais: [
      { titulo: 'First Time Configuration', url: 'https://help.mikrotik.com/docs/display/ROS/First+Time+Configuration' },
    ],
    tags: ['básico', 'segurança', 'usuários'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-intro-008',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Medium',
    pergunta: 'Qual comando exibe a versão do RouterOS instalada?',
    opcoes: ['/system resource print', '/system version', '/version', '/system info'],
    corretaIndex: 0,
    explicacaoCorreta: 'O comando /system resource print mostra informações do sistema, incluindo versão.',
    explicacoesPorOpcao: [
      'Correto! Este comando mostra versão, arquitetura, uptime e recursos.',
      'Incorreto. Não existe o comando /system version.',
      'Incorreto. O comando /version não existe no RouterOS.',
      'Incorreto. Use /system resource print para ver informações.',
    ],
    linksOficiais: [
      { titulo: 'Resource', url: 'https://help.mikrotik.com/docs/display/ROS/Resource' },
    ],
    tags: ['básico', 'comandos', 'sistema'],
    rosVersion: 'ambos',
    comandoRelacionado: '/system resource print',
    pythonAPI: {
      titulo: 'Obter Versão via API',
      descricao: 'Consultar versão do RouterOS usando Python',
      codigo: `resource = api.path('/system/resource')
info = list(resource)[0]
print(f"Versão: {info.get('version')}")
print(f"Uptime: {info.get('uptime')}")
print(f"CPU: {info.get('cpu-load')}%")`,
    },
  },
  {
    id: 'mtcna-intro-009',
    certificacao: 'MTCNA',
    categoria: 'Introdução ao MikroTik',
    dificuldade: 'Hard',
    pergunta: 'Qual comando restaura completamente um dispositivo para as configurações de fábrica?',
    opcoes: ['/system reset-configuration', '/system factory-reset', '/reset', '/system default'],
    corretaIndex: 0,
    explicacaoCorreta: 'O comando /system reset-configuration remove todas as configurações.',
    explicacoesPorOpcao: [
      'Correto! Este é o comando oficial para reset de fábrica.',
      'Incorreto. O comando correto é reset-configuration.',
      'Incorreto. /reset sozinho não é válido.',
      'Incorreto. O comando correto é /system reset-configuration.',
    ],
    linksOficiais: [
      { titulo: 'Reset Configuration', url: 'https://help.mikrotik.com/docs/display/ROS/Reset+Button' },
    ],
    tags: ['sistema', 'reset', 'configuração'],
    rosVersion: 'ambos',
    comandoRelacionado: '/system reset-configuration',
  },
  // ==================== DHCP ====================
  {
    id: 'mtcna-dhcp-001',
    certificacao: 'MTCNA',
    categoria: 'DHCP',
    dificuldade: 'Easy',
    pergunta: 'Qual é a função principal do DHCP Server?',
    opcoes: [
      'Atribuir endereços IP automaticamente',
      'Rotear pacotes entre redes',
      'Filtrar tráfego de rede',
      'Traduzir nomes de domínio',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'O DHCP Server atribui automaticamente endereços IP, gateway, DNS e outras configurações.',
    explicacoesPorOpcao: [
      'Correto! DHCP automatiza a configuração de rede para dispositivos cliente.',
      'Incorreto. Roteamento é função do protocolo IP e tabelas de rota.',
      'Incorreto. Filtragem de tráfego é função do firewall.',
      'Incorreto. Tradução de nomes é função do DNS.',
    ],
    linksOficiais: [
      { titulo: 'DHCP', url: 'https://help.mikrotik.com/docs/display/ROS/DHCP' },
    ],
    tags: ['dhcp', 'básico', 'servidor'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-dhcp-002',
    certificacao: 'MTCNA',
    categoria: 'DHCP',
    dificuldade: 'Easy',
    pergunta: 'Qual menu do RouterOS contém as configurações do DHCP Server?',
    opcoes: ['/ip dhcp-server', '/dhcp server', '/ip server dhcp', '/network dhcp'],
    corretaIndex: 0,
    explicacaoCorreta: 'As configurações do DHCP Server estão em /ip dhcp-server.',
    explicacoesPorOpcao: [
      'Correto! /ip dhcp-server é o caminho correto.',
      'Incorreto. O caminho correto inclui "ip" antes.',
      'Incorreto. A ordem correta é /ip dhcp-server.',
      'Incorreto. Não existe /network no RouterOS.',
    ],
    linksOficiais: [
      { titulo: 'DHCP Server', url: 'https://help.mikrotik.com/docs/display/ROS/DHCP#DHCP-DHCPServer' },
    ],
    tags: ['dhcp', 'comandos', 'servidor'],
    rosVersion: 'ambos',
    comandoRelacionado: '/ip dhcp-server',
    pythonAPI: {
      titulo: 'Listar DHCP Leases',
      descricao: 'Obter todos os leases DHCP via API',
      codigo: `leases = api.path('/ip/dhcp-server/lease')
for lease in leases:
    print(f"IP: {lease.get('address')} - MAC: {lease.get('mac-address')}")`,
    },
  },
  {
    id: 'mtcna-dhcp-003',
    certificacao: 'MTCNA',
    categoria: 'DHCP',
    dificuldade: 'Medium',
    pergunta: 'Qual componente do DHCP Server define o range de IPs a serem distribuídos?',
    opcoes: ['Pool', 'Network', 'Lease', 'Server'],
    corretaIndex: 0,
    explicacaoCorreta: 'O Pool (IP Pool) define o intervalo de endereços IP disponíveis.',
    explicacoesPorOpcao: [
      'Correto! O IP Pool contém os endereços disponíveis para lease.',
      'Incorreto. Network define informações da rede (gateway, DNS).',
      'Incorreto. Lease é a concessão de IP para um cliente específico.',
      'Incorreto. Server é o serviço que utiliza o Pool e Network.',
    ],
    linksOficiais: [
      { titulo: 'IP Pool', url: 'https://help.mikrotik.com/docs/display/ROS/IP+Pools' },
    ],
    tags: ['dhcp', 'pool', 'configuração'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-dhcp-004',
    certificacao: 'MTCNA',
    categoria: 'DHCP',
    dificuldade: 'Medium',
    pergunta: 'Como criar uma reserva de IP (static lease) no DHCP Server?',
    opcoes: [
      'Usar make-static em um lease dinâmico',
      'Criar entrada em /ip address',
      'Configurar IP fixo no cliente',
      'Usar ARP static',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'No RouterOS, você pode criar uma reserva usando "Make Static" em um lease dinâmico.',
    explicacoesPorOpcao: [
      'Correto! make-static converte um lease dinâmico em estático.',
      'Incorreto. /ip address é para configurar IPs nas interfaces do roteador.',
      'Incorreto. Configurar IP fixo no cliente não cria reserva no servidor.',
      'Incorreto. ARP static não está relacionado a reservas DHCP.',
    ],
    linksOficiais: [
      { titulo: 'Static Leases', url: 'https://help.mikrotik.com/docs/display/ROS/DHCP#DHCP-Leases' },
    ],
    tags: ['dhcp', 'reserva', 'static lease'],
    rosVersion: 'ambos',
    comandoRelacionado: '/ip dhcp-server lease make-static',
    pythonAPI: {
      titulo: 'Criar Lease Estático',
      descricao: 'Adicionar reserva DHCP via API',
      codigo: `leases = api.path('/ip/dhcp-server/lease')
leases.add(
    address='192.168.88.50',
    mac_address='AA:BB:CC:DD:EE:FF',
    comment='Servidor Web'
)`,
    },
  },
  // ==================== BRIDGING ====================
  {
    id: 'mtcna-bridge-001',
    certificacao: 'MTCNA',
    categoria: 'Bridging',
    dificuldade: 'Easy',
    pergunta: 'Qual é a função principal de uma Bridge no RouterOS?',
    opcoes: [
      'Conectar interfaces na camada 2 (Layer 2)',
      'Rotear pacotes entre redes diferentes',
      'Criar túneis VPN',
      'Gerenciar filas de tráfego',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Uma Bridge conecta múltiplas interfaces de rede na camada 2, permitindo comunicação no mesmo domínio de broadcast.',
    explicacoesPorOpcao: [
      'Correto! Bridge opera em L2, conectando interfaces como um switch.',
      'Incorreto. Roteamento é função da camada 3.',
      'Incorreto. Túneis VPN são configurados em /interface.',
      'Incorreto. Filas são gerenciadas em /queue.',
    ],
    linksOficiais: [
      { titulo: 'Bridge', url: 'https://help.mikrotik.com/docs/display/ROS/Bridge' },
    ],
    tags: ['bridge', 'layer2', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-bridge-002',
    certificacao: 'MTCNA',
    categoria: 'Bridging',
    dificuldade: 'Medium',
    pergunta: 'Qual comando adiciona uma porta a uma bridge existente?',
    opcoes: [
      '/interface bridge port add bridge=bridge1 interface=ether2',
      '/bridge add port ether2',
      '/interface add bridge port=ether2',
      '/bridge port ether2 bridge1',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'Para adicionar uma porta a uma bridge, usa-se /interface bridge port add especificando a bridge e a interface.',
    explicacoesPorOpcao: [
      'Correto! Este é o comando completo e correto.',
      'Incorreto. Sintaxe incorreta.',
      'Incorreto. Falta especificar a bridge.',
      'Incorreto. Sintaxe incorreta para RouterOS.',
    ],
    linksOficiais: [
      { titulo: 'Bridge Port', url: 'https://help.mikrotik.com/docs/display/ROS/Bridge#Bridge-PortSettings' },
    ],
    tags: ['bridge', 'comandos', 'configuração'],
    rosVersion: 'ambos',
    comandoRelacionado: '/interface bridge port add',
  },
  // ==================== ROUTING ====================
  {
    id: 'mtcna-routing-001',
    certificacao: 'MTCNA',
    categoria: 'Routing',
    dificuldade: 'Easy',
    pergunta: 'Qual é a rota padrão (default route) em notação CIDR?',
    opcoes: ['0.0.0.0/0', '255.255.255.255/32', '10.0.0.0/8', '192.168.0.0/16'],
    corretaIndex: 0,
    explicacaoCorreta: 'A rota padrão 0.0.0.0/0 corresponde a todos os endereços IP não cobertos por rotas mais específicas.',
    explicacoesPorOpcao: [
      'Correto! 0.0.0.0/0 é a rota padrão que encaminha todo tráfego.',
      'Incorreto. 255.255.255.255/32 é endereço de broadcast limitado.',
      'Incorreto. 10.0.0.0/8 é uma rede privada classe A.',
      'Incorreto. 192.168.0.0/16 é um range de rede privada.',
    ],
    linksOficiais: [
      { titulo: 'Routes', url: 'https://help.mikrotik.com/docs/display/ROS/IP+Routing' },
    ],
    tags: ['routing', 'básico', 'default route'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-routing-002',
    certificacao: 'MTCNA',
    categoria: 'Routing',
    dificuldade: 'Medium',
    pergunta: 'Qual campo determina a preferência de uma rota quando existem múltiplas rotas para o mesmo destino?',
    opcoes: ['Distance', 'Metric', 'Cost', 'Preference'],
    corretaIndex: 0,
    explicacaoCorreta: 'No RouterOS, o campo Distance (Administrative Distance) determina a preferência. Menor distance = maior preferência.',
    explicacoesPorOpcao: [
      'Correto! Distance é usado no RouterOS para priorizar rotas.',
      'Incorreto. Metric é usado internamente por protocolos dinâmicos.',
      'Incorreto. Cost é específico de OSPF.',
      'Incorreto. Preference não é o termo usado no RouterOS.',
    ],
    linksOficiais: [
      { titulo: 'Route Selection', url: 'https://help.mikrotik.com/docs/display/ROS/IP+Routing' },
    ],
    tags: ['routing', 'distance', 'configuração'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Listar Rotas',
      descricao: 'Obter tabela de roteamento via API',
      codigo: `routes = api.path('/ip/route')
for route in routes:
    dst = route.get('dst-address', '0.0.0.0/0')
    gw = route.get('gateway', 'connected')
    dist = route.get('distance', 0)
    print(f"{dst} via {gw} distance={dist}")`,
    },
  },
  // ==================== WIRELESS ====================
  {
    id: 'mtcna-wireless-001',
    certificacao: 'MTCNA',
    categoria: 'Wireless',
    dificuldade: 'Easy',
    pergunta: 'Qual frequência é utilizada pelo padrão 802.11b/g?',
    opcoes: ['2.4 GHz', '5 GHz', '6 GHz', '900 MHz'],
    corretaIndex: 0,
    explicacaoCorreta: 'Os padrões 802.11b e 802.11g operam na frequência de 2.4 GHz.',
    explicacoesPorOpcao: [
      'Correto! 2.4 GHz é a frequência dos padrões b e g.',
      'Incorreto. 5 GHz é usado por 802.11a/n/ac/ax.',
      'Incorreto. 6 GHz é usado pelo WiFi 6E (802.11ax).',
      'Incorreto. 900 MHz não é usado por WiFi comercial.',
    ],
    linksOficiais: [
      { titulo: 'Wireless', url: 'https://help.mikrotik.com/docs/display/ROS/Wireless' },
    ],
    tags: ['wireless', 'frequência', 'padrões'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-wireless-002',
    certificacao: 'MTCNA',
    categoria: 'Wireless',
    dificuldade: 'Medium',
    pergunta: 'Qual modo wireless deve ser configurado em um AP MikroTik para criar uma rede?',
    opcoes: ['ap-bridge', 'station', 'station-bridge', 'wds-slave'],
    corretaIndex: 0,
    explicacaoCorreta: 'O modo ap-bridge permite que o dispositivo funcione como Access Point, permitindo múltiplos clientes.',
    explicacoesPorOpcao: [
      'Correto! ap-bridge é o modo AP padrão para múltiplos clientes.',
      'Incorreto. station é modo cliente, conecta-se a um AP.',
      'Incorreto. station-bridge é cliente com capacidade de bridge.',
      'Incorreto. wds-slave é para redes WDS.',
    ],
    linksOficiais: [
      { titulo: 'Wireless Modes', url: 'https://help.mikrotik.com/docs/display/ROS/Wireless#Wireless-InterfaceMode' },
    ],
    tags: ['wireless', 'modos', 'configuração'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Listar Clientes Wireless',
      descricao: 'Obter clientes conectados ao AP',
      codigo: `registrations = api.path('/interface/wireless/registration-table')
for client in registrations:
    print(f"MAC: {client.get('mac-address')} - Signal: {client.get('signal-strength')}")`,
    },
  },
  // ==================== FIREWALL ====================
  {
    id: 'mtcna-firewall-001',
    certificacao: 'MTCNA',
    categoria: 'Firewall',
    dificuldade: 'Easy',
    pergunta: 'Qual chain do firewall filter é usada para tráfego destinado ao próprio roteador?',
    opcoes: ['input', 'forward', 'output', 'prerouting'],
    corretaIndex: 0,
    explicacaoCorreta: 'A chain input processa pacotes destinados ao próprio roteador.',
    explicacoesPorOpcao: [
      'Correto! Input é para tráfego que termina no roteador.',
      'Incorreto. Forward é para tráfego que passa pelo roteador.',
      'Incorreto. Output é para tráfego originado no roteador.',
      'Incorreto. Prerouting é usado em NAT e mangle.',
    ],
    linksOficiais: [
      { titulo: 'Firewall', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['firewall', 'chains', 'básico'],
    rosVersion: 'ambos',
  },
  {
    id: 'mtcna-firewall-002',
    certificacao: 'MTCNA',
    categoria: 'Firewall',
    dificuldade: 'Medium',
    pergunta: 'Qual é a ação de firewall que descarta silenciosamente os pacotes?',
    opcoes: ['drop', 'reject', 'accept', 'tarpit'],
    corretaIndex: 0,
    explicacaoCorreta: 'A ação drop descarta o pacote silenciosamente, sem notificar a origem.',
    explicacoesPorOpcao: [
      'Correto! Drop descarta sem enviar resposta.',
      'Incorreto. Reject envia ICMP de erro ao origem.',
      'Incorreto. Accept permite a passagem do pacote.',
      'Incorreto. Tarpit captura conexões TCP para desacelerar atacantes.',
    ],
    linksOficiais: [
      { titulo: 'Firewall Actions', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall#Firewall-Actions' },
    ],
    tags: ['firewall', 'ações', 'segurança'],
    rosVersion: 'ambos',
    comandoRelacionado: '/ip firewall filter add action=drop',
    pythonAPI: {
      titulo: 'Adicionar Regra de Firewall',
      descricao: 'Criar regra para bloquear IP via API',
      codigo: `rules = api.path('/ip/firewall/filter')
rules.add(
    chain='input',
    src_address='10.0.0.100',
    action='drop',
    comment='Bloqueio temporário'
)`,
    },
  },
  {
    id: 'mtcna-firewall-003',
    certificacao: 'MTCNA',
    categoria: 'Firewall',
    dificuldade: 'Hard',
    pergunta: 'Qual é a ordem de processamento das chains no firewall filter?',
    opcoes: [
      'As regras são processadas de cima para baixo',
      'As regras são processadas aleatoriamente',
      'As regras são processadas de baixo para cima',
      'Todas as regras são verificadas simultaneamente',
    ],
    corretaIndex: 0,
    explicacaoCorreta: 'As regras de firewall são processadas sequencialmente de cima para baixo. A primeira regra que corresponde é aplicada.',
    explicacoesPorOpcao: [
      'Correto! Ordem é crucial - primeira correspondência é aplicada.',
      'Incorreto. A ordem é determinística, não aleatória.',
      'Incorreto. O processamento é de cima para baixo.',
      'Incorreto. O processamento é sequencial.',
    ],
    linksOficiais: [
      { titulo: 'Firewall', url: 'https://help.mikrotik.com/docs/display/ROS/Firewall' },
    ],
    tags: ['firewall', 'ordem', 'processamento'],
    rosVersion: 'ambos',
  },
  // ==================== QoS ====================
  {
    id: 'mtcna-qos-001',
    certificacao: 'MTCNA',
    categoria: 'QoS',
    dificuldade: 'Easy',
    pergunta: 'Qual ferramenta do RouterOS é usada para limitar a velocidade de um cliente?',
    opcoes: ['Simple Queue', 'Firewall Filter', 'NAT', 'Routing'],
    corretaIndex: 0,
    explicacaoCorreta: 'Simple Queue é a ferramenta mais simples para limitar velocidade por IP ou interface.',
    explicacoesPorOpcao: [
      'Correto! Simple Queue permite limitar banda por target.',
      'Incorreto. Firewall Filter é para permitir/bloquear tráfego.',
      'Incorreto. NAT traduz endereços IP.',
      'Incorreto. Routing encaminha pacotes entre redes.',
    ],
    linksOficiais: [
      { titulo: 'Queues', url: 'https://help.mikrotik.com/docs/display/ROS/Queues' },
    ],
    tags: ['qos', 'queues', 'básico'],
    rosVersion: 'ambos',
    comandoRelacionado: '/queue simple add',
    pythonAPI: {
      titulo: 'Criar Simple Queue',
      descricao: 'Limitar banda de um cliente via API',
      codigo: `queues = api.path('/queue/simple')
queues.add(
    name='cliente-joao',
    target='192.168.88.100/32',
    max_limit='10M/10M',
    comment='Plano 10 Mbps'
)`,
    },
  },
  // ==================== TUNNELS ====================
  {
    id: 'mtcna-tunnel-001',
    certificacao: 'MTCNA',
    categoria: 'Tunnels',
    dificuldade: 'Medium',
    pergunta: 'Qual protocolo VPN é considerado o mais simples de configurar no RouterOS?',
    opcoes: ['PPTP', 'L2TP', 'OpenVPN', 'IPsec'],
    corretaIndex: 0,
    explicacaoCorreta: 'PPTP é o mais simples de configurar, mas é considerado inseguro para uso moderno.',
    explicacoesPorOpcao: [
      'Correto! PPTP é simples, mas tem vulnerabilidades conhecidas.',
      'Incorreto. L2TP requer configuração de IPsec para segurança.',
      'Incorreto. OpenVPN requer certificados.',
      'Incorreto. IPsec é mais complexo de configurar.',
    ],
    linksOficiais: [
      { titulo: 'PPTP', url: 'https://help.mikrotik.com/docs/display/ROS/PPTP' },
    ],
    tags: ['vpn', 'tunnels', 'pptp'],
    rosVersion: 'ambos',
  },
  // ==================== HOTSPOT ====================
  {
    id: 'mtcna-hotspot-001',
    certificacao: 'MTCNA',
    categoria: 'Hotspot',
    dificuldade: 'Medium',
    pergunta: 'Qual componente do Hotspot define as páginas de login personalizadas?',
    opcoes: ['HTML directory', 'User Profile', 'Server Profile', 'Walled Garden'],
    corretaIndex: 0,
    explicacaoCorreta: 'O diretório HTML (hotspot/html) contém os arquivos de personalização das páginas de login.',
    explicacoesPorOpcao: [
      'Correto! O diretório HTML contém login.html e outros arquivos.',
      'Incorreto. User Profile define limites e configurações por usuário.',
      'Incorreto. Server Profile configura o servidor Hotspot.',
      'Incorreto. Walled Garden define sites acessíveis sem login.',
    ],
    linksOficiais: [
      { titulo: 'Hotspot', url: 'https://help.mikrotik.com/docs/display/ROS/Hotspot' },
    ],
    tags: ['hotspot', 'customização', 'html'],
    rosVersion: 'ambos',
    pythonAPI: {
      titulo: 'Listar Usuários Hotspot',
      descricao: 'Gerenciar usuários do Hotspot via API',
      codigo: `users = api.path('/ip/hotspot/user')
for user in users:
    print(f"User: {user.get('name')} - Profile: {user.get('profile')}")

# Criar usuário
users.add(
    name='guest001',
    password='senha123',
    profile='default'
)`,
    },
  },
  // ==================== FERRAMENTAS ====================
  {
    id: 'mtcna-tools-001',
    certificacao: 'MTCNA',
    categoria: 'Ferramentas',
    dificuldade: 'Easy',
    pergunta: 'Qual ferramenta do RouterOS é usada para testar conectividade de rede?',
    opcoes: ['/ping', '/traceroute', '/log', '/interface'],
    corretaIndex: 0,
    explicacaoCorreta: 'O comando /ping envia pacotes ICMP Echo Request para testar conectividade.',
    explicacoesPorOpcao: [
      'Correto! Ping testa conectividade básica.',
      'Incorreto. Traceroute mostra o caminho até o destino.',
      'Incorreto. Log mostra eventos do sistema.',
      'Incorreto. Interface gerencia interfaces de rede.',
    ],
    linksOficiais: [
      { titulo: 'Ping', url: 'https://help.mikrotik.com/docs/display/ROS/Ping' },
    ],
    tags: ['ferramentas', 'diagnóstico', 'ping'],
    rosVersion: 'ambos',
    comandoRelacionado: '/ping',
  },
  {
    id: 'mtcna-tools-002',
    certificacao: 'MTCNA',
    categoria: 'Ferramentas',
    dificuldade: 'Medium',
    pergunta: 'Qual ferramenta permite capturar pacotes de rede no RouterOS?',
    opcoes: ['Packet Sniffer', 'Torch', 'Bandwidth Test', 'Profile'],
    corretaIndex: 0,
    explicacaoCorreta: 'O Packet Sniffer captura pacotes para análise, podendo salvar em arquivo pcap.',
    explicacoesPorOpcao: [
      'Correto! Sniffer captura pacotes para análise detalhada.',
      'Incorreto. Torch mostra tráfego em tempo real, mas não captura.',
      'Incorreto. Bandwidth Test mede velocidade entre dispositivos.',
      'Incorreto. Profile mostra uso de CPU por processos.',
    ],
    linksOficiais: [
      { titulo: 'Packet Sniffer', url: 'https://help.mikrotik.com/docs/display/ROS/Packet+Sniffer' },
    ],
    tags: ['ferramentas', 'diagnóstico', 'sniffer'],
    rosVersion: 'ambos',
    comandoRelacionado: '/tool sniffer',
  },
];
