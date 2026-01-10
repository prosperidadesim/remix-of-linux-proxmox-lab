import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  BookOpen, 
  Settings, 
  Users,
  Monitor,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function Ajuda() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const generateInstallationPDF = () => {
    setIsGenerating('instalacao');
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let y = margin;

      const addTitle = (text: string, size: number = 16) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.setFontSize(size);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += lineHeight + 3;
      };

      const addSubtitle = (text: string) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += lineHeight;
      };

      const addText = (text: string) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (y > pageHeight - 20) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += lineHeight - 1;
        });
      };

      const addCode = (code: string) => {
        if (y > pageHeight - 40) { doc.addPage(); y = margin; }
        doc.setFillColor(245, 245, 245);
        const lines = code.split('\n');
        const boxHeight = lines.length * 5 + 10;
        doc.rect(margin, y - 3, pageWidth - 2 * margin, boxHeight, 'F');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.setFont('courier', 'normal');
        lines.forEach((line) => {
          if (y > pageHeight - 20) { doc.addPage(); y = margin; }
          doc.text(line, margin + 5, y + 3);
          y += 5;
        });
        y += 8;
      };

      const addSpace = (size: number = 5) => { y += size; };

      // Cover
      doc.setFillColor(0, 102, 204);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Manual de Instalação', pageWidth / 2, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('MikroTik Study Lab', pageWidth / 2, 45, { align: 'center' });
      y = 80;

      // Content
      addTitle('Requisitos do Sistema');
      addSubtitle('Servidor (Backend)');
      addText('• Node.js 18 ou superior');
      addText('• npm ou yarn');
      addText('• Sistema operacional: Windows, Linux ou macOS');
      addText('• Mínimo 512MB de RAM');
      addText('• 100MB de espaço em disco');
      addSpace();
      addSubtitle('Cliente (Frontend)');
      addText('• Navegador moderno (Chrome, Firefox, Edge, Safari)');
      addText('• Conexão de rede com o servidor');
      addSpace(10);

      addTitle('Instalação Rápida');
      addSubtitle('Passo 1: Baixar o Projeto');
      addCode('git clone https://github.com/SEU_USUARIO/mikrotik-study-lab.git\ncd mikrotik-study-lab');
      
      addSubtitle('Passo 2: Instalar o Backend');
      addCode('cd backend\nnpm install\nnpm start');
      addText('Você verá uma mensagem com as credenciais padrão: admin / admin123');
      addSpace();

      addSubtitle('Passo 3: Instalar o Frontend');
      addText('Em outro terminal:');
      addCode('cd ..\nnpm install\nnpm run dev');

      addSubtitle('Passo 4: Acessar o Sistema');
      addText('Abra o navegador e acesse: http://localhost:5173');
      addSpace(10);

      doc.addPage();
      y = margin;

      addTitle('Instalação em Rede Local');
      addSubtitle('Opção A: Acesso Direto');
      addText('1. Descubra o IP do servidor (ip addr show ou ipconfig)');
      addText('2. Inicie com: npm run dev -- --host 0.0.0.0');
      addText('3. Acesse via: http://IP_DO_SERVIDOR:5173');
      addText('4. Configure a URL da API na tela de login');
      addSpace();

      addSubtitle('Opção B: Produção com Nginx');
      addText('1. Compile: npm run build');
      addText('2. Instale o Nginx');
      addText('3. Configure o proxy para a API');
      addText('4. Use PM2 para manter o backend rodando');
      addSpace(10);

      addTitle('Configuração de Email (Opcional)');
      addText('Para recuperação de senha por email, configure:');
      addCode('export SMTP_HOST=smtp.gmail.com\nexport SMTP_PORT=587\nexport SMTP_USER=seu.email@gmail.com\nexport SMTP_PASS=sua_senha_de_app\nexport APP_URL=http://seu-servidor:5173');
      addSpace(10);

      addTitle('Segurança');
      addText('IMPORTANTE: Altere a senha padrão do admin após a instalação!');
      addText('Configure JWT_SECRET com uma chave segura em produção.');
      addSpace(10);

      addTitle('Backup');
      addText('O banco de dados fica em: backend/database.sqlite');
      addText('Para backup, copie este arquivo regularmente.');
      addCode('cp backend/database.sqlite backup/database_$(date +%Y%m%d).sqlite');

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`MikroTik Study Lab - Manual de Instalação - Página ${i}/${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save('Manual_Instalacao_MikroTik_Study_Lab.pdf');
      toast.success('Manual de Instalação baixado!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(null);
    }
  };

  const generateUserManualPDF = () => {
    setIsGenerating('usuario');
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let y = margin;

      const addTitle = (text: string, size: number = 16) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.setFontSize(size);
        doc.setTextColor(0, 102, 204);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += lineHeight + 3;
      };

      const addSubtitle = (text: string) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        y += lineHeight;
      };

      const addText = (text: string) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (y > pageHeight - 20) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += lineHeight - 1;
        });
      };

      const addBullet = (text: string) => {
        addText('• ' + text);
      };

      const addSpace = (size: number = 5) => { y += size; };

      // Cover
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Manual do Usuário', pageWidth / 2, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('MikroTik Study Lab', pageWidth / 2, 45, { align: 'center' });
      y = 80;

      // Content
      addTitle('Introdução');
      addText('O MikroTik Study Lab é uma plataforma de estudos para certificações MikroTik. Permite estudar questões, fazer simulados, acompanhar seu progresso e gerenciar a equipe.');
      addSpace(10);

      addTitle('Acesso ao Sistema');
      addSubtitle('Login');
      addText('1. Acesse o endereço do sistema no navegador');
      addText('2. Digite seu usuário ou email');
      addText('3. Digite sua senha');
      addText('4. Clique em Entrar');
      addSpace();
      addSubtitle('Esqueci a Senha');
      addText('1. Clique em "Esqueceu a senha?"');
      addText('2. Digite seu email cadastrado');
      addText('3. Siga as instruções recebidas');
      addSpace(10);

      addTitle('Áreas do Sistema');
      addBullet('Estudar: Questões para estudo livre');
      addBullet('Simulado: Provas simuladas cronometradas');
      addBullet('Revisão: Questões marcadas e erradas');
      addBullet('Banco de Questões: Gerenciar questões');
      addBullet('Scripts: Scripts úteis do RouterOS');
      addBullet('API Python: Exemplos de automação');
      addBullet('Estatísticas: Seu desempenho detalhado');
      addBullet('Configurações: Preferências e conta');
      addBullet('Painel Admin: Gerenciar equipe (admin)');
      addSpace(10);

      doc.addPage();
      y = margin;

      addTitle('Como Estudar');
      addText('1. Acesse "Estudar" no menu');
      addText('2. Selecione os filtros desejados (certificação, categoria, dificuldade)');
      addText('3. Clique em "Iniciar Estudo"');
      addText('4. Para cada questão:');
      addText('   - Leia atentamente');
      addText('   - Selecione sua resposta');
      addText('   - Clique em "Confirmar"');
      addText('   - Veja a explicação detalhada');
      addSpace();
      addSubtitle('Recursos das Questões');
      addBullet('Marcar para Revisão: Salva para revisar depois');
      addBullet('Links Oficiais: Documentação MikroTik');
      addBullet('API Python: Exemplos de código');
      addSpace(10);

      addTitle('Simulado');
      addSubtitle('Tipos de Simulado');
      addText('Prova: Cronometrado, sem ver respostas até o final');
      addText('Treino: Veja a resposta após cada questão');
      addSpace();
      addSubtitle('Como Fazer');
      addText('1. Selecione a certificação');
      addText('2. Escolha número de questões e tempo');
      addText('3. Clique em "Iniciar Simulado"');
      addText('4. Responda todas as questões');
      addText('5. Veja seu resultado detalhado');
      addSpace(10);

      addTitle('Estatísticas');
      addBullet('Taxa de Acerto: % de respostas corretas');
      addBullet('Questões Respondidas: Total estudado');
      addBullet('Cobertura: Quanto do banco você estudou');
      addBullet('Sequência: Dias consecutivos estudando');
      addSpace(10);

      doc.addPage();
      y = margin;

      addTitle('Configurações');
      addSubtitle('Alterar Senha');
      addText('1. Digite sua senha atual');
      addText('2. Digite a nova senha (mín. 6 caracteres)');
      addText('3. Confirme a nova senha');
      addText('4. Clique em "Alterar Senha"');
      addSpace();
      addSubtitle('Aparência');
      addText('Alterne entre tema claro e escuro conforme preferência.');
      addSpace(10);

      addTitle('Painel Administrativo');
      addText('Disponível apenas para administradores.');
      addSpace();
      addSubtitle('Funcionalidades');
      addBullet('Criar, editar e excluir usuários');
      addBullet('Ver estatísticas de cada membro');
      addBullet('Acompanhar ranking da equipe');
      addBullet('Exportar relatórios em Excel e PDF');
      addBullet('Resetar progresso de usuários');
      addSpace(10);

      addTitle('Dicas de Estudo');
      addText('1. Comece pela MTCNA - é a base');
      addText('2. Estude por categoria');
      addText('3. Revise os erros frequentemente');
      addText('4. Faça simulados regularmente');
      addText('5. Mantenha a sequência diária');
      addSpace();
      addSubtitle('Meta para a Prova');
      addText('Taxa de acerto acima de 80% e cobertura de 90% do banco.');
      addSpace(10);

      addTitle('Perguntas Frequentes');
      addSubtitle('Meu progresso está salvo?');
      addText('Sim! Sincronizado automaticamente com o servidor.');
      addSpace();
      addSubtitle('Posso estudar offline?');
      addText('Parcialmente. Precisa de conexão para sincronizar.');
      addSpace();
      addSubtitle('Esqueci minha senha');
      addText('Use "Esqueceu a senha?" ou peça ao admin.');

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`MikroTik Study Lab - Manual do Usuário - Página ${i}/${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save('Manual_Usuario_MikroTik_Study_Lab.pdf');
      toast.success('Manual do Usuário baixado!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
          <p className="text-muted-foreground">Manuais e documentação do sistema</p>
        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Manual de Instalação
                </CardTitle>
                <CardDescription>
                  Guia completo para instalar e configurar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Requisitos do sistema</li>
                  <li>• Instalação passo a passo</li>
                  <li>• Configuração de rede</li>
                  <li>• Deploy com Nginx</li>
                  <li>• Backup e segurança</li>
                </ul>
                <Button 
                  onClick={generateInstallationPDF} 
                  className="w-full"
                  disabled={isGenerating !== null}
                >
                  {isGenerating === 'instalacao' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Baixar PDF
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-success" />
                  Manual do Usuário
                </CardTitle>
                <CardDescription>
                  Como usar todas as funcionalidades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Login e recuperação de senha</li>
                  <li>• Como estudar e fazer simulados</li>
                  <li>• Acompanhamento de estatísticas</li>
                  <li>• Painel administrativo</li>
                  <li>• Dicas de estudo</li>
                </ul>
                <Button 
                  onClick={generateUserManualPDF} 
                  className="w-full"
                  variant="secondary"
                  disabled={isGenerating !== null}
                >
                  {isGenerating === 'usuario' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Baixar PDF
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Guide */}
        <Tabs defaultValue="inicio" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inicio">Início Rápido</TabsTrigger>
            <TabsTrigger value="estudo">Estudar</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="inicio" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Primeiros Passos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Faça Login</h4>
                    <p className="text-sm text-muted-foreground">Use as credenciais fornecidas pelo administrador</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Altere sua Senha</h4>
                    <p className="text-sm text-muted-foreground">Vá em Configurações e crie uma senha pessoal</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Comece a Estudar</h4>
                    <p className="text-sm text-muted-foreground">Acesse "Estudar" e selecione a certificação desejada</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Acompanhe seu Progresso</h4>
                    <p className="text-sm text-muted-foreground">Veja suas estatísticas e evolução ao longo do tempo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estudo" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Guia de Estudos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Modo Estudo</h4>
                  <p className="text-sm text-muted-foreground">Estude no seu ritmo, vendo explicações após cada resposta. Use os filtros para focar em áreas específicas.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Modo Simulado</h4>
                  <p className="text-sm text-muted-foreground">Simule condições de prova com tempo limitado. Use o modo "Prova" para testar seu conhecimento real.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Revisão</h4>
                  <p className="text-sm text-muted-foreground">Revise questões marcadas e erradas. Focar nos erros é a melhor forma de evoluir.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Meta Recomendada</h4>
                  <p className="text-sm text-muted-foreground">Taxa de acerto &gt;80% e cobertura &gt;90% do banco antes da prova oficial.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Funções Administrativas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Gerenciar Usuários</h4>
                  <p className="text-sm text-muted-foreground">Crie contas para sua equipe, defina permissões e acompanhe o progresso individual.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ranking</h4>
                  <p className="text-sm text-muted-foreground">Veja os melhores desempenhos e incentive a competição saudável.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Relatórios</h4>
                  <p className="text-sm text-muted-foreground">Exporte relatórios em Excel ou PDF para apresentações e análises.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Meu progresso é salvo automaticamente?</h4>
                      <p className="text-sm text-muted-foreground">Sim! Cada resposta é sincronizada com o servidor em tempo real.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Posso acessar de outro dispositivo?</h4>
                      <p className="text-sm text-muted-foreground">Sim! Basta fazer login com suas credenciais.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Esqueci minha senha</h4>
                      <p className="text-sm text-muted-foreground">Use "Esqueceu a senha?" na tela de login ou peça ao administrador.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Como sei se estou pronto para a prova?</h4>
                      <p className="text-sm text-muted-foreground">Taxa de acerto acima de 80% e simulados consistentes são bons indicadores.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">As questões são iguais às da prova oficial?</h4>
                      <p className="text-sm text-muted-foreground">São questões de estudo baseadas nos tópicos oficiais. A prova real pode variar.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Posso sugerir novas questões?</h4>
                      <p className="text-sm text-muted-foreground">Converse com o administrador do sistema.</p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Recursos Externos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="https://help.mikrotik.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <h4 className="font-medium">help.mikrotik.com</h4>
                <p className="text-sm text-muted-foreground">Documentação oficial</p>
              </a>
              <a 
                href="https://wiki.mikrotik.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <h4 className="font-medium">wiki.mikrotik.com</h4>
                <p className="text-sm text-muted-foreground">Wiki da comunidade</p>
              </a>
              <a 
                href="https://forum.mikrotik.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <h4 className="font-medium">forum.mikrotik.com</h4>
                <p className="text-sm text-muted-foreground">Fórum oficial</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
