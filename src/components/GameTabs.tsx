import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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

interface GameTabsProps {
  upgrades: Upgrade[];
  achievements: Achievement[];
  skins: Skin[];
  points: number;
  totalClicks: number;
  selectedSkin: string;
  ownedSkins: string[];
  buyUpgrade: (upgradeId: string) => void;
  buySkin: (skinId: string) => void;
  setSelectedSkin: (skin: string) => void;
}

export const GameTabs = ({
  upgrades,
  achievements,
  skins,
  points,
  totalClicks,
  selectedSkin,
  ownedSkins,
  buyUpgrade,
  buySkin,
  setSelectedSkin,
}: GameTabsProps) => {
  return (
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
          {skins.map(skin => {
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
  );
};
