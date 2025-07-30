import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GameCanvas } from "./GameCanvas";
import { GameMenu } from "./GameMenu";
import { GameResults } from "./GameResults";

type GameState = 'menu' | 'playing' | 'victory' | 'gameover';

interface GameStats {
  score: number;
  distance: number;
  beansCollected: number;
  caffeine: number;
  maxSpeed: number;
  isNewBest: boolean;
}

const STARTING_SPEED = 200;
const INITIAL_BASE_SPEED = 2;

export const TurboEspressoDash = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [baseSpeed, setBaseSpeed] = useState(INITIAL_BASE_SPEED);
  const [isDeliveryMade, setIsDeliveryMade] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    beansCollected: 0,
    caffeine: 0,
    maxSpeed: STARTING_SPEED,
    isNewBest: false,
  });

  // Persistent best scores
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('turbo-espresso-best-score');
    return saved ? parseInt(saved) : 0;
  });

  const [bestDistance, setBestDistance] = useState(() => {
    const saved = localStorage.getItem('turbo-espresso-best-distance');
    return saved ? parseInt(saved) : 0;
  });

  // Game time tracking for distance calculation
  const [gameTime, setGameTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Handle collisions
  const handleCollision = useCallback((type: 'bean' | 'pothole') => {
    if (type === 'bean') {
      if (gameStats.caffeine >= 100) {
        // Already at 100% caffeine, so increase base speed instead
        setBaseSpeed(prev => prev + 0.1);
        setGameStats(prev => ({ ...prev, score: prev.score + 150 }));
        toast.info("Caffeine Overload! Base speed increased!", { duration: 1000 });
      } else {
        setGameStats(prev => {
          const newCaffeine = Math.min(100, prev.caffeine + 10);
          const newSpeed = STARTING_SPEED + (newCaffeine * 1.5); // Reduced from 4 to 1.5
          const newScore = prev.score + 50;

          return {
            ...prev,
            caffeine: newCaffeine,
            beansCollected: prev.beansCollected + 1,
            score: newScore,
            maxSpeed: Math.max(prev.maxSpeed, newSpeed)
          };
        });

        toast.success("Coffee bean collected! +10% caffeine", {
          duration: 1000,
          style: { backgroundColor: 'hsl(var(--coffee-light))' }
        });
      }
    } else {
      // Pothole collision - game over
      setGameState('gameover');
      toast.error("Pothole collision! Game over!", {
        duration: 2000,
        style: { backgroundColor: 'hsl(var(--destructive))' }
      });
    }
  }, [gameStats.caffeine]);

  // Handle caffeine delivery
  useEffect(() => {
    if (!isDeliveryMade && gameStats.caffeine >= 100) {
      setIsDeliveryMade(true);
      toast.success("Full caffeine! Delivery to Taylor is a go!", {
        duration: 2000,
        style: { backgroundColor: 'hsl(var(--victory-gold))' }
      });
    }
  }, [gameStats.caffeine, isDeliveryMade]);

  // Handle game state changes
  const handleGameStateChange = useCallback((newState: GameState) => {
    setGameState(newState);

    if (newState === 'victory') {
      toast.success("100% caffeine reached! Victory!", {
        duration: 3000,
        style: { backgroundColor: 'hsl(var(--victory-gold))' }
      });
    }
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    setGameStats({
      score: 0,
      distance: 0,
      beansCollected: 0,
      caffeine: 0,
      maxSpeed: STARTING_SPEED,
      isNewBest: false,
    });
    setGameTime(0);
    setBaseSpeed(INITIAL_BASE_SPEED);
    setIsDeliveryMade(false);
    setGameStartTime(Date.now());
    setGameState('playing');
  }, []);

  // Game loop for distance tracking
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameState === 'playing') {
      intervalId = setInterval(() => {
        setGameTime(prev => prev + 1);
        setGameStats(prev => {
          const currentSpeed = STARTING_SPEED + (prev.caffeine * 1.5); // Reduced from 4 to 1.5
          const newDistance = prev.distance + (currentSpeed / 100); // Convert to meters
          const distanceScore = Math.floor(newDistance);
          const totalScore = distanceScore + (prev.beansCollected * 50) + Math.floor(prev.maxSpeed / 10);

          return {
            ...prev,
            distance: newDistance,
            score: totalScore,
            maxSpeed: Math.max(prev.maxSpeed, currentSpeed)
          };
        });
      }, 100); // Update every 100ms for smooth distance tracking
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameState]);

  // Handle game end - update best scores
  useEffect(() => {
    if (gameState === 'victory' || gameState === 'gameover') {
      const finalScore = gameStats.score;
      const finalDistance = Math.floor(gameStats.distance);

      let isNewBest = false;

      if (finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem('turbo-espresso-best-score', finalScore.toString());
        isNewBest = true;
      }

      if (finalDistance > bestDistance) {
        setBestDistance(finalDistance);
        localStorage.setItem('turbo-espresso-best-distance', finalDistance.toString());
        isNewBest = true;
      }

      setGameStats(prev => ({ ...prev, isNewBest }));
    }
  }, [gameState, gameStats.score, gameStats.distance, bestScore, bestDistance]);

  // Render current game state
  switch (gameState) {
    case 'menu':
      return (
        <GameMenu
          onStartGame={startGame}
          bestScore={bestScore}
          bestDistance={bestDistance}
        />
      );

    case 'playing':
      return (
        <div className="min-h-screen bg-gradient-road flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <GameCanvas
              gameState={gameState}
              onCollision={handleCollision}
              onGameStateChange={handleGameStateChange}
              caffeine={gameStats.caffeine}
              score={gameStats.score}
              distance={gameStats.distance}
              baseSpeed={baseSpeed}
            />
          </div>
        </div>
      );

    case 'victory':
    case 'gameover':
      return (
        <GameResults
          isVictory={isDeliveryMade}
          score={gameStats.score}
          distance={gameStats.distance}
          beansCollected={gameStats.beansCollected}
          maxSpeed={gameStats.maxSpeed}
          isNewBest={gameStats.isNewBest}
          onPlayAgain={startGame}
          onGoHome={() => setGameState('menu')}
        />
      );

    default:
      return null;
  }
};