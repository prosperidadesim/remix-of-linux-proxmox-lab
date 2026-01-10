// Exemplos de uso da API Python RouterOS (librouteros)

export const PYTHON_API_INTRO = `
# Instalação da biblioteca
# pip install librouteros

from librouteros import connect

# Conexão básica com o RouterOS
api = connect(
    username='admin',
    password='sua_senha',
    host='192.168.88.1',
    port=8728  # API padrão (use 8729 para API-SSL)
)

# A API retorna generators, então precisamos converter para lista
# para ver os resultados
`;

export const PYTHON_API_EXAMPLES = {
  // Exemplos gerais
  conexao: {
    titulo: 'Conexão com RouterOS',
    descricao: 'Como estabelecer conexão com a API do RouterOS usando Python',
    codigo: `from librouteros import connect

# Conexão básica
api = connect(
    username='admin',
    password='',
    host='192.168.88.1'
)

# Com timeout
api = connect(
    username='admin',
    password='senha123',
    host='192.168.88.1',
    timeout=10
)

# Usando SSL (porta 8729)
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

api = connect(
    username='admin',
    password='senha123',
    host='192.168.88.1',
    ssl_wrapper=ctx.wrap_socket,
    port=8729
)`,
    saida: '# Conexão estabelecida com sucesso',
  },

  // DHCP
  dhcp_leases: {
    titulo: 'Listar DHCP Leases',
    descricao: 'Obter lista de todos os leases DHCP ativos',
    codigo: `# Listar todos os leases DHCP
leases = api.path('/ip/dhcp-server/lease')
for lease in leases:
    print(f"IP: {lease.get('address')} - MAC: {lease.get('mac-address')} - Host: {lease.get('host-name', 'N/A')}")`,
    saida: `IP: 192.168.88.100 - MAC: AA:BB:CC:DD:EE:FF - Host: laptop-joao
IP: 192.168.88.101 - MAC: 11:22:33:44:55:66 - Host: celular-maria`,
  },

  dhcp_add_static: {
    titulo: 'Criar Lease Estático',
    descricao: 'Adicionar uma reserva DHCP estática',
    codigo: `# Adicionar lease estático
leases = api.path('/ip/dhcp-server/lease')
leases.add(
    address='192.168.88.50',
    mac_address='AA:BB:CC:DD:EE:FF',
    comment='Servidor Web'
)`,
  },

  // Firewall
  firewall_rules: {
    titulo: 'Listar Regras de Firewall',
    descricao: 'Obter todas as regras do firewall filter',
    codigo: `# Listar regras de firewall
rules = api.path('/ip/firewall/filter')
for rule in rules:
    print(f"Chain: {rule.get('chain')} - Action: {rule.get('action')} - Comment: {rule.get('comment', '')}")`,
  },

  firewall_add_rule: {
    titulo: 'Adicionar Regra de Firewall',
    descricao: 'Criar uma nova regra de firewall',
    codigo: `# Adicionar regra para bloquear IP
rules = api.path('/ip/firewall/filter')
rules.add(
    chain='input',
    src_address='10.0.0.100',
    action='drop',
    comment='Bloqueio temporário'
)`,
  },

  // Interfaces
  interfaces_list: {
    titulo: 'Listar Interfaces',
    descricao: 'Obter informações de todas as interfaces',
    codigo: `# Listar todas as interfaces
interfaces = api.path('/interface')
for iface in interfaces:
    status = 'UP' if iface.get('running') else 'DOWN'
    print(f"{iface.get('name')}: {iface.get('type')} - {status}")`,
    saida: `ether1: ether - UP
ether2: ether - UP
wlan1: wlan - UP
bridge1: bridge - UP`,
  },

  // IP Address
  ip_addresses: {
    titulo: 'Gerenciar Endereços IP',
    descricao: 'Listar e adicionar endereços IP',
    codigo: `# Listar endereços IP
addresses = api.path('/ip/address')
for addr in addresses:
    print(f"{addr.get('address')} em {addr.get('interface')}")

# Adicionar novo IP
addresses.add(
    address='10.0.0.1/24',
    interface='ether2',
    comment='Rede interna'
)`,
  },

  // Routing
  routes_list: {
    titulo: 'Listar Rotas',
    descricao: 'Obter tabela de roteamento',
    codigo: `# Listar rotas
routes = api.path('/ip/route')
for route in routes:
    dst = route.get('dst-address', '0.0.0.0/0')
    gw = route.get('gateway', 'connected')
    print(f"{dst} via {gw}")`,
  },

  routes_add: {
    titulo: 'Adicionar Rota Estática',
    descricao: 'Criar uma nova rota estática',
    codigo: `# Adicionar rota estática
routes = api.path('/ip/route')
routes.add(
    dst_address='10.10.0.0/16',
    gateway='192.168.88.254',
    distance=1,
    comment='Rota para filial'
)`,
  },

  // Wireless
  wireless_clients: {
    titulo: 'Listar Clientes Wireless',
    descricao: 'Obter informações dos clientes conectados via wireless',
    codigo: `# Listar clientes wireless
registrations = api.path('/interface/wireless/registration-table')
for client in registrations:
    mac = client.get('mac-address')
    signal = client.get('signal-strength')
    uptime = client.get('uptime')
    print(f"MAC: {mac} - Sinal: {signal} - Uptime: {uptime}")`,
  },

  // OSPF
  ospf_neighbors: {
    titulo: 'Listar Vizinhos OSPF',
    descricao: 'Obter lista de vizinhos OSPF',
    codigo: `# Listar vizinhos OSPF
neighbors = api.path('/routing/ospf/neighbor')
for n in neighbors:
    print(f"Router ID: {n.get('router-id')} - State: {n.get('state')} - Address: {n.get('address')}")`,
  },

  ospf_networks: {
    titulo: 'Configurar Redes OSPF',
    descricao: 'Adicionar redes ao OSPF',
    codigo: `# Adicionar rede OSPF
networks = api.path('/routing/ospf/network')
networks.add(
    network='10.0.0.0/24',
    area='backbone'
)`,
  },

  // BGP
  bgp_peers: {
    titulo: 'Gerenciar Peers BGP',
    descricao: 'Listar e configurar peers BGP',
    codigo: `# Listar peers BGP
peers = api.path('/routing/bgp/peer')
for peer in peers:
    print(f"Name: {peer.get('name')} - Remote AS: {peer.get('remote-as')} - State: {peer.get('state')}")

# Adicionar peer BGP
peers.add(
    name='ISP1',
    remote_address='200.200.200.1',
    remote_as=65001,
    local_address='200.200.200.2'
)`,
  },

  // Queues
  queue_simple: {
    titulo: 'Gerenciar Simple Queues',
    descricao: 'Criar e listar regras de controle de banda',
    codigo: `# Listar queues
queues = api.path('/queue/simple')
for q in queues:
    print(f"{q.get('name')}: Max={q.get('max-limit')}")

# Criar queue para limitar cliente
queues.add(
    name='cliente-joao',
    target='192.168.88.100/32',
    max_limit='10M/10M',
    comment='Plano 10 Mbps'
)`,
  },

  // Hotspot
  hotspot_users: {
    titulo: 'Gerenciar Usuários Hotspot',
    descricao: 'Criar e listar usuários do Hotspot',
    codigo: `# Listar usuários hotspot
users = api.path('/ip/hotspot/user')
for user in users:
    print(f"User: {user.get('name')} - Profile: {user.get('profile')}")

# Criar usuário
users.add(
    name='guest001',
    password='senha123',
    profile='default',
    limit_uptime='1d'
)`,
  },

  hotspot_active: {
    titulo: 'Listar Sessões Ativas',
    descricao: 'Obter usuários conectados no Hotspot',
    codigo: `# Listar sessões ativas
active = api.path('/ip/hotspot/active')
for session in active:
    print(f"User: {session.get('user')} - IP: {session.get('address')} - Uptime: {session.get('uptime')}")`,
  },

  // VPN / IPsec
  ipsec_peers: {
    titulo: 'Gerenciar IPsec Peers',
    descricao: 'Configurar túneis IPsec',
    codigo: `# Listar peers IPsec
peers = api.path('/ip/ipsec/peer')
for peer in peers:
    print(f"Address: {peer.get('address')} - State: {peer.get('state')}")

# Adicionar peer
peers.add(
    address='vpn.empresa.com',
    secret='chave_compartilhada_123',
    exchange_mode='ike2'
)`,
  },

  // MPLS
  mpls_ldp: {
    titulo: 'Configurar MPLS/LDP',
    descricao: 'Gerenciar MPLS Label Distribution Protocol',
    codigo: `# Listar interfaces LDP
ldp_interfaces = api.path('/mpls/ldp/interface')
for iface in ldp_interfaces:
    print(f"Interface: {iface.get('interface')}")

# Listar neighbors LDP
neighbors = api.path('/mpls/ldp/neighbor')
for n in neighbors:
    print(f"Transport: {n.get('transport')} - LSR-ID: {n.get('lsr-id')}")`,
  },

  // VLANs
  vlan_list: {
    titulo: 'Gerenciar VLANs',
    descricao: 'Criar e listar VLANs',
    codigo: `# Listar VLANs
vlans = api.path('/interface/vlan')
for vlan in vlans:
    print(f"Name: {vlan.get('name')} - VLAN ID: {vlan.get('vlan-id')} - Interface: {vlan.get('interface')}")

# Criar VLAN
vlans.add(
    name='vlan100-vendas',
    vlan_id=100,
    interface='bridge1'
)`,
  },

  // System
  system_resource: {
    titulo: 'Informações do Sistema',
    descricao: 'Obter recursos e informações do sistema',
    codigo: `# Obter informações do sistema
resource = api.path('/system/resource')
info = list(resource)[0]
print(f"Versão: {info.get('version')}")
print(f"Uptime: {info.get('uptime')}")
print(f"CPU Load: {info.get('cpu-load')}%")
print(f"Free Memory: {info.get('free-memory')}")`,
    saida: `Versão: 7.12.1 (stable)
Uptime: 15d 04:32:18
CPU Load: 12%
Free Memory: 256000000`,
  },

  system_backup: {
    titulo: 'Backup e Restore',
    descricao: 'Criar e restaurar backups via API',
    codigo: `# Criar backup
backup = api.path('/system/backup')
backup('save', name='backup-api')

# Listar backups disponíveis
files = api.path('/file')
for f in files:
    if f.get('name', '').endswith('.backup'):
        print(f"Backup: {f.get('name')} - Size: {f.get('size')}")`,
  },

  // CAPsMAN
  capsman_caps: {
    titulo: 'Gerenciar CAPs (CAPsMAN)',
    descricao: 'Listar e gerenciar APs controlados',
    codigo: `# Listar CAPs registrados
caps = api.path('/caps-man/remote-cap')
for cap in caps:
    print(f"Name: {cap.get('name')} - Address: {cap.get('address')} - State: {cap.get('state')}")

# Listar interfaces provisionadas
interfaces = api.path('/caps-man/interface')
for iface in interfaces:
    print(f"Name: {iface.get('name')} - Master: {iface.get('master-interface')}")`,
  },

  // IPv6
  ipv6_address: {
    titulo: 'Gerenciar IPv6',
    descricao: 'Configurar endereços IPv6',
    codigo: `# Listar endereços IPv6
addresses = api.path('/ipv6/address')
for addr in addresses:
    print(f"{addr.get('address')} em {addr.get('interface')}")

# Adicionar endereço IPv6
addresses.add(
    address='2001:db8::1/64',
    interface='ether1',
    advertise=True
)`,
  },

  // User Manager
  usermanager_users: {
    titulo: 'Gerenciar User Manager',
    descricao: 'Administrar usuários do User Manager (RADIUS)',
    codigo: `# Listar usuários do User Manager
users = api.path('/user-manager/user')
for user in users:
    print(f"User: {user.get('name')} - Group: {user.get('group')}")

# Criar usuário
users.add(
    name='cliente001',
    password='senha123',
    group='default'
)`,
  },

  // Logs
  log_read: {
    titulo: 'Ler Logs do Sistema',
    descricao: 'Obter logs do RouterOS',
    codigo: `# Ler últimos logs
logs = api.path('/log')
for log in list(logs)[-20:]:  # Últimas 20 entradas
    print(f"[{log.get('time')}] {log.get('topics')}: {log.get('message')}")`,
  },

  // Scripts
  script_run: {
    titulo: 'Executar Scripts',
    descricao: 'Executar scripts armazenados',
    codigo: `# Listar scripts
scripts = api.path('/system/script')
for script in scripts:
    print(f"Script: {script.get('name')}")

# Executar script
scripts('run', **{'.id': '*1'})  # Executa script por ID

# Criar e executar script inline
scripts.add(
    name='backup-diario',
    source='/system backup save name=daily-backup'
)`,
  },
};

