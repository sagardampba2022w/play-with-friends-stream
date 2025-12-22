import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = mode === 'login'
        ? await login({ email, password })
        : await signup({ email, password, username });

      if (result.success) {
        toast({
          title: mode === 'login' ? 'Welcome back!' : 'Account created!',
          description: mode === 'login' 
            ? 'You have successfully logged in.' 
            : 'Your account has been created successfully.',
        });
        onClose();
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-arcade text-xl text-center text-primary text-glow-green">
            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-mono text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="bg-input border-border focus:border-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-mono text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-input border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-mono text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="bg-input border-border focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            variant="arcade"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'LOGIN'
            ) : (
              'CREATE ACCOUNT'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button
            variant="link"
            onClick={toggleMode}
            className="text-secondary hover:text-secondary/80"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </Button>
        </div>

        {mode === 'login' && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground font-mono text-center">
              Demo: player1@test.com / password123
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
