import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Video,
  Search,
  Filter,
  Play,
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Loader2,
  AlertCircle,
  Grid3X3,
  List,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Content {
  id: number;
  title: string;
  description: string;
  type: 'pdf' | 'video';
  track: string;
  tags: string[];
  level: 'iniciante' | 'intermediario' | 'avancado';
  featured: boolean;
  duration?: number;
  fileSize?: number;
  progress?: {
    status: 'em_andamento' | 'concluido';
    lastPosition: number;
  };
}

const levelLabels: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const levelColors: Record<string, string> = {
  iniciante: 'bg-success/10 text-success border-success/30',
  intermediario: 'bg-warning/10 text-warning border-warning/30',
  avancado: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function Biblioteca() {
  const { fetchApi, apiUrl } = useApi();
  const navigate = useNavigate();
  
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetchApi('/api/contents');
      if (!res.ok) throw new Error('Erro ao carregar conteúdos');
      
      const data = await res.json();
      setContents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique tracks for filter
  const tracks = [...new Set(contents.map(c => c.track))];

  // Filter and sort contents
  const filteredContents = contents
    .filter(content => {
      const matchesSearch = 
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTrack = selectedTrack === 'all' || content.track === selectedTrack;
      const matchesLevel = selectedLevel === 'all' || content.level === selectedLevel;
      const matchesType = selectedType === 'all' || content.type === selectedType;
      
      return matchesSearch && matchesTrack && matchesLevel && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'level':
          const levels = ['iniciante', 'intermediario', 'avancado'];
          return levels.indexOf(a.level) - levels.indexOf(b.level);
        case 'progress':
          const progressA = a.progress?.status === 'concluido' ? 100 : a.progress?.lastPosition || 0;
          const progressB = b.progress?.status === 'concluido' ? 100 : b.progress?.lastPosition || 0;
          return progressB - progressA;
        default:
          return b.id - a.id;
      }
    });

  // Split by featured
  const featuredContents = filteredContents.filter(c => c.featured);
  const regularContents = filteredContents.filter(c => !c.featured);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const ContentCard = ({ content }: { content: Content }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="h-full card-hover cursor-pointer group" onClick={() => navigate(`/conteudo/${content.id}`)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              content.type === 'pdf' ? 'bg-info/10' : 'bg-primary/10'
            )}>
              {content.type === 'pdf' ? (
                <FileText className="h-5 w-5 text-info" />
              ) : (
                <Video className="h-5 w-5 text-primary" />
              )}
            </div>
            {content.featured && (
              <Star className="h-5 w-5 text-warning fill-warning" />
            )}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {content.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {content.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{content.track}</Badge>
            <Badge variant="outline" className={levelColors[content.level]}>
              {levelLabels[content.level]}
            </Badge>
          </div>
          
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {content.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {content.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{content.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {content.type === 'video' && content.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(content.duration)}
              </span>
            )}
            {content.type === 'pdf' && content.fileSize && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {formatFileSize(content.fileSize)}
              </span>
            )}
          </div>
          
          {content.progress && (
            <div className="flex items-center gap-2">
              {content.progress.status === 'concluido' ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Progress value={content.progress.lastPosition} className="w-16 h-1.5" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(content.progress.lastPosition)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Biblioteca</h1>
            <p className="text-muted-foreground">
              PDFs e vídeos para aprofundar seus estudos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descrição ou tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="video">Vídeos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trilha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as trilhas</SelectItem>
                  {tracks.map(track => (
                    <SelectItem key={track} value={track}>{track}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="title">Título A-Z</SelectItem>
                  <SelectItem value="level">Por nível</SelectItem>
                  <SelectItem value="progress">Por progresso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/10">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredContents.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground">
              {contents.length === 0 
                ? 'A biblioteca ainda não possui conteúdos. Aguarde o administrador adicionar materiais.'
                : 'Tente ajustar os filtros de busca.'}
            </p>
          </Card>
        )}

        {/* Featured contents */}
        {!isLoading && featuredContents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Destaques
            </h2>
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}>
              {featuredContents.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </div>
        )}

        {/* Regular contents */}
        {!isLoading && regularContents.length > 0 && (
          <div className="space-y-4">
            {featuredContents.length > 0 && (
              <h2 className="text-xl font-semibold">Todos os conteúdos</h2>
            )}
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}>
              {regularContents.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </div>
        )}

        {/* Stats footer */}
        {!isLoading && filteredContents.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {filteredContents.length} de {contents.length} conteúdos
          </div>
        )}
      </div>
    </Layout>
  );
}
