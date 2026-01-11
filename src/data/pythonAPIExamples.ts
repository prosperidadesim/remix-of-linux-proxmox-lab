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
    'pct': 'ct_list',
    'pct create': 'ct_create',
    'pvesm': 'storage_list',
    'vzdump': 'backup_create',
    'qmrestore': 'backup_restore',
    'pvecm': 'cluster_status',
    'ha': 'ha_resources',
    'firewall': 'firewall_rules',
    'migrate': 'migration',
  };

  for (const [prefix, key] of Object.entries(commandMappings)) {
    if (comando.toLowerCase().startsWith(prefix)) {
      return PYTHON_API_EXAMPLES[key];
    }
  }
  
  return null;
}
