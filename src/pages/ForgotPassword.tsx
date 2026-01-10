import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const { apiUrl } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLink(null);
    setWarning(null);

    if (!email.trim()) {
      setError('Digite seu email');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
        if (data.warning) {
          setWarning(data.warning);
        }
      } else {
        setError(data.error || 'Erro ao processar solicitação');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    if (resetLink) {
      navigator.clipboard.writeText(resetLink);
      toast.success('Link copiado!');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Solicitação Enviada!</h2>
                <p className="text-muted-foreground">
                  {resetLink 
                    ? 'Use o link abaixo para redefinir sua senha.'
                    : 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.'
                  }
                </p>
              </div>

              {warning && (
                <Alert className="mb-4">
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              )}

              {resetLink && (
                <div className="space-y-3 mb-6">
                  <Label>Link de Recuperação:</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={resetLink} 
                      readOnly 
                      className="text-xs font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={copyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button asChild className="w-full">
                    <a href={resetLink}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Link
                    </a>
                  </Button>
                </div>
              )}

              <Button variant="ghost" asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">MikroTik Study Lab</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Recuperar Senha
            </CardTitle>
            <CardDescription>
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Enviar Instruções
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
