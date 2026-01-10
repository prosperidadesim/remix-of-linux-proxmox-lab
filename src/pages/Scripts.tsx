import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Network,
  Router,
  Wifi,
  Shield,
  Lock,
  Gauge,
  Users,
  Save,
  Search,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  FileCode,
  Terminal,
  BookOpen,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCRIPTS, SCRIPT_CATEGORIES, Script } from '@/data/scripts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, React.ElementType> = {
  Network: Network,
  Router: Router,
  Wifi: Wifi,
  Shield: Shield,
  Lock: Lock,
  Gauge: Gauge,
  Users: Users,
  Save: Save,
};

export default function Scripts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const filteredScripts = useMemo(() => {
    return SCRIPTS.filter(script => {
      const matchesSearch = 
        script.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.equipamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || script.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast({
        title: 'Código copiado!',
        description: 'O script foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Terminal className="h-8 w-8 text-primary" />
            Scripts de Configuração
          </h1>
          <p className="text-muted-foreground">
            Exemplos prontos de configuração para equipamentos MikroTik
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedScript ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar scripts por nome, equipamento ou tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2"
                >
                  <FileCode className="h-4 w-4" />
                  Todos
                </Button>
                {SCRIPT_CATEGORIES.map((cat) => {
                  const Icon = iconMap[cat.icone] || FileCode;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {cat.nome}
                    </Button>
                  );
                })}
              </div>

              {/* Scripts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredScripts.map((script, idx) => {
                  const category = SCRIPT_CATEGORIES.find(c => c.id === script.categoria);
                  const Icon = iconMap[category?.icone || 'FileCode'] || FileCode;
                  
                  return (
                    <motion.div
                      key={script.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] h-full"
                        onClick={() => setSelectedScript(script)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {script.equipamento}
                              </Badge>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-lg mt-3">{script.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {script.descricao}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {script.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {filteredScripts.length === 0 && (
                <div className="text-center py-16">
                  <FileCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum script encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou termos de busca.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedScript(null)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar para lista
              </Button>

              {/* Script Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default">{selectedScript.equipamento}</Badge>
                        <Badge variant="outline">{selectedScript.categoria}</Badge>
                      </div>
                      <h2 className="text-2xl font-bold">{selectedScript.titulo}</h2>
                      <p className="text-muted-foreground mt-2">{selectedScript.descricao}</p>
                      <div className="flex flex-wrap gap-1 mt-4">
                        {selectedScript.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="codigo" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                  <TabsTrigger value="codigo" className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Código
                  </TabsTrigger>
                  <TabsTrigger value="explicacao" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Explicação
                  </TabsTrigger>
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="codigo" className="mt-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Terminal className="h-5 w-5" />
                          Script RouterOS
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(selectedScript.codigo)}
                          className="flex items-center gap-2"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px] w-full rounded-lg border bg-muted/30">
                        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                          <code>{selectedScript.codigo}</code>
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="explicacao" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Explicação Detalhada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {selectedScript.explicacao}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="info" className="mt-6 space-y-4">
                  {selectedScript.requisitos && selectedScript.requisitos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          Requisitos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedScript.requisitos.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                              <span className="text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {selectedScript.observacoes && selectedScript.observacoes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          Observações Importantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedScript.observacoes.map((obs, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Equipamento:</span>
                          <p className="font-medium">{selectedScript.equipamento}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Categoria:</span>
                          <p className="font-medium capitalize">{selectedScript.categoria}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedScript.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
