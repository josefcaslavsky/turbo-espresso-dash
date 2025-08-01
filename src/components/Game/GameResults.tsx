import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RotateCcw, Star } from "lucide-react";
import taylorImage from "/lovable-uploads/c0bd7a00-4d8d-421b-9b84-7a6fee320559.png";

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
  onGoHome,
}: GameResultsProps) => {
  const finalDistance = Math.floor(distance);
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
          <CardHeader>
            <CardTitle className="text-4xl text-center">
              {isVictory ? "Caffeine Delivered!" : "Game Over"}
            </CardTitle>
            <CardDescription className="text-center">
              {isVictory
                ? "Perfect espresso delivered! ☕"
                : "Pothole got the best of you..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Beans</p>
                <p className="text-4xl font-bold">{beansCollected}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-4xl font-bold">{finalDistance}m</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Max Speed</p>
                <p className="text-4xl font-bold">{Math.floor(maxSpeed)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-foreground">TOTAL SCORE</span>
              <span className="text-2xl font-bold bg-gradient-turbo bg-clip-text text-transparent">
                {score}
              </span>
            </div>
          </CardFooter>
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