import { useState, useMemo, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Search, 
  Upload, 
  Download, 
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  FileJson,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, CATEGORIES, Difficulty } from '@/types/question';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BancoQuestoes() {
  const { questions, importQuestions, exportQuestions } = useStudyStore();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('todas');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Question[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = search === '' || 
        q.pergunta.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === 'todas' || q.categoria === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'todas' || q.dificuldade === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [questions, search, categoryFilter, difficultyFilter]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsed: any[];

        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          parsed = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((h, i) => obj[h] = values[i]?.trim());
            return obj;
          });
        } else {
          throw new Error('Formato não suportado. Use JSON ou CSV.');
        }

        if (!Array.isArray(parsed)) {
          throw new Error('O arquivo deve conter um array de questões.');
        }

        const errors: string[] = [];
        const validQuestions: Question[] = [];

        parsed.forEach((q, idx) => {
          const questionErrors: string[] = [];
          
          if (!q.id) questionErrors.push('id ausente');
          if (!q.pergunta) questionErrors.push('pergunta ausente');
          if (!q.opcoes || !Array.isArray(q.opcoes) || q.opcoes.length < 2) questionErrors.push('opções inválidas');
          if (q.corretaIndex === undefined || q.corretaIndex < 0) questionErrors.push('corretaIndex inválido');
          if (!q.explicacaoCorreta) questionErrors.push('explicação ausente');
          if (!q.linksOficiais || !Array.isArray(q.linksOficiais) || q.linksOficiais.length === 0) questionErrors.push('links oficiais ausentes');

          if (questionErrors.length > 0) {
            errors.push(`Questão ${idx + 1} (${q.id || 'sem id'}): ${questionErrors.join(', ')}`);
          } else {
            validQuestions.push({
              id: q.id,
              categoria: q.categoria || 'Misc',
              dificuldade: q.dificuldade || 'Medium',
              pergunta: q.pergunta,
              opcoes: q.opcoes,
              corretaIndex: q.corretaIndex,
              explicacaoCorreta: q.explicacaoCorreta,
              explicacoesPorOpcao: q.explicacoesPorOpcao || q.opcoes.map(() => ''),
              linksOficiais: q.linksOficiais,
              tags: q.tags || [],
              rosVersion: q.rosVersion || 'ambos',
              comandoRelacionado: q.comandoRelacionado,
            });
          }
        });

        setImportErrors(errors);
        setImportPreview(validQuestions);
        setImportDialogOpen(true);
      } catch (err: any) {
        toast.error('Erro ao processar arquivo', { description: err.message });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = () => {
    if (importPreview && importPreview.length > 0) {
      importQuestions(importPreview);
      toast.success(`${importPreview.length} questões importadas com sucesso!`);
      setImportDialogOpen(false);
      setImportPreview(null);
      setImportErrors([]);
    }
  };

  const handleExport = () => {
    const data = exportQuestions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mikrotik-questions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Banco de questões exportado!');
  };

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      counts[q.categoria] = (counts[q.categoria] || 0) + 1;
    });
    return counts;
  }, [questions]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Banco de Questões</h1>
            <p className="text-muted-foreground">{questions.length} questões disponíveis</p>
          </div>
          
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json,.csv"
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="gap-2"
            >
              <Upload className="h-5 w-5" />
              Importar (JSON/CSV)
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-5 w-5" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por pergunta ou tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat} ({categoryCount[cat] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Easy">Fácil</SelectItem>
                  <SelectItem value="Medium">Médio</SelectItem>
                  <SelectItem value="Hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions Grid */}
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-3 pr-4">
            {filteredQuestions.map(question => {
              const isExpanded = expandedQuestion === question.id;
              
              return (
                <Card 
                  key={question.id}
                  className={cn(
                    "transition-all cursor-pointer",
                    isExpanded && "ring-2 ring-primary"
                  )}
                >
                  <CardHeader 
                    className="p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge>{question.categoria}</Badge>
                          <Badge variant={
                            question.dificuldade === 'Easy' ? 'default' :
                            question.dificuldade === 'Medium' ? 'secondary' : 'destructive'
                          }>
                            {question.dificuldade === 'Easy' ? 'Fácil' :
                             question.dificuldade === 'Medium' ? 'Médio' : 'Difícil'}
                          </Badge>
                          <Badge variant="outline">{question.rosVersion}</Badge>
                        </div>
                        <p className="font-medium line-clamp-2">{question.pergunta}</p>
                        <div className="flex gap-1 flex-wrap">
                          {question.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                          {question.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{question.tags.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="border-t pt-4 space-y-4">
                          <div className="space-y-2">
                            {question.opcoes.map((opcao, idx) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "p-3 rounded-lg border",
                                  idx === question.corretaIndex && "border-success bg-success/5"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <span className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                    idx === question.corretaIndex ? "bg-success text-success-foreground" : "bg-muted"
                                  )}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className="flex-1">{opcao}</span>
                                  {idx === question.corretaIndex && <CheckCircle2 className="h-5 w-5 text-success" />}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm"><strong>Explicação:</strong> {question.explicacaoCorreta}</p>
                          </div>
                          
                          {question.comandoRelacionado && (
                            <div className="p-3 rounded-lg bg-primary/5 font-mono text-sm">
                              <strong>Comando:</strong> {question.comandoRelacionado}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {question.linksOficiais.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {link.titulo}
                              </a>
                            ))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma questão encontrada.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Importar Questões
              </DialogTitle>
              <DialogDescription>
                Revise as questões antes de confirmar a importação
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {importErrors.length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    <AlertCircle className="h-4 w-4" />
                    {importErrors.length} questões com erros (ignoradas)
                  </div>
                  <ul className="text-sm space-y-1 text-destructive/80">
                    {importErrors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                    {importErrors.length > 5 && (
                      <li>... e mais {importErrors.length - 5} erros</li>
                    )}
                  </ul>
                </div>
              )}

              {importPreview && importPreview.length > 0 && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success font-medium mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {importPreview.length} questões válidas para importação
                  </div>
                  <div className="space-y-2">
                    {importPreview.slice(0, 3).map((q, idx) => (
                      <div key={idx} className="text-sm p-2 bg-background rounded">
                        <Badge className="mb-1">{q.categoria}</Badge>
                        <p className="line-clamp-1">{q.pergunta}</p>
                      </div>
                    ))}
                    {importPreview.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        ... e mais {importPreview.length - 3} questões
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(!importPreview || importPreview.length === 0) && importErrors.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma questão válida encontrada no arquivo.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmImport}
                disabled={!importPreview || importPreview.length === 0}
              >
                Confirmar Importação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
