import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { progress } from '@/lib/api';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  owned: number;
  icon: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  unlocked: boolean;
  icon: string;
}

interface Skin {
  id: string;
  name: string;
  icon: string;
  cost: number;
}

const SKINS: Skin[] = [
  { id: 'sparkles', name: 'Искры', icon: 'Sparkles', cost: 0 },
  { id: 'flame', name: 'Огонь', icon: 'Flame', cost: 500 },
  { id: 'zap', name: 'Молния', icon: 'Zap', cost: 1000 },
  { id: 'star', name: 'Звезда', icon: 'Star', cost: 2000 },
  { id: 'gem', name: 'Алмаз', icon: 'Gem', cost: 5000 },
  { id: 'rocket', name: 'Ракета', icon: 'Rocket', cost: 10000 },
];

const Index = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  
  const [points, setPoints] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [level, setLevel] = useState(1);
  const [pointsPerClick, setPointsPerClick] = useState(1);
  const [pointsPerSecond, setPointsPerSecond] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState('Sparkles');
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['Sparkles']);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: 'auto1',
      name: 'Автокликер',
      description: '+1 очко в секунду',
      cost: 10,
      multiplier: 1,
      owned: 0,
      icon: 'MousePointerClick',
    },
    {
      id: 'mult1',
      name: 'Усилитель',
      description: 'x2 к кликам',
      cost: 50,
      multiplier: 2,
      owned: 0,
      icon: 'Zap',
    },
    {
      id: 'auto2',
      name: 'Робот-кликер',
      description: '+5 очков в секунду',
      cost: 100,
      multiplier: 5,
      owned: 0,
      icon: 'Bot',
    },
    {
      id: 'mult2',
      name: 'Супер усилитель',
      description: 'x5 к кликам',
      cost: 250,
      multiplier: 5,
      owned: 0,
      icon: 'Sparkles',
    },
    {
      id: 'auto3',
      name: 'Фабрика кликов',
      description: '+20 очков в секунду',
      cost: 500,
      multiplier: 20,
      owned: 0,
      icon: 'Factory',
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'ach1', name: 'Первый клик', description: 'Сделайте 1 клик', requirement: 1, unlocked: false, icon: 'MousePointerClick' },
    { id: 'ach2', name: 'Новичок', description: 'Сделайте 100 кликов', requirement: 100, unlocked: false, icon: 'Award' },
    { id: 'ach3', name: 'Профессионал', description: 'Сделайте 1000 кликов', requirement: 1000, unlocked: false, icon: 'Trophy' },
    { id: 'ach4', name: 'Мастер кликов', description: 'Сделайте 10000 кликов', requirement: 10000, unlocked: false, icon: 'Crown' },
    { id: 'ach5', name: 'Легенда', description: 'Сделайте 100000 кликов', requirement: 100000, unlocked: false, icon: 'Star' },
  ]);

  const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
  const getLevelMultiplier = (lvl: number) => 1 + (lvl - 1) * 0.5;

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadProgress();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        saveProgress();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, points, totalClicks, level, pointsPerClick, pointsPerSecond, upgrades, achievements, selectedSkin, ownedSkins]);

  const loadProgress = async () => {
    const data = await progress.load();
    if (data && data.points !== undefined) {
      setPoints(data.points);
      setTotalClicks(data.totalClicks);
      setLevel(data.level);
      setPointsPerClick(data.pointsPerClick);
      setPointsPerSecond(data.pointsPerSecond);
      setUpgrades(data.upgrades);
      setAchievements(data.achievements);
      setSelectedSkin(data.selectedSkin);
      setOwnedSkins(data.ownedSkins);
    }
  };

  const saveProgress = async () => {
    await progress.save({
      points,
      totalClicks,
      level,
      pointsPerClick,
      pointsPerSecond,
      upgrades,
      achievements,
      selectedSkin,
      ownedSkins,
    });
  };

  useEffect(() => {
    const newLevel = levelThresholds.findIndex((threshold, idx) => 
      points < threshold || idx === levelThresholds.length - 1
    );
    const calculatedLevel = newLevel === -1 ? levelThresholds.length : newLevel;
    
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
      playSound('levelup');
      toast.success(`🎉 Уровень ${calculatedLevel}!`, {
        description: `Множитель очков: x${getLevelMultiplier(calculatedLevel).toFixed(1)}`,
      });
    }
  }, [points]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pointsPerSecond > 0) {
        setPoints(prev => prev + pointsPerSecond);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pointsPerSecond]);

  useEffect(() => {
    const updatedAchievements = achievements.map(ach => {
      if (!ach.unlocked && totalClicks >= ach.requirement) {
        playSound('achievement');
        toast.success(`🏆 Достижение: ${ach.name}`, {
          description: ach.description,
        });
        return { ...ach, unlocked: true };
      }
      return ach;
    });
    setAchievements(updatedAchievements);
  }, [totalClicks]);

  const playSound = (type: 'click' | 'buy' | 'achievement' | 'levelup') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'click':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'buy':
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'achievement':
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'levelup':
        oscillator.frequency.value = 1200;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
    }
  };

  const handleClick = () => {
    const earnedPoints = pointsPerClick * getLevelMultiplier(level);
    setPoints(prev => prev + earnedPoints);
    setTotalClicks(prev => prev + 1);
    setIsClicking(true);
    playSound('click');
    setTimeout(() => setIsClicking(false), 300);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || points < upgrade.cost) return;

    setPoints(prev => prev - upgrade.cost);
    
    setUpgrades(prev => prev.map(u => {
      if (u.id === upgradeId) {
        const newOwned = u.owned + 1;
        const newCost = Math.floor(u.cost * 1.5);
        
        if (upgradeId.startsWith('auto')) {
          setPointsPerSecond(prev => prev + u.multiplier);
        } else {
          setPointsPerClick(prev => prev * u.multiplier);
        }
        
        return { ...u, owned: newOwned, cost: newCost };
      }
      return u;
    }));

    playSound('buy');
    toast.success(`Куплено: ${upgrade.name}`);
  };

  const buySkin = (skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin || points < skin.cost || ownedSkins.includes(skin.icon)) return;

    setPoints(prev => prev - skin.cost);
    setOwnedSkins(prev => [...prev, skin.icon]);
    playSound('buy');
    toast.success(`Куплен скин: ${skin.name}`);
  };

  const nextLevelThreshold = levelThresholds[level] || levelThresholds[levelThresholds.length - 1];
  const prevLevelThreshold = levelThresholds[level - 1] || 0;
  const levelProgress = ((points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

                <div className="flex justify-center items-center py-8">
                  <Button
                    size="lg"
                    onClick={handleClick}
                    className={`w-64 h-64 rounded-full text-6xl font-bold shadow-2xl transition-all duration-300 ${
                      isClicking ? 'animate-click-bounce' : 'hover:scale-105 animate-pulse-gentle'
                    }`}
                  >
                    <Icon name={selectedSkin} size={120} />
                  </Button>
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
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="upgrades" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upgrades">Магазин</TabsTrigger>
                <TabsTrigger value="skins">Скины</TabsTrigger>
                <TabsTrigger value="achievements">
                  <Icon name="Trophy" size={16} />
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upgrades" className="space-y-3 mt-4">
                {upgrades.map(upgrade => (
                  <Card 
                    key={upgrade.id} 
                    className={`transition-all hover:shadow-md ${
                      points >= upgrade.cost ? 'border-primary/50' : 'opacity-60'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name={upgrade.icon} size={24} className="text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                            <CardDescription className="text-sm">{upgrade.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Куплено: <span className="font-semibold">{upgrade.owned}</span>
                          </p>
                          <p className="text-lg font-bold text-primary">{upgrade.cost} очков</p>
                        </div>
                        <Button
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={points < upgrade.cost}
                          size="sm"
                          className="px-6"
                        >
                          Купить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="skins" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {SKINS.map(skin => {
                    const isOwned = ownedSkins.includes(skin.icon);
                    const isSelected = selectedSkin === skin.icon;
                    
                    return (
                      <Card 
                        key={skin.id}
                        className={`transition-all cursor-pointer ${
                          isSelected ? 'border-primary border-2 bg-primary/5' : ''
                        } ${!isOwned && points < skin.cost ? 'opacity-50' : 'hover:shadow-md'}`}
                        onClick={() => isOwned && setSelectedSkin(skin.icon)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                              isOwned ? 'bg-primary/10' : 'bg-muted'
                            }`}>
                              <Icon name={skin.icon} size={32} className={isOwned ? 'text-primary' : 'text-muted-foreground'} />
                            </div>
                            <CardTitle className="text-sm text-center">{skin.name}</CardTitle>
                            {!isOwned && (
                              <div className="w-full">
                                <p className="text-xs text-center text-muted-foreground mb-2">{skin.cost} очков</p>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    buySkin(skin.id);
                                  }}
                                  disabled={points < skin.cost}
                                >
                                  Купить
                                </Button>
                              </div>
                            )}
                            {isSelected && <Badge variant="secondary" className="text-xs">Выбран</Badge>}
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-3 mt-4">
                {achievements.map(achievement => (
                  <Card 
                    key={achievement.id}
                    className={`transition-all ${
                      achievement.unlocked 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'opacity-50'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          achievement.unlocked ? 'bg-primary text-white' : 'bg-muted'
                        }`}>
                          <Icon name={achievement.icon} size={24} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{achievement.name}</CardTitle>
                          <CardDescription className="text-sm">{achievement.description}</CardDescription>
                          <Progress 
                            value={Math.min((totalClicks / achievement.requirement) * 100, 100)} 
                            className="h-1.5 mt-2"
                          />
                        </div>
                        {achievement.unlocked && (
                          <Icon name="Check" size={24} className="text-primary" />
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
