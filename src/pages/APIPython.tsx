import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PYTHON_API_INTRO, PYTHON_API_EXAMPLES } from '@/data/pythonAPIExamples';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, Play, Terminal, Code2, BookOpen, ExternalLink, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Categorias dos exemplos
const CATEGORIES = {
  basico: {
    label: 'Básico',
    icon: BookOpen,
    examples: ['conexao', 'system_resource', 'log_read', 'script_run', 'system_backup'],
  },
  rede: {
    label: 'Rede & IP',
    icon: Terminal,
    examples: ['interfaces_list', 'ip_addresses', 'vlan_list', 'dhcp_leases', 'dhcp_add_static'],
  },
  firewall: {
    label: 'Firewall & Security',
    icon: Code2,
    examples: ['firewall_rules', 'firewall_add_rule', 'ipsec_peers'],
  },
  routing: {
    label: 'Roteamento',
    icon: ChevronRight,
    examples: ['routes_list', 'routes_add', 'ospf_neighbors', 'ospf_networks', 'bgp_peers'],
  },
  wireless: {
    label: 'Wireless',
    icon: Terminal,
    examples: ['wireless_clients', 'capsman_caps'],
  },
  services: {
    label: 'Serviços',
    icon: Code2,
    examples: ['queue_simple', 'hotspot_users', 'hotspot_active', 'usermanager_users'],
  },
  avancado: {
    label: 'Avançado',
    icon: Terminal,
    examples: ['mpls_ldp', 'ipv6_address'],
  },
};

export default function APIPython() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('basico');

  const allExamples = useMemo(() => {
    return Object.entries(PYTHON_API_EXAMPLES).map(([key, example]) => ({
      id: key,
      ...example,
    }));
  }, []);

  const filteredExamples = useMemo(() => {
    if (!searchQuery.trim()) {
      return allExamples.filter((ex) =>
        CATEGORIES[activeCategory as keyof typeof CATEGORIES]?.examples.includes(ex.id)
      );
    }
    
    const query = searchQuery.toLowerCase();
    return allExamples.filter(
      (ex) =>
        ex.titulo.toLowerCase().includes(query) ||
        ex.descricao.toLowerCase().includes(query) ||
        ex.codigo.toLowerCase().includes(query)
    );
  }, [searchQuery, activeCategory, allExamples]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: 'Código copiado!',
        description: 'O código foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive',
      });
    }
  };

  const selectedExampleData = selectedExample
    ? PYTHON_API_EXAMPLES[selectedExample as keyof typeof PYTHON_API_EXAMPLES]
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">API Python RouterOS</h1>
            <p className="text-muted-foreground mt-1">
              Exemplos de código para automação com librouteros
            </p>
          </div>

          {/* Instalação */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <span className="font-mono text-sm">pip install librouteros</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('pip install librouteros', 'install')}
                >
                  {copiedId === 'install' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <a
                  href="https://pypi.org/project/librouteros/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm flex items-center gap-1 ml-auto"
                >
                  PyPI <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conexão Básica */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Conexão Básica
            </CardTitle>
            <CardDescription>Template de conexão para todos os exemplos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code className="text-foreground">{PYTHON_API_INTRO.trim()}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(PYTHON_API_INTRO.trim(), 'intro')}
              >
                {copiedId === 'intro' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exemplos (ex: firewall, dhcp, ospf...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        {!searchQuery && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Examples Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Examples List */}
          <Card className="lg:max-h-[600px] overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Exemplos</CardTitle>
              <CardDescription>
                {filteredExamples.length} exemplo{filteredExamples.length !== 1 ? 's' : ''} encontrado{filteredExamples.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4 pt-0">
                  <AnimatePresence mode="popLayout">
                    {filteredExamples.map((example) => (
                      <motion.div
                        key={example.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        layout
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            selectedExample === example.id
                              ? 'border-primary bg-primary/5'
                              : ''
                          }`}
                          onClick={() => setSelectedExample(example.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">
                                  {example.titulo}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {example.descricao}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredExamples.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhum exemplo encontrado
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Code Preview */}
          <Card className="lg:max-h-[600px] overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedExampleData?.titulo || 'Selecione um exemplo'}
                  </CardTitle>
                  {selectedExampleData && (
                    <CardDescription className="mt-1">
                      {selectedExampleData.descricao}
                    </CardDescription>
                  )}
                </div>
                {selectedExampleData && (
                  <Button
                    size="sm"
                    onClick={() =>
                      copyToClipboard(selectedExampleData.codigo, selectedExample!)
                    }
                  >
                    {copiedId === selectedExample ? (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" /> Copiar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {selectedExampleData ? (
                  <div className="p-4 pt-0 space-y-4">
                    {/* Code */}
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          Python
                        </Badge>
                      </div>
                      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        <code className="text-foreground whitespace-pre-wrap">
                          {selectedExampleData.codigo}
                        </code>
                      </pre>
                    </div>

                    {/* Output */}
                    {'saida' in selectedExampleData && selectedExampleData.saida && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Saída esperada</span>
                        </div>
                        <pre className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                          <code className="text-green-700 dark:text-green-400 whitespace-pre-wrap">
                            {(selectedExampleData as { saida?: string }).saida}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um exemplo à esquerda</p>
                      <p className="text-sm mt-1">para ver o código</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Reference Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Referências Oficiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://help.mikrotik.com/docs/display/ROS/API"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="text-sm">Documentação API RouterOS</span>
              </a>
              <a
                href="https://pypi.org/project/librouteros/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="text-sm">librouteros no PyPI</span>
              </a>
              <a
                href="https://github.com/luqasz/librouteros"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="text-sm">GitHub librouteros</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
