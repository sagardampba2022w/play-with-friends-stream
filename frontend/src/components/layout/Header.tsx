import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { User, Trophy, Eye, LogOut, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const location = useLocation();

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const navLinks = [
    { path: '/', label: 'PLAY', icon: Gamepad2 },
    { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { path: '/watch', label: 'WATCH', icon: Eye },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center box-glow-green">
              <span className="font-arcade text-xs text-primary-foreground">S</span>
            </div>
            <span className="font-arcade text-sm text-primary text-glow-green hidden sm:block">
              SNAKE
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "font-mono text-xs gap-2",
                    location.pathname === path && "bg-muted text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm text-foreground">
                    {user.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    HI: {user.highScore}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openLogin}
                  className="font-mono text-xs"
                >
                  LOGIN
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={openSignup}
                  className="font-mono text-xs"
                >
                  SIGN UP
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
