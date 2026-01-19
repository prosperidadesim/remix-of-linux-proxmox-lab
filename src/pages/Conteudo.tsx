import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApi } from '@/hooks/useApi';
import { PDFViewer } from '@/components/content/PDFViewer';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  FileText,
  Video,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  BookOpen,
  Download,
  Share2,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContentDetail {
  id: number;
  title: string;
  description: string;
  type: 'pdf' | 'video';
  track: string;
  tags: string[];
  level: 'iniciante' | 'intermediario' | 'avancado';
  featured: boolean;
  filePath: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
}

interface ContentProgress {
  status: 'em_andamento' | 'concluido';
  lastPosition: number;
  progressData: Record<string, unknown>;
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

export default function Conteudo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchApi, apiUrl } = useApi();
  
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [progress, setProgress] = useState<ContentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const [contentRes, progressRes] = await Promise.all([
        fetchApi(`/api/contents/${id}`),
        fetchApi(`/api/contents/${id}/progress`),
      ]);
      
      if (!contentRes.ok) throw new Error('Conteúdo não encontrado');
      
      setContent(await contentRes.json());
      
      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conteúdo');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = useCallback(async (position: number, completed = false) => {
    if (!id || isSaving) return;
    
    setIsSaving(true);
    try {
      const res = await fetchApi(`/api/contents/${id}/progress`, {
        method: 'PUT',
        body: JSON.stringify({
          lastPosition: position,
          status: completed ? 'concluido' : 'em_andamento',
        }),
      });
      
      if (res.ok) {
        const updatedProgress = await res.json();
        setProgress(updatedProgress);
      }
    } catch (err) {
      console.error('Erro ao salvar progresso:', err);
    } finally {
      setIsSaving(false);
    }
  }, [id, isSaving, fetchApi]);

  const handlePDFPageChange = (page: number) => {
    // Calculate percentage based on page (assuming we don't know total pages)
    saveProgress(page);
  };

  const handleVideoTimeUpdate = (time: number) => {
    if (content?.duration) {
      const percentage = (time / content.duration) * 100;
      saveProgress(time);
    }
  };

  const handleVideoComplete = () => {
    saveProgress(content?.duration || 0, true);
    toast.success('Parabéns! Você concluiu este conteúdo!');
  };

  const handleMarkComplete = async () => {
    saveProgress(100, true);
    toast.success('Conteúdo marcado como concluído!');
  };

  const getFileUrl = () => {
    if (!content?.filePath) return '';
    return `${apiUrl}/api/files/${content.type}/${content.filePath}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !content) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="p-12 text-center border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Erro ao carregar conteúdo</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/biblioteca')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Biblioteca
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/biblioteca')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Biblioteca
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-2 rounded-lg",
                content.type === 'pdf' ? 'bg-info/10' : 'bg-primary/10'
              )}>
                {content.type === 'pdf' ? (
                  <FileText className="h-6 w-6 text-info" />
                ) : (
                  <Video className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {content.title}
                  {content.featured && <Star className="h-5 w-5 text-warning fill-warning" />}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{content.track}</Badge>
                  <Badge variant="outline" className={levelColors[content.level]}>
                    {levelLabels[content.level]}
                  </Badge>
                  {content.type === 'video' && content.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(content.duration)}
                    </span>
                  )}
                  {content.fileSize && (
                    <span>{formatFileSize(content.fileSize)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress & Actions */}
          <div className="flex flex-col items-end gap-2">
            {progress?.status === 'concluido' ? (
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="h-4 w-4 mr-1" />
                Concluído
              </Badge>
            ) : progress ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Em andamento</span>
                <Progress value={progress.lastPosition} className="w-24 h-2" />
              </div>
            ) : null}
            
            <div className="flex items-center gap-2">
              {progress?.status !== 'concluido' && (
                <Button variant="outline" size="sm" onClick={handleMarkComplete}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Marcar como concluído
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={getFileUrl()} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        {content.description && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground">{content.description}</p>
              
              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {content.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Viewer */}
        <Card className="overflow-hidden">
          {content.type === 'pdf' ? (
            <PDFViewer
              url={getFileUrl()}
              title={content.title}
              currentPage={progress?.lastPosition || 1}
              onPageChange={handlePDFPageChange}
              className="h-[70vh]"
            />
          ) : (
            <VideoPlayer
              url={getFileUrl()}
              title={content.title}
              currentTime={progress?.lastPosition || 0}
              onTimeUpdate={handleVideoTimeUpdate}
              onComplete={handleVideoComplete}
              className="aspect-video"
            />
          )}
        </Card>

        {/* Saving indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Salvando progresso...</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
