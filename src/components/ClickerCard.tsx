import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface ClickerCardProps {
  points: number;
  totalClicks: number;
  level: number;
  levelProgress: number;
  nextLevelThreshold: number;
  pointsPerClick: number;
  pointsPerSecond: number;
  selectedSkin: string;
  isClicking: boolean;
  handleClick: () => void;
  getLevelMultiplier: (lvl: number) => number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  icon: string;
}

const getSkinStyles = (skin: string) => {
  const styles = {
    Sparkles: {
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      shadow: 'shadow-purple-500/50',
      hover: 'hover:shadow-purple-500/70',
      glow: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]',
      particleColor: 'text-purple-400',
      particleIcon: 'Sparkles',
    },
    Flame: {
      gradient: 'from-orange-500 via-red-500 to-red-600',
      shadow: 'shadow-orange-500/50',
      hover: 'hover:shadow-orange-500/70',
      glow: 'drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]',
      particleColor: 'text-orange-400',
      particleIcon: 'Flame',
    },
    Zap: {
      gradient: 'from-yellow-400 via-yellow-500 to-amber-500',
      shadow: 'shadow-yellow-400/50',
      hover: 'hover:shadow-yellow-400/70',
      glow: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]',
      particleColor: 'text-yellow-300',
      particleIcon: 'Zap',
    },
    Star: {
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      shadow: 'shadow-blue-400/50',
      hover: 'hover:shadow-blue-400/70',
      glow: 'drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]',
      particleColor: 'text-blue-300',
      particleIcon: 'Star',
    },
    Gem: {
      gradient: 'from-cyan-400 via-teal-500 to-emerald-500',
      shadow: 'shadow-cyan-400/50',
      hover: 'hover:shadow-cyan-400/70',
      glow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]',
      particleColor: 'text-cyan-300',
      particleIcon: 'Gem',
    },
    Rocket: {
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      shadow: 'shadow-pink-500/50',
      hover: 'hover:shadow-pink-500/70',
      glow: 'drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]',
      particleColor: 'text-pink-300',
      particleIcon: 'Rocket',
    },
  };
  
  return styles[skin as keyof typeof styles] || styles.Sparkles;
};

export const ClickerCard = ({
  points,
  totalClicks,
  level,
  levelProgress,
  nextLevelThreshold,
  pointsPerClick,
  pointsPerSecond,
  selectedSkin,
  isClicking,
  handleClick,
  getLevelMultiplier,
}: ClickerCardProps) => {
  const skinStyle = getSkinStyles(selectedSkin);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [particles]);
  
  const createParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 80 + Math.random() * 40;
      newParticles.push({
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: skinStyle.particleColor,
        icon: skinStyle.particleIcon,
      });
    }
    setParticles(newParticles);
  };
  
  const onClickHandler = () => {
    handleClick();
    createParticles();
  };
  
  return (
    <Card className="shadow-lg border-2 border-purple-100">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
              {Math.floor(points).toLocaleString()} <span className="text-2xl">очков</span>
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {totalClicks.toLocaleString()} кликов всего
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Уровень {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>До уровня {level + 1}</span>
            <span>{Math.floor(points)} / {nextLevelThreshold}</span>
          </div>
          <Progress value={levelProgress} className="h-3" />
        </div>

        <div className="flex justify-center items-center py-8 relative">
          <Button
            size="lg"
            onClick={onClickHandler}
            className={`w-64 h-64 rounded-full text-6xl font-bold shadow-2xl transition-all duration-300 bg-gradient-to-br ${skinStyle.gradient} ${skinStyle.shadow} ${skinStyle.hover} border-0 ${
              isClicking ? 'animate-click-bounce scale-90' : 'hover:scale-105 animate-pulse-gentle'
            }`}
          >
            <div className={`${skinStyle.glow} transition-all duration-300`}>
              <Icon name={selectedSkin} size={120} />
            </div>
          </Button>
          
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute pointer-events-none animate-[particle-float_1s_ease-out_forwards]"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%)`,
                '--particle-x': `${particle.x}px`,
                '--particle-y': `${particle.y}px`,
              } as React.CSSProperties}
            >
              <div className={`${particle.color} drop-shadow-lg`}>
                <Icon name={particle.icon} size={32} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <Card className="bg-accent/50">
            <CardHeader className="pb-2">
              <CardDescription>За клик</CardDescription>
              <CardTitle className="text-2xl">+{(pointsPerClick * getLevelMultiplier(level)).toFixed(1)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-accent/50">
            <CardHeader className="pb-2">
              <CardDescription>В секунду</CardDescription>
              <CardTitle className="text-2xl">+{pointsPerSecond}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};