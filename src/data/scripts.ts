export interface ScriptCategory {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
}

export interface Script {
  id: string;
  titulo: string;
  descricao: string;
  equipamento: string;
  categoria: string;
  tags: string[];
  codigo: string;
  explicacao: string;
  requisitos?: string[];
  observacoes?: string[];
}

export const SCRIPT_CATEGORIES: ScriptCategory[] = [
  { id: 'switch', nome: 'Switches', descricao: 'Configurações para switches CRS e CSS', icone: 'Network' },
  { id: 'router', nome: 'Routers', descricao: 'Configurações para roteadores RB e CCR', icone: 'Router' },
  { id: 'wireless', nome: 'Wireless', descricao: 'Configurações para APs e bridges wireless', icone: 'Wifi' },
  { id: 'firewall', nome: 'Firewall', descricao: 'Regras de firewall e segurança', icone: 'Shield' },
  { id: 'vpn', nome: 'VPN', descricao: 'Túneis VPN e conexões seguras', icone: 'Lock' },
  { id: 'qos', nome: 'QoS', descricao: 'Controle de banda e priorização', icone: 'Gauge' },
  { id: 'hotspot', nome: 'Hotspot', descricao: 'Configurações de hotspot e captive portal', icone: 'Users' },
  { id: 'backup', nome: 'Backup & Tools', descricao: 'Scripts de backup e ferramentas', icone: 'Save' },
];

