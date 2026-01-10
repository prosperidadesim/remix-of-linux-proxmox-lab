import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Palette, 
  RotateCcw, 
  Trash2,
  Moon,
  Sun,
  Info,
  Github
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Configuracoes() {
  const { theme, toggleTheme } = useTheme();
  const { progress, questions } = useStudyStore();
  const [isClearing, setIsClearing] = useState(false);

  const clearProgress = () => {
    localStorage.removeItem('mikrotik-progress');
    localStorage.removeItem('mikrotik-answers');
    localStorage.removeItem('mikrotik-exams');
    toast.success('Progresso resetado com sucesso!');
    window.location.reload();
  };

  const clearAllData = () => {
    localStorage.removeItem('mikrotik-questions');
    localStorage.removeItem('mikrotik-progress');
    localStorage.removeItem('mikrotik-answers');
    localStorage.removeItem('mikrotik-exams');
    toast.success('Todos os dados foram limpos!');
    window.location.reload();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência de estudo</p>
        </div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize o visual do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <Label className="text-base">Tema Escuro</Label>
                    <p className="text-sm text-muted-foreground">Alterne entre tema claro e escuro</p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Gerenciar Dados
              </CardTitle>
              <CardDescription>Gerencie seu progresso e banco de questões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">{questions.length}</p>
                    <p className="text-muted-foreground">Questões no banco</p>
                  </div>
                  <div>
                    <p className="font-medium">{progress.totalAnswered}</p>
                    <p className="text-muted-foreground">Respostas registradas</p>
                  </div>
                  <div>
                    <p className="font-medium">{progress.questionsAnswered.length}</p>
                    <p className="text-muted-foreground">Questões únicas estudadas</p>
                  </div>
                  <div>
                    <p className="font-medium">{progress.markedForReview.length}</p>
                    <p className="text-muted-foreground">Marcadas para revisão</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Resetar Progresso
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Resetar Progresso?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá apagar todo o seu histórico de respostas e progresso. 
                        O banco de questões será mantido. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={clearProgress}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="h-4 w-4" />
                      Limpar Todos os Dados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar Todos os Dados?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá apagar TODOS os dados: banco de questões, progresso, 
                        histórico de respostas e simulados. O banco padrão será restaurado. 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllData} className="bg-destructive hover:bg-destructive/90">
                        Limpar Tudo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gradient">MikroTik Study Lab</h3>
                <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
                <p className="text-sm text-muted-foreground">
                  Plataforma de estudos para certificação MTCNA
                </p>
              </div>
              
              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suporte RouterOS</span>
                  <span>v6 & v7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Armazenamento</span>
                  <span>Local (navegador)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idioma</span>
                  <span>Português (BR)</span>
                </div>
              </div>

              <Separator />

              <div className="text-center text-xs text-muted-foreground">
                <p>
                  Links oficiais: {' '}
                  <a 
                    href="https://help.mikrotik.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    help.mikrotik.com
                  </a>
                  {' '} • {' '}
                  <a 
                    href="https://wiki.mikrotik.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    wiki.mikrotik.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
