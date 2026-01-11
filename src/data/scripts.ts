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
  { id: 'vm', nome: 'VMs', descricao: 'Gerenciamento de máquinas virtuais KVM', icone: 'Monitor' },
  { id: 'container', nome: 'Containers', descricao: 'Gerenciamento de containers LXC', icone: 'Box' },
  { id: 'storage', nome: 'Storage', descricao: 'Configuração de armazenamento e ZFS', icone: 'HardDrive' },
  { id: 'network', nome: 'Rede', descricao: 'Configuração de bridges, VLANs e bonding', icone: 'Network' },
  { id: 'backup', nome: 'Backup', descricao: 'Scripts de backup e restore', icone: 'Save' },
  { id: 'cluster', nome: 'Cluster', descricao: 'Alta disponibilidade e clustering', icone: 'Server' },
  { id: 'monitor', nome: 'Monitoramento', descricao: 'Scripts de monitoramento e alertas', icone: 'Activity' },
  { id: 'automation', nome: 'Automação', descricao: 'Scripts de automação e manutenção', icone: 'Cog' },
];

export const SCRIPTS: Script[] = [
  // ============ VMs ============
  {
    id: 'vm-create-basic',
    titulo: 'Criar VM Básica',
    descricao: 'Script para criar uma VM com configurações padrão otimizadas',
    equipamento: 'Proxmox VE',
    categoria: 'vm',
    tags: ['qm', 'VM', 'KVM', 'criar'],
    codigo: `#!/bin/bash
# ==========================================
# Criar VM com configurações otimizadas
# ==========================================

VMID=\${1:-100}
NAME=\${2:-"vm-linux"}
MEMORY=\${3:-2048}
CORES=\${4:-2}
STORAGE=\${5:-"local-lvm"}
ISO=\${6:-"local:iso/ubuntu-22.04.iso"}

# Criar a VM
qm create $VMID \\
  --name $NAME \\
  --memory $MEMORY \\
  --cores $CORES \\
  --cpu host \\
  --net0 virtio,bridge=vmbr0 \\
  --scsihw virtio-scsi-single \\
  --scsi0 $STORAGE:32,iothread=1,discard=on \\
  --ide2 $ISO,media=cdrom \\
  --boot order=scsi0\\;ide2 \\
  --ostype l26 \\
  --agent enabled=1

echo "VM $VMID ($NAME) criada com sucesso!"
echo "Para iniciar: qm start $VMID"`,
    explicacao: `Este script cria uma VM otimizada com:

**Configurações:**
- CPU tipo host para máximo desempenho
- Rede VirtIO para melhor throughput
- Disco SCSI com VirtIO e iothread
- Discard habilitado para TRIM/unmap
- QEMU Guest Agent habilitado

**Parâmetros:**
1. VMID (padrão: 100)
2. Nome (padrão: vm-linux)
3. Memória em MB (padrão: 2048)
4. Cores (padrão: 2)
5. Storage (padrão: local-lvm)
6. ISO (padrão: Ubuntu 22.04)`,
    requisitos: [
      'Proxmox VE 7.x ou superior',
      'ISO disponível no storage',
      'VMID não utilizado',
    ],
    observacoes: [
      'Ajuste o VMID conforme sua numeração',
      'Instale o qemu-guest-agent na VM para recursos avançados',
    ],
  },
  {
    id: 'vm-clone-template',
    titulo: 'Clone de Template',
    descricao: 'Clonar rapidamente VMs a partir de templates',
    equipamento: 'Proxmox VE',
    categoria: 'vm',
    tags: ['qm', 'clone', 'template', 'linked'],
    codigo: `#!/bin/bash
# ==========================================
# Clone de VM a partir de template
# ==========================================

TEMPLATE_ID=\${1:-9000}
NEW_VMID=\${2:-101}
NEW_NAME=\${3:-"vm-clone"}
FULL_CLONE=\${4:-0}  # 0=linked, 1=full

if [ "$FULL_CLONE" -eq 1 ]; then
  echo "Criando clone completo..."
  qm clone $TEMPLATE_ID $NEW_VMID --name $NEW_NAME --full
else
  echo "Criando linked clone..."
  qm clone $TEMPLATE_ID $NEW_VMID --name $NEW_NAME
fi

# Configurar após clone
qm set $NEW_VMID --onboot 0

echo "Clone $NEW_VMID ($NEW_NAME) criado!"
echo "Para personalizar: qm set $NEW_VMID --<opção> <valor>"`,
    explicacao: `Script para clonar VMs rapidamente.

**Tipos de Clone:**
- **Linked Clone**: Rápido, ocupa menos espaço, depende do template
- **Full Clone**: Independente, ocupa mais espaço, pode ser migrado livremente

**Uso recomendado:**
- Linked clone para ambientes de teste
- Full clone para produção`,
    requisitos: ['Template existente convertido com qm template'],
  },
  {
    id: 'vm-bulk-operations',
    titulo: 'Operações em Lote',
    descricao: 'Iniciar, parar ou reiniciar múltiplas VMs',
    equipamento: 'Proxmox VE',
    categoria: 'vm',
    tags: ['qm', 'bulk', 'start', 'stop'],
    codigo: `#!/bin/bash
# ==========================================
# Operações em lote de VMs
# ==========================================

ACTION=\${1:-status}  # start, stop, shutdown, reboot, status
VMIDS="\${@:2}"       # Lista de VMIDs ou 'all'

if [ -z "$VMIDS" ] || [ "$VMIDS" = "all" ]; then
  VMIDS=$(qm list | awk 'NR>1 {print $1}')
fi

for VMID in $VMIDS; do
  case $ACTION in
    start)
      echo "Iniciando VM $VMID..."
      qm start $VMID
      ;;
    stop)
      echo "Parando VM $VMID (forçado)..."
      qm stop $VMID
      ;;
    shutdown)
      echo "Desligando VM $VMID (graceful)..."
      qm shutdown $VMID
      ;;
    reboot)
      echo "Reiniciando VM $VMID..."
      qm reboot $VMID
      ;;
    status)
      qm status $VMID
      ;;
    *)
      echo "Ação inválida: $ACTION"
      echo "Uso: $0 <start|stop|shutdown|reboot|status> [vmids ou 'all']"
      exit 1
      ;;
  esac
done`,
    explicacao: `Script para operações em massa em VMs.

**Ações disponíveis:**
- start: Inicia as VMs
- stop: Para imediatamente (forçado)
- shutdown: Desliga graciosamente via ACPI
- reboot: Reinicia as VMs
- status: Mostra status atual

**Exemplos:**
- \`./script.sh start 100 101 102\`
- \`./script.sh shutdown all\``,
  },

  // ============ CONTAINERS ============
  {
    id: 'ct-create-basic',
    titulo: 'Criar Container LXC',
    descricao: 'Script para criar container com configurações otimizadas',
    equipamento: 'Proxmox VE',
    categoria: 'container',
    tags: ['pct', 'LXC', 'container', 'criar'],
    codigo: `#!/bin/bash
# ==========================================
# Criar Container LXC
# ==========================================

CTID=\${1:-200}
NAME=\${2:-"ct-ubuntu"}
TEMPLATE=\${3:-"local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst"}
STORAGE=\${4:-"local-lvm"}
MEMORY=\${5:-512}
CORES=\${6:-1}
DISK=\${7:-8}
PASSWORD=\${8:-"changeme"}

pct create $CTID $TEMPLATE \\
  --hostname $NAME \\
  --storage $STORAGE \\
  --rootfs $STORAGE:$DISK \\
  --memory $MEMORY \\
  --cores $CORES \\
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \\
  --password $PASSWORD \\
  --unprivileged 1 \\
  --features nesting=1 \\
  --onboot 0 \\
  --start 0

echo "Container $CTID ($NAME) criado!"
echo "Para iniciar: pct start $CTID"
echo "Para acessar: pct enter $CTID"`,
    explicacao: `Cria container LXC com boas práticas:

**Configurações:**
- Modo unprivileged (mais seguro)
- Nesting habilitado (permite Docker)
- DHCP para rede
- Não inicia automaticamente

**Parâmetros:**
1. CTID
2. Hostname
3. Template
4. Storage
5. Memória (MB)
6. Cores
7. Disco (GB)
8. Senha root`,
    requisitos: ['Template baixado via pveam'],
  },
  {
    id: 'ct-docker-ready',
    titulo: 'Container Docker-Ready',
    descricao: 'Container LXC configurado para rodar Docker',
    equipamento: 'Proxmox VE',
    categoria: 'container',
    tags: ['pct', 'LXC', 'Docker', 'nesting'],
    codigo: `#!/bin/bash
# ==========================================
# Container LXC pronto para Docker
# ==========================================

CTID=\${1:-201}
NAME=\${2:-"docker-host"}
TEMPLATE="local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"

# Criar container com features necessárias
pct create $CTID $TEMPLATE \\
  --hostname $NAME \\
  --storage local-lvm \\
  --rootfs local-lvm:16 \\
  --memory 2048 \\
  --cores 2 \\
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \\
  --unprivileged 1 \\
  --features keyctl=1,nesting=1 \\
  --onboot 1

# Iniciar container
pct start $CTID

# Aguardar inicialização
sleep 5

# Instalar Docker dentro do container
pct exec $CTID -- bash -c '
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
'

echo "Container Docker-ready criado!"
echo "Acesse: pct enter $CTID"
echo "Teste: docker run hello-world"`,
    explicacao: `Container otimizado para Docker:

**Features habilitadas:**
- keyctl: Necessário para alguns containers
- nesting: Permite containers dentro do LXC

**Instalação automática:**
- Docker CE
- Docker Compose plugin
- Docker Buildx

**Segurança:**
- Modo unprivileged
- Isolamento mantido`,
    requisitos: [
      'Template Debian 12 disponível',
      'Conexão com internet',
    ],
    observacoes: [
      'Alguns containers podem precisar de privileged mode',
      'Para GPU passthrough, use VM KVM',
    ],
  },

  // ============ STORAGE ============
  {
    id: 'zfs-pool-create',
    titulo: 'Criar Pool ZFS',
    descricao: 'Criar pool ZFS com diferentes níveis de RAID',
    equipamento: 'Proxmox VE',
    categoria: 'storage',
    tags: ['ZFS', 'pool', 'RAID', 'storage'],
    codigo: `#!/bin/bash
# ==========================================
# Criar Pool ZFS
# ==========================================

POOL_NAME=\${1:-"tank"}
RAID_TYPE=\${2:-"raidz1"}  # mirror, raidz1, raidz2, raidz3
DISKS="\${@:3}"            # /dev/sdb /dev/sdc /dev/sdd

if [ -z "$DISKS" ]; then
  echo "Uso: $0 <pool_name> <raid_type> <discos...>"
  echo "Tipos: mirror, raidz1, raidz2, raidz3, stripe"
  echo "Exemplo: $0 tank raidz1 /dev/sdb /dev/sdc /dev/sdd"
  exit 1
fi

echo "Criando pool ZFS: $POOL_NAME ($RAID_TYPE)"
echo "Discos: $DISKS"
echo ""
read -p "Confirmar? (s/N): " CONFIRM
[ "$CONFIRM" != "s" ] && exit 1

# Criar pool
if [ "$RAID_TYPE" = "stripe" ]; then
  zpool create -f $POOL_NAME $DISKS
else
  zpool create -f $POOL_NAME $RAID_TYPE $DISKS
fi

# Configurações otimizadas
zfs set compression=lz4 $POOL_NAME
zfs set atime=off $POOL_NAME
zfs set xattr=sa $POOL_NAME
zfs set acltype=posixacl $POOL_NAME

# Adicionar ao Proxmox
pvesm add zfspool $POOL_NAME-storage -pool $POOL_NAME

echo ""
echo "Pool criado com sucesso!"
zpool status $POOL_NAME`,
    explicacao: `Cria pool ZFS otimizado para Proxmox:

**Níveis de RAID:**
- mirror: Espelhamento (mínimo 2 discos)
- raidz1: RAID-5 (tolera 1 falha)
- raidz2: RAID-6 (tolera 2 falhas)
- raidz3: Tolera 3 falhas
- stripe: Sem redundância (máximo desempenho)

**Otimizações aplicadas:**
- Compressão LZ4 (transparente)
- atime desabilitado
- ACLs POSIX habilitadas`,
    requisitos: ['Discos dedicados (serão formatados)'],
    observacoes: [
      'RAIDZ1 precisa mínimo 3 discos',
      'RAIDZ2 precisa mínimo 4 discos',
    ],
  },
  {
    id: 'zfs-snapshot-auto',
    titulo: 'Snapshots ZFS Automáticos',
    descricao: 'Script para snapshots automáticos com retenção',
    equipamento: 'Proxmox VE',
    categoria: 'storage',
    tags: ['ZFS', 'snapshot', 'automação', 'backup'],
    codigo: `#!/bin/bash
# ==========================================
# Snapshots ZFS Automáticos
# ==========================================

DATASET=\${1:-"rpool/data"}
RETENTION_HOURLY=\${2:-24}
RETENTION_DAILY=\${3:-7}
RETENTION_WEEKLY=\${4:-4}

DATE=$(date +%Y-%m-%d_%H-%M)
TYPE="auto"

# Determinar tipo baseado na hora
HOUR=$(date +%H)
DOW=$(date +%u)

if [ "$HOUR" = "00" ] && [ "$DOW" = "7" ]; then
  TYPE="weekly"
elif [ "$HOUR" = "00" ]; then
  TYPE="daily"
else
  TYPE="hourly"
fi

SNAP_NAME="$DATASET@${TYPE}_$DATE"

# Criar snapshot
echo "Criando snapshot: $SNAP_NAME"
zfs snapshot $SNAP_NAME

# Limpar snapshots antigos
cleanup_snapshots() {
  local pattern=$1
  local keep=$2
  
  zfs list -t snapshot -o name -s creation | grep "$DATASET@${pattern}" | head -n -$keep | while read snap; do
    echo "Removendo: $snap"
    zfs destroy $snap
  done
}

cleanup_snapshots "hourly" $RETENTION_HOURLY
cleanup_snapshots "daily" $RETENTION_DAILY
cleanup_snapshots "weekly" $RETENTION_WEEKLY

echo "Snapshots atuais:"
zfs list -t snapshot -o name,creation,used | grep $DATASET`,
    explicacao: `Gerencia snapshots ZFS com retenção:

**Tipos de snapshot:**
- Hourly: A cada hora (mantém 24)
- Daily: Meia-noite (mantém 7)
- Weekly: Domingo meia-noite (mantém 4)

**Para automatizar, adicione ao crontab:**
\`\`\`
0 * * * * /root/zfs-snapshot.sh rpool/data
\`\`\``,
  },

  // ============ NETWORK ============
  {
    id: 'network-vlan-bridge',
    titulo: 'Bridge com VLAN',
    descricao: 'Configurar bridge VLAN-aware para múltiplas redes',
    equipamento: 'Proxmox VE',
    categoria: 'network',
    tags: ['VLAN', 'bridge', 'rede', 'vmbr'],
    codigo: `#!/bin/bash
# ==========================================
# Configurar Bridge VLAN-Aware
# ==========================================

# Este script gera configuração para /etc/network/interfaces

cat << 'EOF'
# /etc/network/interfaces - VLAN-Aware Bridge

auto lo
iface lo inet loopback

# Interface física
auto eno1
iface eno1 inet manual

# Bridge VLAN-aware principal
auto vmbr0
iface vmbr0 inet static
    address 192.168.1.10/24
    gateway 192.168.1.1
    bridge-ports eno1
    bridge-stp off
    bridge-fd 0
    bridge-vlan-aware yes
    bridge-vids 2-4094

# VLANs configuradas:
# VLAN 10: Servidores (192.168.10.0/24)
# VLAN 20: Usuários (192.168.20.0/24)
# VLAN 30: DMZ (192.168.30.0/24)
# VLAN 100: Gerenciamento (192.168.100.0/24)

# Para VMs, configure:
# - net0: virtio,bridge=vmbr0,tag=10
EOF

echo ""
echo "Copie a configuração acima para /etc/network/interfaces"
echo "Depois execute: ifreload -a"`,
    explicacao: `Configura bridge VLAN-aware:

**Vantagens:**
- Uma única bridge para todas VLANs
- Configuração simplificada
- Melhor desempenho que múltiplas bridges

**Na VM, configure a VLAN via:**
- Interface web: Hardware > Network > VLAN Tag
- CLI: qm set <vmid> --net0 virtio,bridge=vmbr0,tag=10`,
  },
  {
    id: 'network-bonding',
    titulo: 'Bonding de Interfaces',
    descricao: 'Configurar agregação de links para redundância',
    equipamento: 'Proxmox VE',
    categoria: 'network',
    tags: ['bonding', 'LACP', 'redundância', 'rede'],
    codigo: `#!/bin/bash
# ==========================================
# Configurar Bonding
# ==========================================

cat << 'EOF'
# /etc/network/interfaces - Bonding Configuration

auto lo
iface lo inet loopback

# Interfaces físicas
auto eno1
iface eno1 inet manual

auto eno2
iface eno2 inet manual

# Bonding - Mode 1 (active-backup) para failover
auto bond0
iface bond0 inet manual
    bond-slaves eno1 eno2
    bond-miimon 100
    bond-mode active-backup
    bond-primary eno1

# Bridge sobre o bonding
auto vmbr0
iface vmbr0 inet static
    address 192.168.1.10/24
    gateway 192.168.1.1
    bridge-ports bond0
    bridge-stp off
    bridge-fd 0

# ==========================================
# Modos de Bonding Alternativos:
# ==========================================
# mode 0 (balance-rr): Round-robin
# mode 1 (active-backup): Failover
# mode 2 (balance-xor): XOR hash
# mode 4 (802.3ad): LACP - requer switch
# mode 5 (balance-tlb): Transmit load balancing
# mode 6 (balance-alb): Adaptive load balancing
EOF

echo ""
echo "Mode 1 (active-backup) não requer configuração no switch"
echo "Mode 4 (802.3ad/LACP) requer switch com LACP habilitado"`,
    explicacao: `Configura agregação de interfaces:

**Modos mais usados:**
- **active-backup**: Failover simples, não requer switch
- **802.3ad (LACP)**: Agregação real, requer switch compatível

**Benefícios:**
- Redundância de link
- Maior throughput (com LACP)
- Failover automático`,
    requisitos: ['Duas ou mais interfaces de rede'],
    observacoes: ['LACP requer configuração no switch também'],
  },

  // ============ BACKUP ============
  {
    id: 'backup-vzdump-all',
    titulo: 'Backup de Todas VMs/CTs',
    descricao: 'Script para backup completo de todas as VMs e containers',
    equipamento: 'Proxmox VE',
    categoria: 'backup',
    tags: ['vzdump', 'backup', 'automação'],
    codigo: `#!/bin/bash
# ==========================================
# Backup de Todas VMs/CTs
# ==========================================

STORAGE=\${1:-"local"}
MODE=\${2:-"snapshot"}  # snapshot, suspend, stop
COMPRESS=\${3:-"zstd"}
MAILTO=\${4:-"admin@example.com"}

# Diretório de backup
BACKUP_DIR="/var/lib/vz/dump"
LOG_FILE="/var/log/backup-$(date +%Y%m%d).log"

echo "=== Backup iniciado: $(date) ===" | tee -a $LOG_FILE

# Listar todas VMs e CTs
VMS=$(qm list | awk 'NR>1 {print $1}')
CTS=$(pct list | awk 'NR>1 {print $1}')

# Backup VMs
for VMID in $VMS; do
  echo "Backup VM $VMID..." | tee -a $LOG_FILE
  vzdump $VMID \\
    --storage $STORAGE \\
    --mode $MODE \\
    --compress $COMPRESS \\
    --mailto $MAILTO \\
    --mailnotification always \\
    2>&1 | tee -a $LOG_FILE
done

# Backup Containers
for CTID in $CTS; do
  echo "Backup CT $CTID..." | tee -a $LOG_FILE
  vzdump $CTID \\
    --storage $STORAGE \\
    --mode $MODE \\
    --compress $COMPRESS \\
    --mailto $MAILTO \\
    --mailnotification always \\
    2>&1 | tee -a $LOG_FILE
done

echo "=== Backup finalizado: $(date) ===" | tee -a $LOG_FILE

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.vma*" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar*" -mtime +7 -delete

echo "Backups antigos removidos" | tee -a $LOG_FILE`,
    explicacao: `Backup automatizado de todo o ambiente:

**Modos de backup:**
- snapshot: Menor interrupção, requer storage compatível
- suspend: Pausa VM durante backup
- stop: Para VM durante backup (mais consistente)

**Compressão:**
- zstd: Melhor relação velocidade/compressão
- lzo: Mais rápido
- gzip: Mais compacto`,
    requisitos: ['Storage com espaço suficiente'],
  },

  // ============ CLUSTER ============
  {
    id: 'cluster-create',
    titulo: 'Criar Cluster',
    descricao: 'Script para criar e adicionar nós ao cluster',
    equipamento: 'Proxmox VE',
    categoria: 'cluster',
    tags: ['cluster', 'pvecm', 'HA', 'corosync'],
    codigo: `#!/bin/bash
# ==========================================
# Criar/Gerenciar Cluster Proxmox
# ==========================================

ACTION=\${1:-help}
CLUSTER_NAME=\${2:-"proxmox-cluster"}
NODE_IP=\${2:-""}

case $ACTION in
  create)
    echo "Criando cluster: $CLUSTER_NAME"
    pvecm create $CLUSTER_NAME
    echo ""
    echo "Cluster criado! Para adicionar nós:"
    echo "No novo nó, execute: pvecm add $(hostname -I | awk '{print $1}')"
    ;;
    
  add)
    if [ -z "$NODE_IP" ]; then
      echo "Uso: $0 add <IP_do_primeiro_nó>"
      exit 1
    fi
    echo "Adicionando este nó ao cluster em $NODE_IP"
    pvecm add $NODE_IP
    ;;
    
  status)
    echo "=== Status do Cluster ==="
    pvecm status
    echo ""
    echo "=== Nós do Cluster ==="
    pvecm nodes
    ;;
    
  expected)
    # Ajustar expected votes (útil para manutenção)
    VOTES=\${2:-1}
    echo "Ajustando expected votes para $VOTES"
    pvecm expected $VOTES
    ;;
    
  *)
    echo "Uso: $0 <create|add|status|expected> [parâmetros]"
    echo ""
    echo "Ações:"
    echo "  create <nome>      - Criar novo cluster"
    echo "  add <ip>           - Adicionar este nó ao cluster"
    echo "  status             - Ver status do cluster"
    echo "  expected <votes>   - Ajustar expected votes"
    ;;
esac`,
    explicacao: `Gerenciamento de cluster Proxmox:

**Requisitos para cluster:**
- Mínimo 3 nós para quorum (ou 2 + quorum device)
- Rede dedicada para corosync (recomendado)
- Mesmo DNS/hostname resolvível

**Ordem de criação:**
1. Criar cluster no primeiro nó
2. Adicionar demais nós

**IMPORTANTE:** Backups antes de qualquer operação de cluster!`,
    requisitos: [
      'IPs fixos em todos os nós',
      'Portas 5404-5405 UDP abertas',
      'SSH root entre nós',
    ],
  },

  // ============ MONITORAMENTO ============
  {
    id: 'monitor-resources',
    titulo: 'Monitor de Recursos',
    descricao: 'Script para monitorar uso de recursos do host',
    equipamento: 'Proxmox VE',
    categoria: 'monitor',
    tags: ['monitoramento', 'recursos', 'CPU', 'RAM'],
    codigo: `#!/bin/bash
# ==========================================
# Monitor de Recursos Proxmox
# ==========================================

clear
echo "=========================================="
echo "        MONITOR PROXMOX VE"
echo "=========================================="
echo ""

# CPU
echo "=== CPU ==="
echo "Load: $(cat /proc/loadavg | awk '{print $1, $2, $3}')"
echo "Cores: $(nproc)"
echo ""

# Memória
echo "=== MEMÓRIA ==="
free -h | grep -E "^Mem|^Swap"
echo ""

# Storage
echo "=== STORAGE ==="
df -h | grep -E "^/dev|^rpool|^tank"
echo ""

# ZFS (se disponível)
if command -v zpool &> /dev/null; then
  echo "=== ZFS POOLS ==="
  zpool list
  echo ""
fi

# VMs rodando
echo "=== VMs RODANDO ==="
qm list | grep running
echo ""

# Containers rodando
echo "=== CONTAINERS RODANDO ==="
pct list | grep running
echo ""

# Rede
echo "=== REDE ==="
ip -br addr | grep -E "^vmbr|^bond|^eth|^eno"
echo ""

# Atualizações pendentes
echo "=== ATUALIZAÇÕES ==="
apt list --upgradable 2>/dev/null | head -5
echo ""

echo "=========================================="
echo "Atualizado em: $(date)"`,
    explicacao: `Visão rápida do estado do sistema:

**Informações exibidas:**
- Load average e cores
- Uso de memória RAM e Swap
- Espaço em disco/ZFS
- VMs e containers em execução
- Interfaces de rede
- Atualizações pendentes`,
  },

  // ============ AUTOMAÇÃO ============
  {
    id: 'automation-maintenance',
    titulo: 'Manutenção Automatizada',
    descricao: 'Script de manutenção diária do Proxmox',
    equipamento: 'Proxmox VE',
    categoria: 'automation',
    tags: ['manutenção', 'limpeza', 'automação', 'cron'],
    codigo: `#!/bin/bash
# ==========================================
# Manutenção Automatizada Proxmox
# ==========================================

LOG="/var/log/proxmox-maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log() {
  echo "[$DATE] $1" | tee -a $LOG
}

log "=== Iniciando manutenção ==="

# 1. Limpar cache APT
log "Limpando cache APT..."
apt-get clean
apt-get autoclean

# 2. Remover kernels antigos (manter 2 últimos)
log "Verificando kernels antigos..."
dpkg --list | grep linux-image | awk '{print $2}' | sort -V | head -n -2 | xargs -r apt-get -y purge

# 3. Limpar logs antigos
log "Rotacionando logs..."
logrotate -f /etc/logrotate.conf

# 4. Limpar task logs do Proxmox (manter 30 dias)
log "Limpando task logs antigos..."
find /var/log/pve/tasks -type f -mtime +30 -delete

# 5. Verificar ZFS (se disponível)
if command -v zpool &> /dev/null; then
  log "Verificando pools ZFS..."
  zpool scrub rpool &
fi

# 6. Verificar espaço em disco
USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$USAGE" -gt 80 ]; then
  log "ALERTA: Disco raiz com $USAGE% de uso!"
fi

# 7. Atualizar lista de pacotes
log "Atualizando lista de pacotes..."
apt-get update

# 8. Listar atualizações disponíveis
UPDATES=$(apt list --upgradable 2>/dev/null | wc -l)
log "Atualizações disponíveis: $((UPDATES-1))"

log "=== Manutenção concluída ==="

# Para agendar, adicione ao crontab:
# 0 3 * * * /root/maintenance.sh`,
    explicacao: `Script de manutenção para rodar periodicamente:

**Tarefas executadas:**
- Limpa cache do APT
- Remove kernels antigos
- Rotaciona logs
- Limpa task logs antigos
- Inicia scrub do ZFS
- Verifica espaço em disco
- Lista atualizações

**Para agendar:**
\`crontab -e\`
\`0 3 * * * /root/maintenance.sh\``,
  },
];
