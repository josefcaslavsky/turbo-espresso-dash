import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, RotateCcw, Home, Zap, Coffee, Star } from "lucide-react";
import taylorImage from "@/assets/taylor-coder.png";

interface GameResultsProps {
  isVictory: boolean;
  score: number;
  distance: number;
  beansCollected: number;
  maxSpeed: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameResults = ({ 
  isVictory, 
  score, 
  distance, 
  beansCollected, 
  maxSpeed,
  isNewBest,
  onPlayAgain, 
  onGoHome 
}: GameResultsProps) => {
  const distancePoints = Math.floor(distance);
  const beanBonus = beansCollected * 50;
  const speedBonus = Math.floor(maxSpeed / 10);

  return (
    <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
      {/* Background celebration effects for victory */}
      {isVictory && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-victory-gold rounded-full animate-bounce-in"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Result Header */}
        <div className="mb-8 animate-bounce-in">
          {isVictory ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={taylorImage}
                    alt="Taylor celebrating"
                    className="w-32 h-32 object-cover rounded-full border-4 border-victory-gold shadow-glow animate-bounce-in"
                  />
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-victory-gold to-primary bg-clip-text text-transparent mb-2">
                DELIVERY COMPLETE!
              </h1>
              <p className="text-xl text-victory-gold font-medium mb-2">
                "Perfect espresso delivered! ☕"
              </p>
              <p className="text-lg text-muted-foreground italic">
                "Time to code with maximum caffeine! 🚀"
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4 animate-bounce-in">💥</div>
              <h1 className="text-5xl font-bold text-destructive mb-2">
                CRASH!
              </h1>
              <p className="text-xl text-muted-foreground">
                Pothole got the best of you...
              </p>
              <p className="text-lg text-muted-foreground italic">
                "Maybe next time!" - Taylor
              </p>
            </>
          )}
        </div>

        {/* New Best Badge */}
        {isNewBest && (
          <Card className="bg-victory-gold/20 border-victory-gold p-4 mb-6 animate-pulse-neon">
            <div className="flex items-center justify-center gap-2 text-victory-gold">
              <Star className="w-6 h-6" />
              <span className="font-bold text-lg">NEW PERSONAL BEST!</span>
              <Star className="w-6 h-6" />
            </div>
          </Card>
        )}

        {/* Score Breakdown */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-6 mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-victory-gold" />
            PERFORMANCE REPORT
          </h3>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Distance Covered</span>
              <span className="font-bold text-primary">{Math.floor(distance)}m × 1 = {distancePoints} pts</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Coffee className="w-4 h-4 text-coffee" />
                Beans Collected
              </span>
              <span className="font-bold text-coffee-light">{beansCollected} × 50 = {beanBonus} pts</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="w-4 h-4 text-secondary" />
                Max Speed Bonus
              </span>
              <span className="font-bold text-secondary">{Math.floor(maxSpeed)} ÷ 10 = {speedBonus} pts</span>
            </div>
            
            <div className="border-t border-primary/20 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">TOTAL SCORE</span>
                <span className="text-2xl font-bold bg-gradient-turbo bg-clip-text text-transparent">
                  {score}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="turbo" 
            size="lg" 
            onClick={onPlayAgain}
            className="flex-1"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            DRIVE AGAIN
          </Button>
          
          <Button 
            variant="game" 
            size="lg" 
            onClick={onGoHome}
            className="flex-1"
          >
            <Home className="w-5 h-5 mr-2" />
            HOME
          </Button>
        </div>

        {/* Motivational message */}
        <p className="text-sm text-muted-foreground mt-6 opacity-70">
          {isVictory 
            ? "Want to go even faster? Try collecting more beans!" 
            : "Every crash teaches you something. Keep practicing!"}
        </p>
      </div>
    </div>
  );
};