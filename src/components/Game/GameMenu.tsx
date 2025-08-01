import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Zap, Coffee } from "lucide-react";
import taylorImage from "/lovable-uploads/c0bd7a00-4d8d-421b-9b84-7a6fee320559.png";

interface GameMenuProps {
  onStartGame: () => void;
  bestScore: number;
  bestDistance: number;
}

export const GameMenu = ({ onStartGame, bestScore, bestDistance }: GameMenuProps) => {
  return (
    <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-1 bg-primary/20 animate-speed-lines"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Taylor Introduction */}
        <div className="mb-6 animate-bounce-in">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src={taylorImage}
                alt="Taylor the coder"
                className="w-24 h-24 object-cover rounded-full border-3 border-primary/50 shadow-glow"
              />
              <div className="absolute -bottom-2 -right-2 text-lg">👨‍💻</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Taylor needs his caffeine fix to keep coding!
          </p>
        </div>

        {/* Game Title */}
        <div className="mb-8 animate-bounce-in">
          <h1 className="text-6xl font-bold bg-gradient-turbo bg-clip-text text-transparent mb-2 tracking-wider">
            TURBO
          </h1>
          <h2 className="text-4xl font-bold bg-gradient-electric bg-clip-text text-transparent mb-4 tracking-wide">
            ESPRESSO
          </h2>
          <h3 className="text-2xl font-bold text-primary tracking-widest">
            DASH
          </h3>
          
          <div className="flex justify-center items-center gap-2 mt-4 text-muted-foreground">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-medium">DELIVER THE PERFECT BREW</span>
            <Coffee className="w-5 h-5 text-coffee animate-pulse" />
          </div>
        </div>

        {/* Game Description */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 mb-6">
          <p className="text-foreground/90 mb-4 leading-relaxed">
            Race your orange supercar through traffic to deliver the perfect espresso to Taylor! 
            Collect <span className="text-coffee-light font-medium">coffee beans</span> to boost your speed, 
            but avoid <span className="text-destructive font-medium">potholes</span> at all costs.
          </p>
          
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-coffee-light rounded-full" />
              <span>+10% Speed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span>Game Over</span>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-4 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">CONTROLS</h4>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-primary font-bold">↑ ↓</div>
              <div className="text-muted-foreground">or W S</div>
            </div>
            <div className="text-center">
              <div className="text-primary font-bold">📱</div>
              <div className="text-muted-foreground">Touch lanes</div>
            </div>
          </div>
        </Card>

        {/* Personal Best */}
        {(bestScore > 0 || bestDistance > 0) && (
          <Card className="bg-card/50 backdrop-blur-sm border-victory-gold/30 p-4 mb-6">
            <h4 className="text-sm font-medium text-victory-gold mb-3 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              PERSONAL BEST
            </h4>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-victory-gold font-bold text-lg">{bestScore}</div>
                <div className="text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-victory-gold font-bold text-lg">{Math.floor(bestDistance)}m</div>
                <div className="text-muted-foreground">Distance</div>
              </div>
            </div>
          </Card>
        )}

        {/* Start Button */}
        <Button 
          variant="turbo" 
          size="xl" 
          onClick={onStartGame}
          className="w-full text-xl animate-pulse-neon"
        >
          <Zap className="w-6 h-6 mr-2" />
          DRIVE!
          <Coffee className="w-6 h-6 ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4 opacity-70">
          Tip: Collect beans gradually to build speed without losing control!
        </p>
      </div>
    </div>
  );
};