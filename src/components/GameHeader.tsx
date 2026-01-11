import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GameHeaderProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isAuthenticated: boolean;
  user: { email: string; user_id: number } | null;
  login: () => void;
  logout: () => void;
}

export const GameHeader = ({
  soundEnabled,
  setSoundEnabled,
  isAuthenticated,
  user,
  login,
  logout,
}: GameHeaderProps) => {
  return (
    <header className="text-center mb-8 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-5xl md:text-6xl font-bold text-primary">Кликер</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="gap-2"
          >
            <Icon name={soundEnabled ? 'Volume2' : 'VolumeX'} size={16} />
          </Button>
        </div>
        {!isAuthenticated ? (
          <Button onClick={login} className="gap-2">
            <Icon name="LogIn" size={16} />
            Войти через Google
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        )}
      </div>
      <p className="text-muted-foreground">Кликай и развивайся!</p>
    </header>
  );
};