export const SCRIPTS: Script[] = [
  // ============ SWITCHES ============
  {
    id: 'crs326-basic',
    titulo: 'CRS-326-24G-2S+ - Configuração Básica',
    descricao: 'Configuração inicial completa do switch CRS-326-24G-2S+ com VLANs, gerenciamento e SFP+',
    equipamento: 'CRS-326-24G-2S+',
    categoria: 'switch',
    tags: ['CRS', 'VLAN', 'SFP+', 'Layer2'],
    codigo: `# ==========================================
# CRS-326-24G-2S+ - Configuração Básica
# ==========================================
# Reset para configuração limpa
/system reset-configuration no-defaults=yes skip-backup=yes

# Aguarde o reboot e conecte via MAC-Telnet ou cabo serial

# ==========================================
# 1. CONFIGURAÇÃO DE IDENTIDADE E ACESSO
# ==========================================
/system identity set name="SW-CORE-01"

# Criar usuário admin seguro
/user add name=admin-rede password="SenhaSegura@2024" group=full
/user disable admin

# ==========================================
# 2. CONFIGURAÇÃO DE GERENCIAMENTO
# ==========================================
# Interface de gerenciamento
/interface vlan add name=VLAN-MGMT vlan-id=100 interface=bridge

/ip address add address=192.168.100.2/24 interface=VLAN-MGMT

# Gateway e DNS
/ip route add dst-address=0.0.0.0/0 gateway=192.168.100.1
/ip dns set servers=8.8.8.8,8.8.4.4

# ==========================================
# 3. CONFIGURAÇÃO DA BRIDGE (Switch Chip)
# ==========================================
/interface bridge add name=bridge vlan-filtering=no

# Adicionar todas as portas à bridge
/interface bridge port
add bridge=bridge interface=ether1
add bridge=bridge interface=ether2
add bridge=bridge interface=ether3
add bridge=bridge interface=ether4
add bridge=bridge interface=ether5
add bridge=bridge interface=ether6
add bridge=bridge interface=ether7
add bridge=bridge interface=ether8
add bridge=bridge interface=ether9
add bridge=bridge interface=ether10
add bridge=bridge interface=ether11
add bridge=bridge interface=ether12
add bridge=bridge interface=ether13
add bridge=bridge interface=ether14
add bridge=bridge interface=ether15
add bridge=bridge interface=ether16
add bridge=bridge interface=ether17
add bridge=bridge interface=ether18
add bridge=bridge interface=ether19
add bridge=bridge interface=ether20
add bridge=bridge interface=ether21
add bridge=bridge interface=ether22
add bridge=bridge interface=ether23
add bridge=bridge interface=ether24
add bridge=bridge interface=sfp-sfpplus1
add bridge=bridge interface=sfp-sfpplus2

# ==========================================
# 4. CONFIGURAÇÃO DE VLANs
# ==========================================
# Criar VLANs
/interface bridge vlan
add bridge=bridge tagged=bridge,sfp-sfpplus1,sfp-sfpplus2 vlan-ids=100 comment="MGMT"
add bridge=bridge tagged=bridge,sfp-sfpplus1,sfp-sfpplus2 vlan-ids=10 comment="SERVIDORES"
add bridge=bridge tagged=bridge,sfp-sfpplus1,sfp-sfpplus2 vlan-ids=20 comment="USUARIOS"
add bridge=bridge tagged=bridge,sfp-sfpplus1,sfp-sfpplus2 vlan-ids=30 comment="VOIP"
add bridge=bridge tagged=bridge,sfp-sfpplus1,sfp-sfpplus2 vlan-ids=40 comment="WIFI"
add bridge=bridge tagged=bridge,sfp-sfpplus1,sfp-sfpplus2 vlan-ids=99 comment="NATIVE"

# ==========================================
# 5. ATRIBUIR VLANs ÀS PORTAS
# ==========================================
# Portas 1-6: Servidores (VLAN 10)
/interface bridge port
set [find interface=ether1] pvid=10 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether2] pvid=10 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether3] pvid=10 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether4] pvid=10 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether5] pvid=10 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether6] pvid=10 frame-types=admit-only-untagged-and-priority-tagged

# Portas 7-18: Usuários (VLAN 20)
set [find interface=ether7] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether8] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether9] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether10] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether11] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether12] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether13] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether14] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether15] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether16] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether17] pvid=20 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether18] pvid=20 frame-types=admit-only-untagged-and-priority-tagged

# Portas 19-22: VoIP (VLAN 30)
set [find interface=ether19] pvid=30 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether20] pvid=30 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether21] pvid=30 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether22] pvid=30 frame-types=admit-only-untagged-and-priority-tagged

# Portas 23-24: WiFi APs (VLAN 40)
set [find interface=ether23] pvid=40 frame-types=admit-only-untagged-and-priority-tagged
set [find interface=ether24] pvid=40 frame-types=admit-only-untagged-and-priority-tagged

# SFP+ como trunk (tagged todas VLANs)
set [find interface=sfp-sfpplus1] frame-types=admit-only-vlan-tagged
set [find interface=sfp-sfpplus2] frame-types=admit-only-vlan-tagged

# Adicionar VLANs untagged às portas
/interface bridge vlan
set [find vlan-ids=10] untagged=ether1,ether2,ether3,ether4,ether5,ether6
set [find vlan-ids=20] untagged=ether7,ether8,ether9,ether10,ether11,ether12,ether13,ether14,ether15,ether16,ether17,ether18
set [find vlan-ids=30] untagged=ether19,ether20,ether21,ether22
set [find vlan-ids=40] untagged=ether23,ether24

# ==========================================
# 6. ATIVAR VLAN FILTERING
# ==========================================
/interface bridge set bridge vlan-filtering=yes

# ==========================================
# 7. CONFIGURAÇÕES DE SEGURANÇA
# ==========================================
# Desabilitar serviços desnecessários
/ip service
set telnet disabled=yes
set ftp disabled=yes
set www disabled=no port=8080
set ssh port=2222
set api disabled=yes
set api-ssl disabled=yes
set winbox disabled=no

# Limitar acesso ao Winbox
/ip firewall filter
add chain=input action=accept protocol=tcp dst-port=8291 src-address=192.168.100.0/24 comment="Winbox - MGMT only"
add chain=input action=drop protocol=tcp dst-port=8291 comment="Block Winbox from other networks"

# ==========================================
# 8. SPANNING TREE (RSTP)
# ==========================================
/interface bridge set bridge protocol-mode=rstp priority=0x4000

# Configurar portas edge (dispositivos finais)
/interface bridge port
set [find interface=ether1] edge=yes point-to-point=yes
set [find interface=ether2] edge=yes point-to-point=yes
# ... repetir para portas de acesso

# Portas SFP+ como uplinks
set [find interface=sfp-sfpplus1] edge=no point-to-point=yes
set [find interface=sfp-sfpplus2] edge=no point-to-point=yes

# ==========================================
# 9. SNMP (Monitoramento)
# ==========================================
/snmp set enabled=yes contact="admin@empresa.com" location="Rack 01 - Sala TI"
/snmp community set [find default=yes] name=MinhaCommunity read-access=yes write-access=no

# ==========================================
# 10. NTP e LOG
# ==========================================
/system ntp client set enabled=yes
/system ntp client servers add address=a.ntp.br
/system ntp client servers add address=b.ntp.br

/system logging action set remote target=remote remote=192.168.100.10

# ==========================================
# 11. BACKUP AUTOMÁTICO
# ==========================================
/system scheduler add name=backup-diario interval=1d start-time=02:00:00 \\
  on-event="/system backup save name=([/system identity get name] . \\"-\\" . [:pick [/system clock get date] 0 11])"

# Exibir configuração final
/interface bridge vlan print
/interface bridge port print`,
    explicacao: `Este script configura completamente o CRS-326-24G-2S+ como switch gerenciável L2 com:

**1. Estrutura de VLANs:**
- VLAN 10: Servidores (portas 1-6)
- VLAN 20: Usuários (portas 7-18)
- VLAN 30: VoIP (portas 19-22)
- VLAN 40: WiFi (portas 23-24)
- VLAN 100: Gerenciamento
- SFP+ 1 e 2: Trunk (todas as VLANs tagged)

**2. Segurança:**
- Usuário admin personalizado
- Serviços desnecessários desabilitados
- Acesso Winbox restrito à VLAN de gerenciamento
- RSTP para prevenção de loops

**3. Monitoramento:**
- SNMP configurado
- Syslog remoto
- NTP sincronizado

**4. Manutenção:**
- Backup automático diário`,
    requisitos: [
      'RouterOS v7.x ou superior',
      'Acesso físico ou MAC-Telnet para configuração inicial',
      'Módulos SFP+ compatíveis para uplinks'
    ],
    observacoes: [
      'Altere as senhas antes de aplicar em produção',
      'Ajuste os IPs conforme sua rede',
      'O VLAN filtering só deve ser ativado após configurar todas as VLANs'
    ]
  },
  {
    id: 'crs326-lacp',
    titulo: 'CRS-326-24G-2S+ - LACP/Bonding',
    descricao: 'Configuração de Link Aggregation (LACP) nas portas SFP+ para alta disponibilidade',
    equipamento: 'CRS-326-24G-2S+',
    categoria: 'switch',
    tags: ['CRS', 'LACP', 'Bonding', 'HA'],
    codigo: `# ==========================================
# CRS-326 - Configuração LACP nos SFP+
# ==========================================

# Criar interface bonding LACP
/interface bonding add name=bond-uplink mode=802.3ad \\
  slaves=sfp-sfpplus1,sfp-sfpplus2 \\
  transmit-hash-policy=layer-3-and-4 \\
  lacp-rate=fast \\
  link-monitoring=mii \\
  mii-interval=100ms

# Remover portas SFP+ individuais da bridge
/interface bridge port remove [find interface=sfp-sfpplus1]
/interface bridge port remove [find interface=sfp-sfpplus2]

# Adicionar bonding à bridge
/interface bridge port add bridge=bridge interface=bond-uplink \\
  frame-types=admit-only-vlan-tagged

# Configurar VLANs para o bonding
/interface bridge vlan
set [find vlan-ids=10] tagged=([get [find vlan-ids=10] tagged],bond-uplink)
set [find vlan-ids=20] tagged=([get [find vlan-ids=20] tagged],bond-uplink)
set [find vlan-ids=30] tagged=([get [find vlan-ids=30] tagged],bond-uplink)
set [find vlan-ids=40] tagged=([get [find vlan-ids=40] tagged],bond-uplink)
set [find vlan-ids=100] tagged=([get [find vlan-ids=100] tagged],bond-uplink)

# Verificar status do bonding
/interface bonding monitor bond-uplink`,
    explicacao: `Configura Link Aggregation (802.3ad/LACP) combinando as duas portas SFP+ em um único link lógico de 20Gbps com redundância.

**Benefícios:**
- Largura de banda agregada (até 20Gbps)
- Failover automático se uma porta falhar
- Balanceamento de carga entre os links

**Hash Policy:**
- layer-3-and-4: Balanceia baseado em IP e porta (melhor para muitas conexões)`,
    requisitos: [
      'Switch/Router do outro lado deve suportar LACP',
      'Cabos SFP+ de mesma velocidade'
    ]
  },
  {
    id: 'crs326-port-isolation',
    titulo: 'CRS-326-24G-2S+ - Port Isolation (PVLAN)',
    descricao: 'Isolamento de portas para evitar comunicação entre clientes na mesma VLAN',
    equipamento: 'CRS-326-24G-2S+',
    categoria: 'switch',
    tags: ['CRS', 'PVLAN', 'Isolation', 'Security'],
    codigo: `# ==========================================
# CRS-326 - Port Isolation (Private VLAN)
# ==========================================
# Útil para redes de clientes onde cada porta
# só deve se comunicar com o gateway/uplink

# Criar horizonte de isolamento
/interface bridge port
set [find interface=ether7] horizon=1
set [find interface=ether8] horizon=1
set [find interface=ether9] horizon=1
set [find interface=ether10] horizon=1
set [find interface=ether11] horizon=1
set [find interface=ether12] horizon=1
set [find interface=ether13] horizon=1
set [find interface=ether14] horizon=1
set [find interface=ether15] horizon=1
set [find interface=ether16] horizon=1
set [find interface=ether17] horizon=1
set [find interface=ether18] horizon=1

# Uplinks sem isolamento (horizon=none ou diferente)
set [find interface=sfp-sfpplus1] horizon=none
set [find interface=sfp-sfpplus2] horizon=none

# Verificar configuração
/interface bridge port print`,
    explicacao: `Port Isolation impede que dispositivos no mesmo horizonte se comuniquem diretamente.

**Casos de uso:**
- ISPs: Clientes não podem ver tráfego de outros clientes
- Hotéis/Hotspots: Isolamento entre quartos/usuários
- Escritórios: Isolamento entre departamentos

**Como funciona:**
- Portas com mesmo horizon number não trocam tráfego entre si
- Portas com horizon=none podem se comunicar com todas`
  },
  {
    id: 'crs326-storm-control',
    titulo: 'CRS-326-24G-2S+ - Storm Control',
    descricao: 'Proteção contra broadcast/multicast storm limitando tráfego por porta',
    equipamento: 'CRS-326-24G-2S+',
    categoria: 'switch',
    tags: ['CRS', 'Storm', 'Broadcast', 'Protection'],
    codigo: `# ==========================================
# CRS-326 - Storm Control
# ==========================================

# Limitar broadcast, multicast e unknown unicast
# Valores em porcentagem da capacidade da porta

/interface ethernet
set ether1 bandwidth=1Gbps
set ether2 bandwidth=1Gbps
# ... para todas as portas de acesso

# Configurar limites de storm por porta usando switch rules
/interface ethernet switch rule
add switch=switch1 ports=ether1-ether24 \\
  rate=10M \\
  dst-mac-type=broadcast \\
  new-dst-ports="" \\
  copy-to-cpu=no \\
  comment="Broadcast limit 10Mbps"

add switch=switch1 ports=ether1-ether24 \\
  rate=5M \\
  dst-mac-type=multicast \\
  new-dst-ports="" \\
  copy-to-cpu=no \\
  comment="Multicast limit 5Mbps"

# Alternativa usando bridge filter (RouterOS 7)
/interface bridge filter
add chain=forward action=set-priority new-priority=1 \\
  mac-protocol=arp passthrough=yes
add chain=forward action=drop \\
  mac-protocol=arp arp-opcode=request \\
  limit=10,5:packet \\
  comment="ARP rate limit"`,
    explicacao: `Storm Control previne que loops ou dispositivos malconfigurados derrubem a rede com excesso de broadcast/multicast.

**Limites recomendados:**
- Broadcast: 5-10% da capacidade da porta
- Multicast: 2-5%
- Unknown unicast: 5%`
  },

  // ============ ROUTERS ============
  {
    id: 'rb4011-basic',
    titulo: 'RB4011 - Configuração Básica ISP',
    descricao: 'Configuração completa para provedor com NAT, DHCP, Firewall e controle de banda',
    equipamento: 'RB4011iGS+',
    categoria: 'router',
    tags: ['RB4011', 'ISP', 'NAT', 'Firewall'],
    codigo: `# ==========================================
# RB4011 - Configuração ISP Básica
# ==========================================

/system identity set name="RTR-BORDA-01"

# ==========================================
# 1. INTERFACES
# ==========================================
# ether1 = WAN (Link Operadora)
# ether2-10 = LAN / Clientes
# sfp-sfpplus1 = Link para Core Switch

/interface list add name=WAN
/interface list add name=LAN
/interface list member add interface=ether1 list=WAN
/interface list member add interface=ether2 list=LAN
/interface list member add interface=ether3 list=LAN
/interface list member add interface=ether4 list=LAN
/interface list member add interface=ether5 list=LAN

# ==========================================
# 2. BRIDGE PARA LAN
# ==========================================
/interface bridge add name=bridge-lan
/interface bridge port
add bridge=bridge-lan interface=ether2
add bridge=bridge-lan interface=ether3
add bridge=bridge-lan interface=ether4
add bridge=bridge-lan interface=ether5

# ==========================================
# 3. ENDEREÇAMENTO IP
# ==========================================
# WAN - IP da Operadora (ajuste conforme contrato)
/ip address add address=200.100.50.2/30 interface=ether1 comment="WAN - Operadora"

# LAN - Rede interna
/ip address add address=10.0.0.1/24 interface=bridge-lan comment="LAN Gateway"

# Rota padrão
/ip route add dst-address=0.0.0.0/0 gateway=200.100.50.1 comment="Default via Operadora"

# DNS
/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes

# ==========================================
# 4. DHCP SERVER
# ==========================================
/ip pool add name=pool-lan ranges=10.0.0.100-10.0.0.250

/ip dhcp-server add name=dhcp-lan interface=bridge-lan address-pool=pool-lan lease-time=1d

/ip dhcp-server network add address=10.0.0.0/24 gateway=10.0.0.1 dns-server=10.0.0.1

# ==========================================
# 5. NAT (Masquerade)
# ==========================================
/ip firewall nat add chain=srcnat out-interface-list=WAN action=masquerade comment="NAT para Internet"

# ==========================================
# 6. FIREWALL BÁSICO
# ==========================================
/ip firewall filter

# Input Chain
add chain=input action=accept connection-state=established,related comment="Accept established"
add chain=input action=drop connection-state=invalid comment="Drop invalid"
add chain=input action=accept protocol=icmp limit=10,5:packet comment="ICMP limited"
add chain=input action=accept src-address=10.0.0.0/24 comment="Accept from LAN"
add chain=input action=drop in-interface-list=WAN comment="Drop all from WAN"

# Forward Chain
add chain=forward action=accept connection-state=established,related comment="Accept established"
add chain=forward action=drop connection-state=invalid comment="Drop invalid"
add chain=forward action=accept in-interface=bridge-lan out-interface-list=WAN comment="LAN to WAN"
add chain=forward action=drop comment="Drop all other"

# ==========================================
# 7. SERVIÇOS E SEGURANÇA
# ==========================================
/ip service
set telnet disabled=yes
set ftp disabled=yes
set www disabled=yes
set api disabled=yes
set api-ssl disabled=yes
set ssh port=2222
set winbox port=8291

# Proteção contra port scan
/ip firewall filter add chain=input action=add-src-to-address-list \\
  address-list=port-scanners address-list-timeout=2w \\
  protocol=tcp psd=21,3s,3,1 comment="Port scanner detect"
add chain=input action=drop src-address-list=port-scanners comment="Drop port scanners"

# ==========================================
# 8. NTP E LOGGING
# ==========================================
/system ntp client set enabled=yes
/system ntp client servers add address=a.ntp.br

/system logging action add name=remote target=remote remote=10.0.0.10 remote-port=514
/system logging add topics=firewall action=remote`,
    explicacao: `Configuração completa de router de borda para ISP pequeno/médio com:

- Separação WAN/LAN com interface lists
- NAT masquerade para saída
- Firewall stateful com proteção básica
- DHCP server para rede interna
- Serviços seguros`
  },

  // ============ WIRELESS ============
  {
    id: 'capsman-basic',
    titulo: 'CAPsMAN v2 - Controlador Central',
    descricao: 'Configuração do CAPsMAN para gerenciar múltiplos APs MikroTik',
    equipamento: 'Qualquer RouterBoard',
    categoria: 'wireless',
    tags: ['CAPsMAN', 'Wireless', 'AP', 'Controller'],
    codigo: `# ==========================================
# CAPsMAN v2 - Configuração do Controlador
# ==========================================
# Este script configura o CAPsMAN no router central

# ==========================================
# 1. HABILITAR CAPsMAN
# ==========================================
/caps-man manager set enabled=yes

# ==========================================
# 2. CANAIS
# ==========================================
/caps-man channel
add name=ch-2ghz band=2ghz-g/n frequency=2437 extension-channel=Ce control-channel-width=20mhz
add name=ch-5ghz band=5ghz-n/ac frequency=5180 extension-channel=Ceee control-channel-width=20mhz

# ==========================================
# 3. DATAPATH (Como o tráfego flui)
# ==========================================
/caps-man datapath
add name=dp-bridge bridge=bridge-lan local-forwarding=no
add name=dp-guests bridge=bridge-guests local-forwarding=no client-to-client-forwarding=no

# ==========================================
# 4. SECURITY (Perfis de Segurança)
# ==========================================
/caps-man security
add name=sec-corp authentication-types=wpa2-psk encryption=aes-ccm passphrase="SenhaCorpSegura2024"
add name=sec-guest authentication-types=wpa2-psk encryption=aes-ccm passphrase="GuestWifi2024"

# ==========================================
# 5. CONFIGURAÇÕES (Perfis Completos)
# ==========================================
/caps-man configuration
add name=cfg-corp-2g mode=ap ssid="Empresa-Corp" datapath=dp-bridge security=sec-corp \\
  channel=ch-2ghz country=brazil installation=indoor
add name=cfg-corp-5g mode=ap ssid="Empresa-Corp-5G" datapath=dp-bridge security=sec-corp \\
  channel=ch-5ghz country=brazil installation=indoor
add name=cfg-guest mode=ap ssid="Empresa-Guest" datapath=dp-guests security=sec-guest \\
  channel=ch-2ghz country=brazil installation=indoor

# ==========================================
# 6. PROVISIONING (Auto-configuração de APs)
# ==========================================
/caps-man provisioning
add action=create-dynamic-enabled master-configuration=cfg-corp-2g slave-configurations=cfg-corp-5g,cfg-guest \\
  name-format=identity hw-supported-modes=gn
add action=create-dynamic-enabled master-configuration=cfg-corp-5g \\
  name-format=identity hw-supported-modes=an,ac

# ==========================================
# 7. ACCESS LIST (Opcional - Controle de MACs)
# ==========================================
/caps-man access-list
add mac-address=AA:BB:CC:DD:EE:FF interface=any action=accept comment="Dispositivo VIP"
add action=accept signal-range=-75..120 comment="Accept good signal"
add action=reject comment="Reject weak signal"

# ==========================================
# 8. VERIFICAR STATUS
# ==========================================
/caps-man interface print
/caps-man registration-table print
/caps-man remote-cap print`,
    explicacao: `CAPsMAN (Controlled Access Point system Manager) permite gerenciar centralmente todos os APs MikroTik.

**Vantagens:**
- Configuração centralizada
- Roaming transparente entre APs
- Monitoramento unificado
- Atualizações em massa

**Fluxo de tráfego:**
- local-forwarding=no: Tráfego passa pelo controlador
- local-forwarding=yes: Tráfego direto do AP (menor latência)`,
    requisitos: [
      'RouterOS v6.22+ ou v7.x',
      'APs compatíveis com CAP mode'
    ]
  },

  // ============ VPN ============
  {
    id: 'wireguard-s2s',
    titulo: 'WireGuard - Site-to-Site VPN',
    descricao: 'VPN WireGuard entre duas localidades com roteamento automático',
    equipamento: 'Qualquer RouterBoard',
    categoria: 'vpn',
    tags: ['WireGuard', 'VPN', 'S2S', 'Tunnel'],
    codigo: `# ==========================================
# WireGuard Site-to-Site VPN
# ==========================================
# SITE A: 192.168.1.0/24 - IP Público: 200.100.1.1
# SITE B: 192.168.2.0/24 - IP Público: 200.100.2.1

# ============ SITE A (Matriz) ============

# 1. Criar interface WireGuard
/interface wireguard add name=wg-siteb listen-port=13231 mtu=1420

# 2. Obter chave pública (anote para usar no Site B)
/interface wireguard print
# Copie o valor de "public-key"

# 3. Adicionar peer (Site B)
/interface wireguard peers add interface=wg-siteb \\
  public-key="CHAVE_PUBLICA_DO_SITE_B" \\
  endpoint-address=200.100.2.1 endpoint-port=13231 \\
  allowed-address=192.168.2.0/24,10.255.255.2/32 \\
  persistent-keepalive=25s

# 4. Endereço do túnel
/ip address add address=10.255.255.1/30 interface=wg-siteb

# 5. Rota para rede remota
/ip route add dst-address=192.168.2.0/24 gateway=wg-siteb

# 6. Firewall - Permitir WireGuard
/ip firewall filter add chain=input action=accept protocol=udp dst-port=13231 comment="WireGuard"
/ip firewall filter add chain=forward action=accept in-interface=wg-siteb comment="WireGuard forward"
/ip firewall filter add chain=forward action=accept out-interface=wg-siteb comment="WireGuard forward"

# ============ SITE B (Filial) ============

# 1. Criar interface WireGuard
/interface wireguard add name=wg-sitea listen-port=13231 mtu=1420

# 2. Obter chave pública (anote para usar no Site A)
/interface wireguard print

# 3. Adicionar peer (Site A)
/interface wireguard peers add interface=wg-sitea \\
  public-key="CHAVE_PUBLICA_DO_SITE_A" \\
  endpoint-address=200.100.1.1 endpoint-port=13231 \\
  allowed-address=192.168.1.0/24,10.255.255.1/32 \\
  persistent-keepalive=25s

# 4. Endereço do túnel
/ip address add address=10.255.255.2/30 interface=wg-sitea

# 5. Rota para rede remota
/ip route add dst-address=192.168.1.0/24 gateway=wg-sitea

# 6. Firewall - Permitir WireGuard
/ip firewall filter add chain=input action=accept protocol=udp dst-port=13231 comment="WireGuard"
/ip firewall filter add chain=forward action=accept in-interface=wg-sitea comment="WireGuard forward"
/ip firewall filter add chain=forward action=accept out-interface=wg-sitea comment="WireGuard forward"

# ============ VERIFICAR CONEXÃO ============
/interface wireguard peers print
/ping 10.255.255.2
/ping 192.168.2.1`,
    explicacao: `WireGuard é a VPN mais moderna e rápida disponível no RouterOS 7.

**Características:**
- Criptografia state-of-the-art (ChaCha20, Curve25519)
- Baixa latência e overhead
- Código auditado e simples
- Roaming automático

**Processo:**
1. Criar interfaces WireGuard em ambos os lados
2. Trocar chaves públicas
3. Configurar peers com allowed-address
4. Adicionar rotas para redes remotas`,
    requisitos: ['RouterOS v7.1+', 'IP público ou port-forward em ambos os lados']
  },

  // ============ QoS ============
  {
    id: 'qos-htb-isp',
    titulo: 'QoS com HTB - Controle de Banda ISP',
    descricao: 'Sistema completo de controle de banda para provedores com priorização',
    equipamento: 'Qualquer RouterBoard',
    categoria: 'qos',
    tags: ['QoS', 'HTB', 'Queue', 'ISP', 'Bandwidth'],
    codigo: `# ==========================================
# QoS HTB para ISP
# ==========================================
# Sistema de controle de banda com priorização
# de tráfego por tipo de serviço

# ==========================================
# 1. MANGLE - Marcação de Pacotes
# ==========================================
/ip firewall mangle

# Marcar conexões por tipo de tráfego
add chain=prerouting action=mark-connection new-connection-mark=voip_conn \\
  protocol=udp dst-port=5060-5061,10000-20000 passthrough=yes comment="VoIP"
add chain=prerouting action=mark-connection new-connection-mark=gaming_conn \\
  protocol=udp dst-port=3478-3480,27000-27050 passthrough=yes comment="Gaming"
add chain=prerouting action=mark-connection new-connection-mark=streaming_conn \\
  layer7-protocol=streaming passthrough=yes comment="Streaming"

# Marcar pacotes baseado nas conexões
add chain=prerouting action=mark-packet new-packet-mark=voip_pkt \\
  connection-mark=voip_conn passthrough=no
add chain=prerouting action=mark-packet new-packet-mark=gaming_pkt \\
  connection-mark=gaming_conn passthrough=no
add chain=prerouting action=mark-packet new-packet-mark=streaming_pkt \\
  connection-mark=streaming_conn passthrough=no
add chain=prerouting action=mark-packet new-packet-mark=default_pkt passthrough=no

# ==========================================
# 2. LAYER7 PROTOCOLS
# ==========================================
/ip firewall layer7-protocol
add name=streaming regexp="(netflix|youtube|twitch|hulu)"

# ==========================================
# 3. QUEUE TREE - Hierarquia HTB
# ==========================================
# Parent - Link total disponível
/queue tree add name=DOWNLOAD parent=bridge-lan max-limit=100M
/queue tree add name=UPLOAD parent=ether1 max-limit=50M

# Filas filhas com prioridades (1=maior, 8=menor)
# VoIP - Máxima prioridade
/queue tree add name=voip-down parent=DOWNLOAD packet-mark=voip_pkt \\
  priority=1 limit-at=2M max-limit=5M queue=pcq-download-default
/queue tree add name=voip-up parent=UPLOAD packet-mark=voip_pkt \\
  priority=1 limit-at=2M max-limit=5M queue=pcq-upload-default

# Gaming - Alta prioridade
/queue tree add name=gaming-down parent=DOWNLOAD packet-mark=gaming_pkt \\
  priority=2 limit-at=5M max-limit=20M queue=pcq-download-default
/queue tree add name=gaming-up parent=UPLOAD packet-mark=gaming_pkt \\
  priority=2 limit-at=2M max-limit=10M queue=pcq-upload-default

# Streaming - Prioridade média
/queue tree add name=streaming-down parent=DOWNLOAD packet-mark=streaming_pkt \\
  priority=4 limit-at=10M max-limit=50M queue=pcq-download-default

# Default - Prioridade normal
/queue tree add name=default-down parent=DOWNLOAD packet-mark=default_pkt \\
  priority=5 limit-at=10M max-limit=80M queue=pcq-download-default
/queue tree add name=default-up parent=UPLOAD packet-mark=default_pkt \\
  priority=5 limit-at=5M max-limit=40M queue=pcq-upload-default

# ==========================================
# 4. PCQ - Per Connection Queue
# ==========================================
/queue type
add name=pcq-download-default kind=pcq pcq-rate=0 pcq-classifier=dst-address
add name=pcq-upload-default kind=pcq pcq-rate=0 pcq-classifier=src-address

# ==========================================
# 5. SIMPLE QUEUES POR CLIENTE (Opcional)
# ==========================================
# Plano 50Mbps
/queue simple add name=cliente-001 target=10.0.0.100/32 \\
  max-limit=50M/50M burst-limit=60M/60M burst-threshold=40M/40M burst-time=10s/10s

# Plano 100Mbps
/queue simple add name=cliente-002 target=10.0.0.101/32 \\
  max-limit=100M/100M burst-limit=120M/120M burst-threshold=80M/80M burst-time=10s/10s`,
    explicacao: `Sistema QoS completo com HTB (Hierarchical Token Bucket) para ISPs.

**Hierarquia de Prioridades:**
1. VoIP (1) - Garantia de qualidade para chamadas
2. Gaming (2) - Baixa latência para jogos
3. Navegação (3) - Tráfego web normal
4. Streaming (4) - Netflix, YouTube
5. Default (5) - Todo o resto

**PCQ divide banda igualmente entre conexões ativas.**`
  },

  // ============ BACKUP ============
  {
    id: 'backup-auto',
    titulo: 'Backup Automático com Envio por Email',
    descricao: 'Script de backup automático com envio para servidor FTP e notificação por email',
    equipamento: 'Qualquer RouterBoard',
    categoria: 'backup',
    tags: ['Backup', 'Script', 'Automation', 'Email'],
    codigo: `# ==========================================
# Sistema de Backup Automático
# ==========================================

# ==========================================
# 1. CONFIGURAR EMAIL
# ==========================================
/tool e-mail set server=smtp.gmail.com port=587 \\
  from="router@empresa.com" \\
  user="router@empresa.com" \\
  password="app-password-aqui" \\
  tls=starttls

# ==========================================
# 2. SCRIPT DE BACKUP
# ==========================================
/system script add name=backup-completo source={
  :local sysname [/system identity get name]
  :local date [/system clock get date]
  :local time [/system clock get time]
  :local fileName ($sysname . "-" . [:pick $date 0 11] . "-backup")
  
  # Criar backup binário
  /system backup save name=$fileName dont-encrypt=yes
  :delay 3s
  
  # Criar export em texto
  /export file=($fileName . "-export")
  :delay 3s
  
  # Enviar por email
  :local backupFile ($fileName . ".backup")
  :local exportFile ($fileName . "-export.rsc")
  
  /tool e-mail send to="admin@empresa.com" \\
    subject=("Backup: " . $sysname . " - " . $date) \\
    body=("Backup automático realizado em " . $date . " às " . $time . "\\n\\nArquivos em anexo.") \\
    file=($backupFile . "," . $exportFile)
  
  :delay 10s
  
  # Upload para FTP (opcional)
  /tool fetch url="ftp://192.168.1.10/" \\
    user=backup password="senha123" \\
    src-path=$backupFile mode=ftp upload=yes
  
  # Limpar backups antigos (manter últimos 7)
  :local backupList [/file find name~"backup"]
  :if ([:len $backupList] > 14) do={
    :local oldest [/file find name~"backup"]
    /file remove [:pick $oldest 0 2]
  }
  
  :log info ("Backup completo: " . $fileName)
}

# ==========================================
# 3. AGENDAR EXECUÇÃO
# ==========================================
/system scheduler add name=backup-diario interval=1d start-time=03:00:00 \\
  on-event=backup-completo

/system scheduler add name=backup-semanal interval=7d start-time=04:00:00 \\
  on-event={
    /system script run backup-completo
    :log warning "Backup semanal executado"
  }

# ==========================================
# 4. BACKUP ANTES DE ATUALIZAÇÃO
# ==========================================
/system script add name=backup-pre-update source={
  :local sysname [/system identity get name]
  :local version [/system resource get version]
  :local fileName ($sysname . "-pre-update-" . $version)
  
  /system backup save name=$fileName
  /export file=$fileName
  
  :log warning ("Backup pré-atualização: " . $fileName)
}`,
    explicacao: `Sistema completo de backup automático com:

**Funcionalidades:**
- Backup binário (.backup) para restore rápido
- Export texto (.rsc) para referência e diff
- Envio por email com anexos
- Upload para servidor FTP
- Limpeza automática de backups antigos
- Agendamento diário e semanal

**Dicas:**
- Use App Password do Gmail (não a senha normal)
- Teste o envio de email antes de confiar no backup`
  },
];
