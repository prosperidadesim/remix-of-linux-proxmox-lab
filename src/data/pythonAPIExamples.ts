// Exemplos de uso da API Python do Proxmox VE (proxmoxer)

export const PYTHON_API_INTRO = `
# Instalação da biblioteca
# pip install proxmoxer requests

from proxmoxer import ProxmoxAPI

# Conexão com o Proxmox VE
proxmox = ProxmoxAPI(
    'pve.example.com',  # Hostname ou IP
    user='root@pam',     # Usuário
    password='senha',    # Senha (ou use token_name/token_value)
    verify_ssl=False     # True em produção com certificado válido
)

# Conexão alternativa com API Token (recomendado)
proxmox = ProxmoxAPI(
    'pve.example.com',
    user='root@pam',
    token_name='automation',
    token_value='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    verify_ssl=False
)
`;

export const PYTHON_API_EXAMPLES = {
  // Conexão
  conexao: {
    titulo: 'Conexão com Proxmox VE',
    descricao: 'Como estabelecer conexão com a API do Proxmox usando Python',
    codigo: `from proxmoxer import ProxmoxAPI

# Conexão com senha
proxmox = ProxmoxAPI(
    'pve.example.com',
    user='root@pam',
    password='sua_senha',
    verify_ssl=False
)

# Conexão com API Token (mais seguro)
proxmox = ProxmoxAPI(
    'pve.example.com',
    user='root@pam',
    token_name='automation',
    token_value='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    verify_ssl=False
)

# Testar conexão
print(proxmox.version.get())`,
    saida: `{'version': '8.1.3', 'release': '8.1', 'repoid': 'xxxx'}`,
  },

  // Nodes
  nodes_list: {
    titulo: 'Listar Nós do Cluster',
    descricao: 'Obter informações de todos os nós do cluster',
    codigo: `# Listar todos os nós
for node in proxmox.nodes.get():
    print(f"Node: {node['node']}")
    print(f"  Status: {node['status']}")
    print(f"  CPU: {node.get('cpu', 0)*100:.1f}%")
    print(f"  Memória: {node.get('mem', 0)/1024/1024/1024:.1f}GB / {node.get('maxmem', 0)/1024/1024/1024:.1f}GB")
    print(f"  Uptime: {node.get('uptime', 0)//3600}h")
    print()`,
    saida: `Node: pve1
  Status: online
  CPU: 15.3%
  Memória: 24.5GB / 64.0GB
  Uptime: 720h`,
  },

  // VMs
  vm_list: {
    titulo: 'Listar Máquinas Virtuais',
    descricao: 'Obter lista de todas as VMs em um nó',
    codigo: `# Listar VMs de um nó específico
node = 'pve1'
for vm in proxmox.nodes(node).qemu.get():
    status = vm.get('status', 'unknown')
    print(f"VMID: {vm['vmid']} - {vm['name']}")
    print(f"  Status: {status}")
    print(f"  Memória: {vm.get('maxmem', 0)/1024/1024/1024:.1f}GB")
    print(f"  Disco: {vm.get('maxdisk', 0)/1024/1024/1024:.1f}GB")
    print(f"  CPUs: {vm.get('cpus', 1)}")
    print()`,
    saida: `VMID: 100 - ubuntu-server
  Status: running
  Memória: 4.0GB
  Disco: 32.0GB
  CPUs: 2`,
  },

  vm_create: {
    titulo: 'Criar Máquina Virtual',
    descricao: 'Criar uma nova VM via API',
    codigo: `# Criar nova VM
node = 'pve1'
vmid = 105
storage = 'local-lvm'

proxmox.nodes(node).qemu.create(
    vmid=vmid,
    name='vm-api-test',
    memory=2048,
    cores=2,
    sockets=1,
    cpu='host',
    net0='virtio,bridge=vmbr0',
    scsihw='virtio-scsi-single',
    scsi0=f'{storage}:32',
    ostype='l26',
    agent='enabled=1'
)

print(f"VM {vmid} criada com sucesso!")`,
  },

  vm_start_stop: {
    titulo: 'Iniciar/Parar VMs',
    descricao: 'Controlar o estado das VMs',
    codigo: `node = 'pve1'
vmid = 100

# Iniciar VM
proxmox.nodes(node).qemu(vmid).status.start.post()
print(f"VM {vmid} iniciando...")

# Parar VM (graceful shutdown)
proxmox.nodes(node).qemu(vmid).status.shutdown.post()
print(f"VM {vmid} desligando...")

# Parar VM (forçado)
proxmox.nodes(node).qemu(vmid).status.stop.post()
print(f"VM {vmid} parada!")

# Reiniciar VM
proxmox.nodes(node).qemu(vmid).status.reboot.post()
print(f"VM {vmid} reiniciando...")`,
  },

  vm_snapshot: {
    titulo: 'Gerenciar Snapshots',
    descricao: 'Criar e gerenciar snapshots de VMs',
    codigo: `node = 'pve1'
vmid = 100

# Criar snapshot
proxmox.nodes(node).qemu(vmid).snapshot.create(
    snapname='backup-antes-update',
    description='Snapshot antes da atualização'
)
print("Snapshot criado!")

# Listar snapshots
for snap in proxmox.nodes(node).qemu(vmid).snapshot.get():
    print(f"Snapshot: {snap['name']}")
    if 'description' in snap:
        print(f"  Descrição: {snap['description']}")

# Restaurar snapshot
proxmox.nodes(node).qemu(vmid).snapshot('backup-antes-update').rollback.post()
print("Snapshot restaurado!")

# Deletar snapshot
proxmox.nodes(node).qemu(vmid).snapshot('backup-antes-update').delete()
print("Snapshot removido!")`,
  },

  vm_clone: {
    titulo: 'Clonar VM',
    descricao: 'Criar clone de uma VM existente',
    codigo: `node = 'pve1'
source_vmid = 9000  # Template
new_vmid = 110
new_name = 'clone-from-template'

# Clone completo
proxmox.nodes(node).qemu(source_vmid).clone.create(
    newid=new_vmid,
    name=new_name,
    full=True,  # True = full clone, False = linked clone
    storage='local-lvm'
)

print(f"Clone {new_vmid} ({new_name}) criado!")`,
  },

  // Containers
  ct_list: {
    titulo: 'Listar Containers LXC',
    descricao: 'Obter lista de todos os containers',
    codigo: `node = 'pve1'
for ct in proxmox.nodes(node).lxc.get():
    print(f"CTID: {ct['vmid']} - {ct['name']}")
    print(f"  Status: {ct.get('status', 'unknown')}")
    print(f"  Memória: {ct.get('maxmem', 0)/1024/1024/1024:.1f}GB")
    print(f"  Disco: {ct.get('maxdisk', 0)/1024/1024/1024:.1f}GB")
    print()`,
    saida: `CTID: 200 - docker-host
  Status: running
  Memória: 2.0GB
  Disco: 16.0GB`,
  },

  ct_create: {
    titulo: 'Criar Container',
    descricao: 'Criar novo container LXC',
    codigo: `node = 'pve1'
ctid = 210
template = 'local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst'

proxmox.nodes(node).lxc.create(
    vmid=ctid,
    hostname='ct-api-test',
    ostemplate=template,
    storage='local-lvm',
    rootfs='local-lvm:8',
    memory=1024,
    cores=2,
    net0='name=eth0,bridge=vmbr0,ip=dhcp',
    password='changeme',
    unprivileged=1,
    features='nesting=1',
    start=False
)

print(f"Container {ctid} criado!")`,
  },

  // Storage
  storage_list: {
    titulo: 'Listar Storages',
    descricao: 'Obter informações de storages disponíveis',
    codigo: `# Listar storages do cluster
for storage in proxmox.storage.get():
    print(f"Storage: {storage['storage']}")
    print(f"  Tipo: {storage['type']}")
    print(f"  Conteúdo: {storage.get('content', 'N/A')}")
    print()

# Status de storage em um nó específico
node = 'pve1'
for storage in proxmox.nodes(node).storage.get():
    used_pct = storage.get('used', 0) / storage.get('total', 1) * 100
    print(f"{storage['storage']}: {used_pct:.1f}% usado")`,
    saida: `Storage: local
  Tipo: dir
  Conteúdo: backup,iso,vztmpl

local: 45.2% usado
local-lvm: 68.7% usado`,
  },

  storage_upload_iso: {
    titulo: 'Upload de ISO',
    descricao: 'Fazer upload de imagem ISO para o storage',
    codigo: `import os
node = 'pve1'
storage = 'local'
iso_path = '/path/to/ubuntu-22.04.iso'

# Upload de ISO
with open(iso_path, 'rb') as f:
    proxmox.nodes(node).storage(storage).upload.create(
        content='iso',
        filename=os.path.basename(iso_path),
        file=f
    )

print(f"ISO uploaded para {storage}")

# Listar ISOs disponíveis
for item in proxmox.nodes(node).storage(storage).content.get():
    if item['content'] == 'iso':
        print(f"ISO: {item['volid']}")`,
  },

  // Backup
  backup_create: {
    titulo: 'Criar Backup',
    descricao: 'Fazer backup de VMs via API',
    codigo: `node = 'pve1'
vmid = 100
storage = 'local'

# Criar backup
task = proxmox.nodes(node).vzdump.create(
    vmid=vmid,
    storage=storage,
    mode='snapshot',
    compress='zstd',
    notes='Backup via API Python'
)

print(f"Backup iniciado - Task: {task}")

# Listar backups disponíveis
for item in proxmox.nodes(node).storage(storage).content.get():
    if item['content'] == 'backup':
        print(f"Backup: {item['volid']}")
        print(f"  Tamanho: {item.get('size', 0)/1024/1024/1024:.2f}GB")`,
  },

  backup_restore: {
    titulo: 'Restaurar Backup',
    descricao: 'Restaurar VM a partir de backup',
    codigo: `node = 'pve1'
backup_file = 'local:backup/vzdump-qemu-100-2024_01_15-10_00_00.vma.zst'
new_vmid = 999

# Restaurar backup como nova VM
proxmox.nodes(node).qemu.create(
    vmid=new_vmid,
    archive=backup_file,
    storage='local-lvm',
    unique=True  # Gera novos UUIDs
)

print(f"VM {new_vmid} restaurada do backup!")`,
  },

  // Cluster
  cluster_status: {
    titulo: 'Status do Cluster',
    descricao: 'Obter informações do cluster',
    codigo: `# Status geral do cluster
status = proxmox.cluster.status.get()
for item in status:
    if item['type'] == 'cluster':
        print(f"Cluster: {item['name']}")
        print(f"  Nodes: {item['nodes']}")
        print(f"  Quorum: {'OK' if item['quorate'] else 'LOST'}")
    elif item['type'] == 'node':
        print(f"  Node: {item['name']} - {'online' if item['online'] else 'offline'}")

# Recursos do cluster
print("\\nRecursos:")
for resource in proxmox.cluster.resources.get(type='vm'):
    print(f"  {resource['name']} (VMID: {resource['vmid']}) - {resource['status']}")`,
    saida: `Cluster: proxmox-cluster
  Nodes: 3
  Quorum: OK
  Node: pve1 - online
  Node: pve2 - online
  Node: pve3 - online

Recursos:
  ubuntu-server (VMID: 100) - running
  docker-host (VMID: 200) - running`,
  },

  // Tasks
  tasks_list: {
    titulo: 'Listar Tasks',
    descricao: 'Monitorar tarefas em execução',
    codigo: `node = 'pve1'

# Listar tasks recentes
tasks = proxmox.nodes(node).tasks.get(limit=10)
for task in tasks:
    status = task.get('status', 'running')
    print(f"Task: {task['upid']}")
    print(f"  Tipo: {task['type']}")
    print(f"  Status: {status}")
    print(f"  Início: {task.get('starttime', 'N/A')}")
    print()

# Verificar status de uma task específica
upid = 'UPID:pve1:00001234:00ABC123:12345678:vzdump:100:root@pam:'
task_status = proxmox.nodes(node).tasks(upid).status.get()
print(f"Status: {task_status['status']}")`,
  },

  // Firewall
  firewall_rules: {
    titulo: 'Regras de Firewall',
    descricao: 'Gerenciar regras do firewall',
    codigo: `node = 'pve1'
vmid = 100

# Listar regras do cluster
print("Regras do Cluster:")
for rule in proxmox.cluster.firewall.rules.get():
    print(f"  {rule.get('action', 'N/A')} - {rule.get('comment', 'sem descrição')}")

# Adicionar regra à VM
proxmox.nodes(node).qemu(vmid).firewall.rules.create(
    action='ACCEPT',
    type='in',
    proto='tcp',
    dport='22',
    comment='Allow SSH'
)

# Habilitar firewall na VM
proxmox.nodes(node).qemu(vmid).firewall.options.put(
    enable=1
)

print("Firewall configurado!")`,
  },

  // System
  system_resource: {
    titulo: 'Informações do Sistema',
    descricao: 'Obter recursos e versão do sistema',
    codigo: `# Versão do Proxmox
version = proxmox.version.get()
print(f"Proxmox VE: {version['version']}")
print(f"Release: {version['release']}")

# Status dos nós
for node in proxmox.nodes.get():
    if node['status'] == 'online':
        node_name = node['node']
        status = proxmox.nodes(node_name).status.get()
        
        print(f"\\nNode: {node_name}")
        print(f"  CPU: {status['cpu']*100:.1f}%")
        print(f"  Memória: {status['memory']['used']/1024/1024/1024:.1f}GB / {status['memory']['total']/1024/1024/1024:.1f}GB")
        print(f"  Uptime: {status['uptime']//3600}h {(status['uptime']%3600)//60}m")
        print(f"  Kernel: {status.get('kversion', 'N/A')}")`,
    saida: `Proxmox VE: 8.1.3
Release: 8.1

Node: pve1
  CPU: 12.5%
  Memória: 24.3GB / 64.0GB
  Uptime: 720h 30m
  Kernel: 6.5.11-7-pve`,
  },

  // HA
  ha_resources: {
    titulo: 'Recursos HA',
    descricao: 'Gerenciar High Availability',
    codigo: `# Listar recursos HA
print("Recursos HA:")
for resource in proxmox.cluster.ha.resources.get():
    print(f"  {resource['sid']}")
    print(f"    Estado: {resource.get('state', 'unknown')}")
    print(f"    Grupo: {resource.get('group', 'N/A')}")

# Adicionar VM ao HA
proxmox.cluster.ha.resources.create(
    sid='vm:100',
    group='ha-group-1',
    state='started',
    max_restart=3,
    max_relocate=1
)

print("VM adicionada ao HA!")

# Status do HA Manager
status = proxmox.cluster.ha.status.current.get()
for item in status:
    print(f"Node: {item.get('node', 'N/A')} - {item.get('status', 'N/A')}")`,
  },

  // Métricas
  metrics: {
    titulo: 'Coletar Métricas',
    descricao: 'Obter métricas de performance para monitoramento',
    codigo: `import time

node = 'pve1'
vmid = 100

# Métricas da VM
def get_vm_metrics(node, vmid):
    current = proxmox.nodes(node).qemu(vmid).status.current.get()
    return {
        'cpu': current.get('cpu', 0) * 100,
        'mem': current.get('mem', 0) / 1024 / 1024,
        'maxmem': current.get('maxmem', 0) / 1024 / 1024,
        'disk_read': current.get('diskread', 0),
        'disk_write': current.get('diskwrite', 0),
        'net_in': current.get('netin', 0),
        'net_out': current.get('netout', 0)
    }

# Coletar métricas
metrics = get_vm_metrics(node, vmid)
print(f"VM {vmid} Métricas:")
print(f"  CPU: {metrics['cpu']:.1f}%")
print(f"  Memória: {metrics['mem']:.0f}MB / {metrics['maxmem']:.0f}MB")
print(f"  Disco R/W: {metrics['disk_read']/1024/1024:.1f}MB / {metrics['disk_write']/1024/1024:.1f}MB")
print(f"  Rede IN/OUT: {metrics['net_in']/1024/1024:.1f}MB / {metrics['net_out']/1024/1024:.1f}MB")`,
    saida: `VM 100 Métricas:
  CPU: 5.2%
  Memória: 1024MB / 4096MB
  Disco R/W: 150.3MB / 45.2MB
  Rede IN/OUT: 25.1MB / 12.4MB`,
  },

  // Migrações
  migration: {
    titulo: 'Migrar VM',
    descricao: 'Migrar VM entre nós do cluster',
    codigo: `source_node = 'pve1'
target_node = 'pve2'
vmid = 100

# Verificar se VM pode ser migrada
vm_config = proxmox.nodes(source_node).qemu(vmid).config.get()
print(f"Migrando VM {vmid}: {vm_config.get('name', 'N/A')}")

# Live migration (VM rodando)
task = proxmox.nodes(source_node).qemu(vmid).migrate.create(
    target=target_node,
    online=True,  # True = live migration
    with_local_disks=True  # Se tiver discos locais
)

print(f"Migração iniciada - Task: {task}")

# Aguardar migração (opcional)
import time
while True:
    status = proxmox.nodes(source_node).tasks(task).status.get()
    if status['status'] == 'stopped':
        print(f"Migração concluída: {status.get('exitstatus', 'OK')}")
        break
    print("Migrando...")
    time.sleep(5)`,
  },

  // ==========================================
  // REDE E IP
  // ==========================================
  network_config: {
    titulo: 'Configuração de Rede',
    descricao: 'Obter e modificar configurações de rede do nó',
    codigo: `node = 'pve1'

# Listar interfaces de rede
print("Interfaces de Rede:")
for iface in proxmox.nodes(node).network.get():
    print(f"  {iface['iface']}: {iface.get('type', 'N/A')}")
    if 'address' in iface:
        print(f"    IP: {iface['address']}/{iface.get('netmask', 'N/A')}")
    if 'bridge_ports' in iface:
        print(f"    Bridge Ports: {iface['bridge_ports']}")
    if 'slaves' in iface:
        print(f"    Bond Slaves: {iface['slaves']}")

# Criar nova bridge
proxmox.nodes(node).network.create(
    iface='vmbr1',
    type='bridge',
    address='10.0.0.1',
    netmask='255.255.255.0',
    bridge_ports='',  # Bridge sem porta física (interno)
    comments='Rede interna VMs'
)

# Aplicar configurações (requer reload)
proxmox.nodes(node).network.put()
print("Configuração aplicada!")`,
    saida: `Interfaces de Rede:
  lo: loopback
  eno1: eth
  vmbr0: bridge
    IP: 192.168.1.100/255.255.255.0
    Bridge Ports: eno1`,
  },

  network_vlan: {
    titulo: 'Gerenciar VLANs',
    descricao: 'Configurar VLANs para segmentação de rede',
    codigo: `node = 'pve1'

# Criar interface VLAN
proxmox.nodes(node).network.create(
    iface='eno1.100',
    type='vlan',
    vlan_raw_device='eno1',
    vlan_id=100,
    comments='VLAN 100 - Servidores'
)

# Criar bridge para a VLAN
proxmox.nodes(node).network.create(
    iface='vmbr100',
    type='bridge',
    bridge_ports='eno1.100',
    bridge_vlan_aware=False,
    comments='Bridge VLAN 100'
)

# Bridge VLAN-aware (múltiplas VLANs em uma bridge)
proxmox.nodes(node).network.create(
    iface='vmbr10',
    type='bridge',
    bridge_ports='eno2',
    bridge_vlan_aware=True,
    comments='Bridge VLAN-aware'
)

print("VLANs configuradas!")

# Listar VLANs
for iface in proxmox.nodes(node).network.get():
    if iface.get('type') == 'vlan':
        print(f"VLAN: {iface['iface']} (ID: {iface.get('vlan-id', 'N/A')})")`,
  },

  network_bond: {
    titulo: 'Link Aggregation (Bond)',
    descricao: 'Configurar bonding para alta disponibilidade de rede',
    codigo: `node = 'pve1'

# Criar bond (agregação de links)
proxmox.nodes(node).network.create(
    iface='bond0',
    type='bond',
    slaves='eno1 eno2',
    bond_mode='802.3ad',  # LACP
    bond_miimon=100,
    bond_xmit_hash_policy='layer3+4',
    comments='Bond LACP'
)

# Criar bridge sobre o bond
proxmox.nodes(node).network.create(
    iface='vmbr0',
    type='bridge',
    address='192.168.1.100',
    netmask='255.255.255.0',
    gateway='192.168.1.1',
    bridge_ports='bond0',
    comments='Bridge principal sobre bond'
)

# Aplicar mudanças
proxmox.nodes(node).network.put()
print("Bonding configurado!")

# Modos de bond disponíveis:
# balance-rr, active-backup, balance-xor, broadcast, 
# 802.3ad (LACP), balance-tlb, balance-alb`,
    saida: `Bonding configurado!`,
  },

  sdn_zones: {
    titulo: 'SDN - Zonas de Rede',
    descricao: 'Configurar Software Defined Networking',
    codigo: `# Listar zonas SDN
print("Zonas SDN:")
for zone in proxmox.cluster.sdn.zones.get():
    print(f"  {zone['zone']}: {zone['type']}")
    print(f"    MTU: {zone.get('mtu', 'default')}")

# Criar zona VXLAN
proxmox.cluster.sdn.zones.create(
    zone='vxlan-zone',
    type='vxlan',
    peers='192.168.1.10,192.168.1.11,192.168.1.12',
    mtu=1450
)

# Criar zona VLAN
proxmox.cluster.sdn.zones.create(
    zone='vlan-zone',
    type='vlan',
    bridge='vmbr0'
)

# Criar VNet na zona
proxmox.cluster.sdn.vnets.create(
    vnet='vnet-web',
    zone='vlan-zone',
    tag=100,
    alias='Web Servers'
)

# Criar Subnet
proxmox.cluster.sdn.vnets('vnet-web').subnets.create(
    subnet='10.100.0.0/24',
    gateway='10.100.0.1',
    snat=True
)

# Aplicar configuração SDN
proxmox.cluster.sdn.put()
print("SDN configurado!")`,
  },

  // ==========================================
  // SERVIÇOS
  // ==========================================
  services_list: {
    titulo: 'Gerenciar Serviços do Nó',
    descricao: 'Listar, iniciar e parar serviços do Proxmox',
    codigo: `node = 'pve1'

# Listar serviços
print("Serviços do Nó:")
for service in proxmox.nodes(node).services.get():
    state = service.get('state', 'unknown')
    emoji = '🟢' if state == 'running' else '🔴'
    print(f"  {emoji} {service['service']}: {state}")

# Reiniciar serviço
proxmox.nodes(node).services('pvedaemon').restart.post()
print("\\npvedaemon reiniciado!")

# Parar serviço
proxmox.nodes(node).services('pve-firewall').stop.post()
print("pve-firewall parado!")

# Iniciar serviço
proxmox.nodes(node).services('pve-firewall').start.post()
print("pve-firewall iniciado!")

# Recarregar serviço (reload config)
proxmox.nodes(node).services('pvedaemon').reload.post()
print("pvedaemon recarregado!")`,
    saida: `Serviços do Nó:
  🟢 pvedaemon: running
  🟢 pveproxy: running
  🟢 pvestatd: running
  🟢 pve-firewall: running
  🟢 corosync: running
  🟢 pve-cluster: running`,
  },

  ceph_status: {
    titulo: 'Status do Ceph',
    descricao: 'Monitorar cluster Ceph integrado',
    codigo: `node = 'pve1'

# Status geral do Ceph
ceph_status = proxmox.nodes(node).ceph.status.get()
print("Status do Ceph:")
print(f"  Health: {ceph_status['health']['status']}")
print(f"  Monitors: {len(ceph_status['monmap']['mons'])}")

# Listar OSDs
print("\\nOSDs:")
for osd in proxmox.nodes(node).ceph.osd.get():
    status = '🟢' if osd.get('status') == 'up' else '🔴'
    print(f"  {status} OSD.{osd['id']}: {osd.get('device', 'N/A')}")

# Listar Pools
print("\\nPools:")
for pool in proxmox.nodes(node).ceph.pools.get():
    print(f"  {pool['pool_name']}: {pool.get('size', 'N/A')} replicas")

# Criar novo pool
proxmox.nodes(node).ceph.pools.create(
    name='vm-pool',
    size=3,       # 3 replicas
    min_size=2,   # Mínimo para escrita
    pg_num=128    # Placement groups
)
print("\\nPool 'vm-pool' criado!")`,
    saida: `Status do Ceph:
  Health: HEALTH_OK
  Monitors: 3

OSDs:
  🟢 OSD.0: /dev/sdb
  🟢 OSD.1: /dev/sdc
  🟢 OSD.2: /dev/sdd

Pools:
  rbd: 3 replicas
  cephfs_data: 3 replicas`,
  },

  dns_config: {
    titulo: 'Configuração DNS',
    descricao: 'Gerenciar DNS do nó',
    codigo: `node = 'pve1'

# Obter configuração DNS atual
dns = proxmox.nodes(node).dns.get()
print("Configuração DNS:")
print(f"  Search Domain: {dns.get('search', 'N/A')}")
print(f"  DNS 1: {dns.get('dns1', 'N/A')}")
print(f"  DNS 2: {dns.get('dns2', 'N/A')}")
print(f"  DNS 3: {dns.get('dns3', 'N/A')}")

# Atualizar DNS
proxmox.nodes(node).dns.put(
    search='mydomain.local',
    dns1='8.8.8.8',
    dns2='8.8.4.4',
    dns3='1.1.1.1'
)
print("\\nDNS atualizado!")

# Obter configuração de hosts
hosts = proxmox.nodes(node).hosts.get()
print("\\nArquivo /etc/hosts:")
print(hosts.get('data', ''))`,
    saida: `Configuração DNS:
  Search Domain: proxmox.local
  DNS 1: 8.8.8.8
  DNS 2: 8.8.4.4
  DNS 3: 1.1.1.1`,
  },

  time_config: {
    titulo: 'Configuração de Hora/NTP',
    descricao: 'Gerenciar timezone e sincronização de tempo',
    codigo: `node = 'pve1'

# Obter configuração de tempo
time_config = proxmox.nodes(node).time.get()
print("Configuração de Tempo:")
print(f"  Timezone: {time_config.get('timezone', 'N/A')}")
print(f"  Hora Local: {time_config.get('localtime', 'N/A')}")
print(f"  UTC: {time_config.get('time', 'N/A')}")

# Alterar timezone
proxmox.nodes(node).time.put(
    timezone='America/Sao_Paulo'
)
print("\\nTimezone alterado para America/Sao_Paulo!")

# Para configurar NTP, editar /etc/chrony/chrony.conf
# ou /etc/systemd/timesyncd.conf via linha de comando`,
    saida: `Configuração de Tempo:
  Timezone: America/Sao_Paulo
  Hora Local: 2024-01-15 14:30:00
  UTC: 2024-01-15 17:30:00`,
  },

  // ==========================================
  // AVANÇADO
  // ==========================================
  acl_permissions: {
    titulo: 'Gerenciar Permissões (ACL)',
    descricao: 'Controlar acesso de usuários e grupos',
    codigo: `# Listar ACLs
print("ACLs:")
for acl in proxmox.access.acl.get():
    print(f"  Path: {acl['path']}")
    print(f"    User/Group: {acl.get('ugid', 'N/A')}")
    print(f"    Role: {acl.get('roleid', 'N/A')}")
    print(f"    Propagate: {acl.get('propagate', True)}")

# Criar usuário
proxmox.access.users.create(
    userid='developer@pve',
    password='senha123',
    groups='developers',
    email='dev@example.com',
    firstname='Dev',
    lastname='User'
)

# Criar role personalizada
proxmox.access.roles.create(
    roleid='VMOperator',
    privs='VM.PowerMgmt,VM.Console,VM.Monitor'
)

# Atribuir permissão
proxmox.access.acl.put(
    path='/vms/100',
    users='developer@pve',
    roles='VMOperator',
    propagate=True
)

print("\\nPermissões configuradas!")`,
    saida: `ACLs:
  Path: /
    User/Group: admin@pve
    Role: Administrator
    Propagate: True
  Path: /vms
    User/Group: developers
    Role: PVEVMUser
    Propagate: True`,
  },

  api_tokens: {
    titulo: 'Gerenciar API Tokens',
    descricao: 'Criar e gerenciar tokens para automação',
    codigo: `# Listar tokens de um usuário
user = 'root@pam'
print(f"Tokens de {user}:")
for token in proxmox.access.users(user).token.get():
    print(f"  Token: {token['tokenid']}")
    print(f"    Expire: {token.get('expire', 'never')}")
    print(f"    Privsep: {token.get('privsep', True)}")
    print(f"    Comment: {token.get('comment', 'N/A')}")

# Criar novo token
import datetime
expire = int((datetime.datetime.now() + datetime.timedelta(days=365)).timestamp())

result = proxmox.access.users(user).token.create(
    tokenid='automation',
    expire=expire,
    privsep=False,  # False = mesmas permissões do usuário
    comment='Token para scripts de automação'
)

print(f"\\nToken criado!")
print(f"  Token ID: {result['tokenid']}")
print(f"  Secret: {result['value']}")  # Só mostrado uma vez!

# Deletar token
proxmox.access.users(user).token('old-token').delete()
print("Token antigo removido!")`,
    saida: `Tokens de root@pam:
  Token: automation
    Expire: 1736899200
    Privsep: False
    Comment: Token para scripts

Token criado!
  Token ID: automation
  Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
  },

  vm_cloudinit: {
    titulo: 'Cloud-Init',
    descricao: 'Configurar VMs com Cloud-Init',
    codigo: `node = 'pve1'
vmid = 9000  # Template

# Configurar Cloud-Init
proxmox.nodes(node).qemu(vmid).config.put(
    ciuser='ubuntu',
    cipassword='changeme',
    sshkeys='ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...',
    ipconfig0='ip=dhcp',
    # Ou IP estático:
    # ipconfig0='ip=192.168.1.100/24,gw=192.168.1.1',
    nameserver='8.8.8.8',
    searchdomain='example.com'
)

# Regenerar imagem Cloud-Init
proxmox.nodes(node).qemu(vmid).cloudinit.put()

print("Cloud-Init configurado!")

# Clonar template com Cloud-Init
new_vmid = 200
proxmox.nodes(node).qemu(vmid).clone.create(
    newid=new_vmid,
    name='web-server-01',
    full=True,
    storage='local-lvm'
)

# Customizar clone com IP específico
proxmox.nodes(node).qemu(new_vmid).config.put(
    ipconfig0='ip=192.168.1.50/24,gw=192.168.1.1',
    ciuser='webadmin'
)

# Regenerar Cloud-Init do clone
proxmox.nodes(node).qemu(new_vmid).cloudinit.put()

# Iniciar VM
proxmox.nodes(node).qemu(new_vmid).status.start.post()
print(f"VM {new_vmid} iniciada com Cloud-Init!")`,
  },

  template_management: {
    titulo: 'Gerenciar Templates',
    descricao: 'Criar e gerenciar templates de VM e Container',
    codigo: `node = 'pve1'
vmid = 100

# Converter VM em Template
proxmox.nodes(node).qemu(vmid).template.post()
print(f"VM {vmid} convertida em template!")

# Clonar a partir do template
template_id = 9000
new_vmid = 150

task = proxmox.nodes(node).qemu(template_id).clone.create(
    newid=new_vmid,
    name='clone-from-template',
    full=True,  # Full clone (False = linked clone)
    storage='local-lvm',
    target=node  # Pode ser outro nó
)

print(f"Clone iniciado: {task}")

# Listar templates
print("\\nTemplates disponíveis:")
for vm in proxmox.nodes(node).qemu.get():
    if vm.get('template', 0) == 1:
        print(f"  Template VMID {vm['vmid']}: {vm['name']}")

# Templates de Container
print("\\nTemplates de Container disponíveis:")
for item in proxmox.nodes(node).storage('local').content.get():
    if item.get('content') == 'vztmpl':
        print(f"  {item['volid']}")

# Baixar template de container
proxmox.nodes(node).aplinfo.post(
    storage='local',
    template='ubuntu-22.04-standard_22.04-1_amd64.tar.zst'
)
print("\\nTemplate Ubuntu baixado!")`,
  },

  replication: {
    titulo: 'Replicação de Storage',
    descricao: 'Configurar replicação de VMs entre nós',
    codigo: `# Listar jobs de replicação
print("Jobs de Replicação:")
for job in proxmox.cluster.replication.get():
    print(f"  Job: {job['id']}")
    print(f"    Source: {job['source']}")
    print(f"    Target: {job['target']}")
    print(f"    Schedule: {job.get('schedule', '*/15')}")
    print(f"    Rate: {job.get('rate', 'unlimited')}")

# Criar job de replicação
proxmox.cluster.replication.create(
    id='local-rep-100',
    type='local',
    target='pve2',
    source='pve1',
    vmid=100,
    schedule='*/15',  # A cada 15 minutos
    rate=10,          # Limite: 10 MB/s
    comment='Replicação VM 100'
)

print("\\nJob de replicação criado!")

# Executar replicação manualmente
proxmox.nodes('pve1').replication('local-rep-100').schedule_now.post()
print("Replicação iniciada!")

# Status da replicação
status = proxmox.nodes('pve1').replication.get()
for rep in status:
    print(f"\\nVM {rep['vmid']}:")
    print(f"  Last Sync: {rep.get('last_sync', 'never')}")
    print(f"  Duration: {rep.get('duration', 'N/A')}s")`,
  },

  pci_passthrough: {
    titulo: 'PCI Passthrough',
    descricao: 'Configurar passthrough de dispositivos PCI/GPU',
    codigo: `node = 'pve1'
vmid = 100

# Listar dispositivos PCI disponíveis
print("Dispositivos PCI:")
for device in proxmox.nodes(node).hardware.pci.get():
    print(f"  {device['id']}: {device.get('device_name', 'Unknown')}")
    print(f"    Vendor: {device.get('vendor_name', 'N/A')}")
    print(f"    IOMMU Group: {device.get('iommugroup', 'N/A')}")
    print(f"    Mediated: {device.get('mdev', False)}")

# Configurar passthrough de GPU
proxmox.nodes(node).qemu(vmid).config.put(
    hostpci0='0000:01:00,pcie=1,x-vga=1',
    machine='q35',
    bios='ovmf',  # UEFI necessário para GPU
    cpu='host,hidden=1'  # hidden=1 para NVIDIA
)

print(f"\\nGPU configurada para VM {vmid}!")

# Para USB passthrough
print("\\nDispositivos USB:")
for usb in proxmox.nodes(node).hardware.usb.get():
    print(f"  {usb['busnum']}-{usb['devnum']}: {usb.get('product', 'Unknown')}")

# Adicionar USB à VM
proxmox.nodes(node).qemu(vmid).config.put(
    usb0='host=1234:5678'  # Vendor:Product ID
)
print("USB configurado!")`,
  },

  vzdump_advanced: {
    titulo: 'Backup Avançado (vzdump)',
    descricao: 'Configurações avançadas de backup',
    codigo: `node = 'pve1'

# Backup com todas as opções
task = proxmox.nodes(node).vzdump.create(
    vmid='100,101,102',  # Múltiplas VMs
    storage='backup-nfs',
    mode='snapshot',      # snapshot, suspend, stop
    compress='zstd',      # none, lzo, gzip, zstd
    mailnotification='failure',  # always, failure
    mailto='admin@example.com',
    maxfiles=3,           # Manter últimos 3 backups
    notes_template='{{guestname}} - Backup diário',
    remove=False,         # Não remover backups antigos automaticamente
    bwlimit=50000,        # Limite: 50 MB/s
    ionice=7,             # Prioridade I/O (0-8)
    lockwait=180,         # Aguardar lock por 180 min
    pigz=4,               # Threads para compressão
    protected=True        # Proteger contra remoção acidental
)

print(f"Backup iniciado: {task}")

# Verificar integridade do backup
backup_file = 'backup-nfs:backup/vzdump-qemu-100-2024_01_15.vma.zst'
verify = proxmox.nodes(node).vzdump.extractconfig.get(
    volume=backup_file
)
print("\\nConfiguração do backup:")
print(verify)

# Listar notas de backup
for backup in proxmox.nodes(node).storage('backup-nfs').content.get():
    if backup.get('content') == 'backup':
        notes = backup.get('notes', 'Sem notas')
        print(f"  {backup['volid']}: {notes}")`,
  },

  log_viewer: {
    titulo: 'Visualizar Logs',
    descricao: 'Acessar logs do sistema e de VMs',
    codigo: `node = 'pve1'

# Logs do sistema (syslog)
print("Últimas linhas do syslog:")
syslog = proxmox.nodes(node).syslog.get(limit=20)
for line in syslog:
    print(f"  {line['t']}: {line['n']}")

# Logs de tarefas
print("\\nTarefas recentes:")
for task in proxmox.nodes(node).tasks.get(limit=10):
    print(f"  {task['type']}: {task.get('status', 'running')}")
    
    # Log detalhado da tarefa
    if task.get('upid'):
        log = proxmox.nodes(node).tasks(task['upid']).log.get(limit=5)
        for line in log:
            print(f"    {line['t']}")

# Logs de firewall
print("\\nLogs do Firewall:")
fw_log = proxmox.nodes(node).firewall.log.get(limit=10)
for entry in fw_log:
    print(f"  {entry['msg']}")

# Journalctl (via execute)
# Nota: Requer privilégios adequados
result = proxmox.nodes(node).execute.post(
    commands='journalctl -u pvedaemon --no-pager -n 10'
)
print("\\nJournalctl pvedaemon:")
print(result)`,
  },

  console_access: {
    titulo: 'Acesso ao Console',
    descricao: 'Obter tickets para acesso VNC/SPICE',
    codigo: `node = 'pve1'
vmid = 100

# Ticket VNC para VM
vnc_ticket = proxmox.nodes(node).qemu(vmid).vncproxy.post()
print("VNC Ticket:")
print(f"  Port: {vnc_ticket['port']}")
print(f"  Ticket: {vnc_ticket['ticket']}")
print(f"  Cert: {vnc_ticket.get('cert', 'N/A')}")

# WebSocket VNC
vnc_ws = proxmox.nodes(node).qemu(vmid).vncwebsocket.get(
    port=vnc_ticket['port'],
    vncticket=vnc_ticket['ticket']
)

# Ticket SPICE para VM
spice = proxmox.nodes(node).qemu(vmid).spiceproxy.post()
print("\\nSPICE Connection:")
print(f"  Host: {spice['host']}")
print(f"  Port: {spice['tls-port']}")
print(f"  Password: {spice['password']}")

# Gerar arquivo .vv para SPICE
spice_file = f\"\"\"[virt-viewer]
type=spice
host={spice['host']}
port={spice['port']}
tls-port={spice['tls-port']}
password={spice['password']}
\"\"\"
print("\\nArquivo .vv gerado!")

# Console do nó (shell)
shell = proxmox.nodes(node).termproxy.post()
print(f"\\nTerminal: port={shell['port']}")`,
  },

  bulk_operations: {
    titulo: 'Operações em Lote',
    descricao: 'Executar ações em múltiplas VMs/Containers',
    codigo: `import concurrent.futures
node = 'pve1'

# Listar todas as VMs
vms = proxmox.nodes(node).qemu.get()
cts = proxmox.nodes(node).lxc.get()

# Iniciar todas as VMs paradas
def start_vm(vmid):
    try:
        proxmox.nodes(node).qemu(vmid).status.start.post()
        return f"VM {vmid} iniciada"
    except Exception as e:
        return f"Erro VM {vmid}: {e}"

stopped_vms = [vm['vmid'] for vm in vms if vm.get('status') != 'running']
print(f"Iniciando {len(stopped_vms)} VMs...")

# Executar em paralelo
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(start_vm, stopped_vms)
    for result in results:
        print(f"  {result}")

# Backup de todas as VMs com tag específica
print("\\nBackup de VMs com tag 'production':")
for vm in vms:
    config = proxmox.nodes(node).qemu(vm['vmid']).config.get()
    tags = config.get('tags', '').split(';')
    
    if 'production' in tags:
        task = proxmox.nodes(node).vzdump.create(
            vmid=vm['vmid'],
            storage='local',
            mode='snapshot',
            compress='zstd'
        )
        print(f"  Backup VM {vm['vmid']} ({vm['name']}): {task}")

# Aplicar configuração em lote
print("\\nAplicando configuração em lote:")
for vm in vms:
    if vm.get('status') == 'stopped':
        proxmox.nodes(node).qemu(vm['vmid']).config.put(
            memory=4096,
            cores=2,
            agent='enabled=1'
        )
        print(f"  VM {vm['vmid']} atualizada")`,
  },
};

// Função para obter exemplo por comando
export function getPythonExampleForCommand(comando: string): typeof PYTHON_API_EXAMPLES[keyof typeof PYTHON_API_EXAMPLES] | null {
  const commandMappings: Record<string, keyof typeof PYTHON_API_EXAMPLES> = {
    'qm': 'vm_list',
    'qm create': 'vm_create',
    'qm start': 'vm_start_stop',
    'qm stop': 'vm_start_stop',
    'qm snapshot': 'vm_snapshot',
    'qm clone': 'vm_clone',
    'qm cloudinit': 'vm_cloudinit',
    'qm template': 'template_management',
    'pct': 'ct_list',
    'pct create': 'ct_create',
    'pvesm': 'storage_list',
    'vzdump': 'vzdump_advanced',
    'qmrestore': 'backup_restore',
    'pvecm': 'cluster_status',
    'ha': 'ha_resources',
    'firewall': 'firewall_rules',
    'migrate': 'migration',
    'pveceph': 'ceph_status',
    'network': 'network_config',
    'vlan': 'network_vlan',
    'bond': 'network_bond',
    'sdn': 'sdn_zones',
    'acl': 'acl_permissions',
    'token': 'api_tokens',
    'replication': 'replication',
    'pci': 'pci_passthrough',
  };

  for (const [prefix, key] of Object.entries(commandMappings)) {
    if (comando.toLowerCase().startsWith(prefix)) {
      return PYTHON_API_EXAMPLES[key];
    }
  }
  
  return null;
}
