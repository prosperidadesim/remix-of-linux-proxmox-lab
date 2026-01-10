import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, KeyRound, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { apiUrl } = useAuth();
  
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ displayName?: string; email?: string }>({});
  const [error, setError] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setError('Token não fornecido');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/reset-password/${token}`);
        
        if (response.ok) {
          const data = await response.json();
          setIsValid(true);
          setUserInfo({ displayName: data.displayName, email: data.email });
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Token inválido ou expirado');
        }
      } catch (err) {
        setError('Erro ao validar token. Verifique a conexão com o servidor.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao redefinir senha');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validando token...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Senha Alterada!</h2>
              <p className="text-muted-foreground mb-6">
                Sua senha foi redefinida com sucesso. Você já pode fazer login.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Link Inválido</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'Este link de recuperação é inválido ou já expirou.'}
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/forgot-password')} className="w-full">
                  Solicitar Novo Link
                </Button>
                <Button variant="ghost" onClick={() => navigate('/login')} className="w-full">
                  Voltar ao Login
                </Button>
              </div>
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
              <KeyRound className="h-5 w-5" />
              Criar Nova Senha
            </CardTitle>
            <CardDescription>
              {userInfo.displayName && (
                <>Olá <strong>{userInfo.displayName}</strong>! </>
              )}
              Digite sua nova senha abaixo.
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
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Redefinir Senha
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
