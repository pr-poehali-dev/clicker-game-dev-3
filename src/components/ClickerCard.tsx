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
  );
};
