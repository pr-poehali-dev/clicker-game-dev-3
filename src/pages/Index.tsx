import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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

const Index = () => {
  const [points, setPoints] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [level, setLevel] = useState(1);
  const [pointsPerClick, setPointsPerClick] = useState(1);
  const [pointsPerSecond, setPointsPerSecond] = useState(0);
  const [isClicking, setIsClicking] = useState(false);

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
    const newLevel = levelThresholds.findIndex((threshold, idx) => 
      points < threshold || idx === levelThresholds.length - 1
    );
    const calculatedLevel = newLevel === -1 ? levelThresholds.length : newLevel;
    
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
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
        toast.success(`🏆 Достижение: ${ach.name}`, {
          description: ach.description,
        });
        return { ...ach, unlocked: true };
      }
      return ach;
    });
    setAchievements(updatedAchievements);
  }, [totalClicks]);

  const handleClick = () => {
    const earnedPoints = pointsPerClick * getLevelMultiplier(level);
    setPoints(prev => prev + earnedPoints);
    setTotalClicks(prev => prev + 1);
    setIsClicking(true);
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

    toast.success(`Куплено: ${upgrade.name}`);
  };

  const nextLevelThreshold = levelThresholds[level] || levelThresholds[levelThresholds.length - 1];
  const prevLevelThreshold = levelThresholds[level - 1] || 0;
  const levelProgress = ((points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 animate-scale-in">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-2">Кликер</h1>
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
                    <Icon name="Sparkles" size={120} />
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upgrades">Магазин</TabsTrigger>
                <TabsTrigger value="achievements">
                  Достижения
                  <Badge variant="secondary" className="ml-2">
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
