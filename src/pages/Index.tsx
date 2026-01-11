import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { progress } from '@/lib/api';
import { GameHeader } from '@/components/GameHeader';
import { ClickerCard } from '@/components/ClickerCard';
import { GameTabs } from '@/components/GameTabs';

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
        <GameHeader
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          isAuthenticated={isAuthenticated}
          user={user}
          login={login}
          logout={logout}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ClickerCard
              points={points}
              totalClicks={totalClicks}
              level={level}
              levelProgress={levelProgress}
              nextLevelThreshold={nextLevelThreshold}
              pointsPerClick={pointsPerClick}
              pointsPerSecond={pointsPerSecond}
              selectedSkin={selectedSkin}
              isClicking={isClicking}
              handleClick={handleClick}
              getLevelMultiplier={getLevelMultiplier}
            />
          </div>

          <div className="space-y-6">
            <GameTabs
              upgrades={upgrades}
              achievements={achievements}
              skins={SKINS}
              points={points}
              totalClicks={totalClicks}
              selectedSkin={selectedSkin}
              ownedSkins={ownedSkins}
              buyUpgrade={buyUpgrade}
              buySkin={buySkin}
              setSelectedSkin={setSelectedSkin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
