import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  MoreHorizontal,
  Search,
  Star,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Content,
  loadContentsFromStorage,
  saveContentsToStorage,
} from '@/data/mockContents';
import { PDFViewer } from '@/components/content/PDFViewer';
import { VideoPlayer } from '@/components/content/VideoPlayer';

const levelLabels: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
};

interface ContentFormData {
  title: string;
  description: string;
  type: 'pdf' | 'video';
  track: string;
  tags: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  status: 'rascunho' | 'publicado';
  featured: boolean;
}

const defaultFormData: ContentFormData = {
  title: '',
  description: '',
  type: 'pdf',
  track: 'Linux Essentials',
  tags: '',
  level: 'iniciante',
  status: 'rascunho',
  featured: false,
};

const tracks = ['Linux Essentials', 'Proxmox VE'];

export default function ContentManager() {
  const [contents, setContents] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<'pdf' | 'video'>('pdf');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState<ContentFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = () => {
    const loaded = loadContentsFromStorage();
    setContents(loaded);
  };

  const filteredContents = contents
    .filter(c => c.type === activeTab)
    .filter(c => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrack = filterTrack === 'all' || c.track === filterTrack;
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchesSearch && matchesTrack && matchesStatus;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleOpenForm = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        description: content.description,
        type: content.type,
        track: content.track,
        tags: content.tags.join(', '),
        level: content.level,
        status: content.status,
        featured: content.featured,
      });
    } else {
      setEditingContent(null);
      setFormData({ ...defaultFormData, type: activeTab });
    }
    setSelectedFile(null);
    setUploadProgress(0);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setIsSubmitting(true);

    // Simulate upload if file selected
    if (selectedFile) {
      setIsUploading(true);
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setUploadProgress(i);
      }
      setIsUploading(false);
    }

    const now = new Date().toISOString();
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingContent) {
      // Update existing
      const updated = contents.map(c =>
        c.id === editingContent.id
          ? {
              ...c,
              ...formData,
              tags: tagsArray,
              updatedAt: now,
              fileSize: selectedFile?.size || c.fileSize,
            }
          : c
      );
      setContents(updated);
      saveContentsToStorage(updated);
      toast.success('Conteúdo atualizado!');
    } else {
      // Create new
      const newContent: Content = {
        id: Date.now(),
        ...formData,
        tags: tagsArray,
        sortOrder: contents.filter(c => c.type === formData.type).length + 1,
        fileSize: selectedFile?.size || 0,
        duration: formData.type === 'video' ? 0 : undefined,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...contents, newContent];
      setContents(updated);
      saveContentsToStorage(updated);
      toast.success('Conteúdo criado!');
    }

    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  const handleDelete = (content: Content) => {
    if (!confirm(`Excluir "${content.title}"? Esta ação não pode ser desfeita.`)) return;
    
    const updated = contents.filter(c => c.id !== content.id);
    setContents(updated);
    saveContentsToStorage(updated);
    toast.success('Conteúdo excluído');
  };

  const handleToggleStatus = (content: Content) => {
    const newStatus = content.status === 'publicado' ? 'rascunho' : 'publicado';
    const updated = contents.map(c =>
      c.id === content.id
        ? { ...c, status: newStatus as 'rascunho' | 'publicado', updatedAt: new Date().toISOString() }
        : c
    );
    setContents(updated);
    saveContentsToStorage(updated);
    toast.success(newStatus === 'publicado' ? 'Conteúdo publicado!' : 'Conteúdo despublicado');
  };

  const handleToggleFeatured = (content: Content) => {
    const updated = contents.map(c =>
      c.id === content.id
        ? { ...c, featured: !c.featured, updatedAt: new Date().toISOString() }
        : c
    );
    setContents(updated);
    saveContentsToStorage(updated);
    toast.success(content.featured ? 'Destaque removido' : 'Marcado como destaque');
  };

  const handlePreview = (content: Content) => {
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Conteúdos</h2>
          <p className="text-muted-foreground">PDFs e vídeos da biblioteca</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pdf' | 'video')}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDFs ({contents.filter(c => c.type === 'pdf').length})
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vídeos ({contents.filter(c => c.type === 'video').length})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <Select value={filterTrack} onValueChange={setFilterTrack}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trilha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {tracks.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="pdf" className="mt-4">
          <ContentTable
            contents={filteredContents}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onToggleStatus={handleToggleStatus}
            onToggleFeatured={handleToggleFeatured}
            formatFileSize={formatFileSize}
            formatDuration={formatDuration}
          />
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <ContentTable
            contents={filteredContents}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onToggleStatus={handleToggleStatus}
            onToggleFeatured={handleToggleFeatured}
            formatFileSize={formatFileSize}
            formatDuration={formatDuration}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
            </DialogTitle>
            <DialogDescription>
              {editingContent
                ? 'Atualize as informações do conteúdo'
                : 'Adicione um novo PDF ou vídeo à biblioteca'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as 'pdf' | 'video' })}
                  disabled={!!editingContent}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trilha</Label>
                <Select
                  value={formData.track}
                  onValueChange={(v) => setFormData({ ...formData, track: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Introdução ao Linux"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva brevemente o conteúdo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nível</Label>
                <Select
                  value={formData.level}
                  onValueChange={(v) => setFormData({ ...formData, level: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="linux, básico, comandos"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
              />
              <Label htmlFor="featured">Marcar como destaque</Label>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={formData.type === 'pdf' ? '.pdf' : '.mp4,.webm'}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 mx-auto text-success" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste o arquivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.type === 'pdf' ? 'PDF até 100MB' : 'MP4/WebM até 500MB'}
                    </p>
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-muted-foreground text-center">
                    Enviando... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              <strong>Nota:</strong> No modo preview, os arquivos não são realmente enviados.
              Configure o backend local para upload funcional.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingContent ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewContent?.title}</DialogTitle>
            <DialogDescription>{previewContent?.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {previewContent?.type === 'pdf' ? (
              <PDFViewer url="" title={previewContent.title} />
            ) : (
              <VideoPlayer url="" title={previewContent?.title || ''} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Content Table Component
interface ContentTableProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
  onPreview: (content: Content) => void;
  onToggleStatus: (content: Content) => void;
  onToggleFeatured: (content: Content) => void;
  formatFileSize: (bytes?: number) => string;
  formatDuration: (seconds?: number) => string;
}

function ContentTable({
  contents,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  onToggleFeatured,
  formatFileSize,
  formatDuration,
}: ContentTableProps) {
  if (contents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum conteúdo</h3>
        <p className="text-muted-foreground">
          Adicione o primeiro conteúdo clicando no botão acima.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Trilha</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.map((content) => (
            <TableRow key={content.id}>
              <TableCell>
                {content.featured && (
                  <Star className="h-4 w-4 text-warning fill-warning" />
                )}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium line-clamp-1">{content.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {content.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{content.track}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    content.level === 'iniciante' && 'bg-success/10 text-success',
                    content.level === 'intermediario' && 'bg-warning/10 text-warning',
                    content.level === 'avancado' && 'bg-destructive/10 text-destructive'
                  )}
                >
                  {levelLabels[content.level]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {content.type === 'video'
                    ? formatDuration(content.duration)
                    : formatFileSize(content.fileSize)}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={content.status === 'publicado' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => onToggleStatus(content)}
                >
                  {content.status === 'publicado' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {statusLabels[content.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPreview(content)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(content)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleFeatured(content)}>
                      <Star className="h-4 w-4 mr-2" />
                      {content.featured ? 'Remover destaque' : 'Destacar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(content)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