// Função para obter exemplo por comando
export function getPythonExampleForCommand(comando: string): typeof PYTHON_API_EXAMPLES[keyof typeof PYTHON_API_EXAMPLES] | null {
  const commandMappings: Record<string, keyof typeof PYTHON_API_EXAMPLES> = {
    '/ip dhcp-server lease': 'dhcp_leases',
    '/ip dhcp-server': 'dhcp_leases',
    '/ip firewall filter': 'firewall_rules',
    '/ip firewall': 'firewall_rules',
    '/interface': 'interfaces_list',
    '/ip address': 'ip_addresses',
    '/ip route': 'routes_list',
    '/interface wireless': 'wireless_clients',
    '/routing ospf': 'ospf_neighbors',
    '/routing bgp': 'bgp_peers',
    '/queue simple': 'queue_simple',
    '/ip hotspot user': 'hotspot_users',
    '/ip hotspot active': 'hotspot_active',
    '/ip ipsec': 'ipsec_peers',
    '/mpls': 'mpls_ldp',
    '/interface vlan': 'vlan_list',
    '/system resource': 'system_resource',
    '/system backup': 'system_backup',
    '/caps-man': 'capsman_caps',
    '/ipv6': 'ipv6_address',
    '/user-manager': 'usermanager_users',
    '/log': 'log_read',
    '/system script': 'script_run',
  };

  for (const [prefix, key] of Object.entries(commandMappings)) {
    if (comando.toLowerCase().startsWith(prefix)) {
      return PYTHON_API_EXAMPLES[key];
    }
  }
  
  return null;
}
