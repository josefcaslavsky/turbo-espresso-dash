import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import orangeLamboImage from "@/assets/orange-lambo.png";
import coffeeBeanImage from "@/assets/coffee-bean.png";

interface GameEntity {
  id: string;
  x: number;
  y: number;
  lane: number;
  type: 'bean' | 'pothole';
}

interface GameCanvasProps {
  gameState: 'menu' | 'playing' | 'victory' | 'gameover';
  onCollision: (type: 'bean' | 'pothole') => void;
  caffeine: number;
  score: number;
  distance: number;
  onGameStateChange: (state: 'menu' | 'playing' | 'victory' | 'gameover') => void;
}

const LANE_POSITIONS = [120, 200, 280]; // Y positions for top, mid, bottom lanes
const GAME_SPEED_BASE = 2;
const CAR_X = 100; // Fixed X position of the car

export const GameCanvas = ({ 
  gameState, 
  onCollision, 
  caffeine, 
  score, 
  distance, 
  onGameStateChange 
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [carLane, setCarLane] = useState(1); // 0 = top, 1 = middle, 2 = bottom
  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [roadOffset, setRoadOffset] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [carDriftAnim, setCarDriftAnim] = useState('');
  
  const gameSpeed = GAME_SPEED_BASE + (caffeine * 0.02); // Reduced from 0.04 to 0.02

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;
    
    const key = event.key.toLowerCase();
    if ((key === 'arrowup' || key === 'w') && carLane > 0) {
      setCarLane(prev => prev - 1);
      setCarDriftAnim('animate-drift-left');
      setTimeout(() => setCarDriftAnim(''), 300);
    } else if ((key === 'arrowdown' || key === 's') && carLane < 2) {
      setCarLane(prev => prev + 1);
      setCarDriftAnim('animate-drift-right');
      setTimeout(() => setCarDriftAnim(''), 300);
    }
  }, [gameState, carLane]);

  // Handle touch input
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (gameState !== 'playing') return;
    event.preventDefault();
  }, [gameState]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (gameState !== 'playing') return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touchY = touch.clientY - rect.top;
    const canvasHeight = rect.height;
    
    const newLane = Math.floor((touchY / canvasHeight) * 3);
    const clampedLane = Math.max(0, Math.min(2, newLane));
    
    if (clampedLane !== carLane) {
      setCarLane(clampedLane);
      setCarDriftAnim(clampedLane > carLane ? 'animate-drift-right' : 'animate-drift-left');
      setTimeout(() => setCarDriftAnim(''), 300);
    }
  }, [gameState, carLane]);

  // Spawn entities
  const spawnEntity = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const shouldSpawnBean = Math.random() < 0.7; // 70% chance for bean, 30% for pothole
    const randomLane = Math.floor(Math.random() * 3);
    
    const newEntity: GameEntity = {
      id: `${Date.now()}-${Math.random()}`,
      x: 800, // Start off-screen right
      y: LANE_POSITIONS[randomLane],
      lane: randomLane,
      type: shouldSpawnBean ? 'bean' : 'pothole'
    };
    
    setEntities(prev => [...prev, newEntity]);
  }, [gameState]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setGameTime(prev => prev + 1);
    setRoadOffset(prev => (prev + gameSpeed) % 200);
    
    // Move entities
    setEntities(prev => {
      const updatedEntities = prev.map(entity => ({
        ...entity,
        x: entity.x - gameSpeed * 3
      })).filter(entity => entity.x > -50); // Remove off-screen entities
      
      // Check collisions
      updatedEntities.forEach(entity => {
        const carX = CAR_X;
        const carY = LANE_POSITIONS[carLane];
        const distance = Math.sqrt(
          Math.pow(entity.x - carX, 2) + Math.pow(entity.y - carY, 2)
        );
        
        if (distance < 40 && entity.lane === carLane) {
          onCollision(entity.type);
          // Remove the collided entity
          setEntities(current => current.filter(e => e.id !== entity.id));
        }
      });
      
      return updatedEntities;
    });
    
    // Spawn new entities
    if (gameTime % 60 === 0) { // Spawn every ~1 second at 60fps
      spawnEntity();
    }
    
    // Check win condition
    if (caffeine >= 100) {
      onGameStateChange('victory');
      return;
    }
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameSpeed, gameTime, carLane, onCollision, spawnEntity, caffeine, onGameStateChange]);

  // Initialize game loop
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Reset game state
  useEffect(() => {
    if (gameState === 'playing') {
      setCarLane(1);
      setEntities([]);
      setRoadOffset(0);
      setGameTime(0);
      setCarDriftAnim('');
    }
  }, [gameState]);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [handleKeyPress, handleTouchStart, handleTouchMove]);

  return (
    <div className="relative w-full h-96 bg-gradient-road overflow-hidden rounded-lg border border-primary/30">
      {/* Road lanes */}
      <div className="absolute inset-0">
        {/* Road lines */}
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 60px,
              hsl(var(--primary) / 0.3) 60px,
              hsl(var(--primary) / 0.3) 62px
            )`,
            transform: `translateX(-${roadOffset}px)`
          }}
        />
        
        {/* Lane dividers */}
        {LANE_POSITIONS.slice(0, -1).map((_, index) => (
          <div
            key={index}
            className="absolute w-full border-t border-dashed border-primary/20"
            style={{ top: `${LANE_POSITIONS[index] + 40}px` }}
          />
        ))}
      </div>

      {/* Speed lines effect */}
      {gameState === 'playing' && gameSpeed > 3 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-20 h-0.5 bg-primary/40 animate-speed-lines"
              style={{
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Car */}
      {gameState === 'playing' && (
        <div
          className={cn(
            "absolute transition-all duration-300 ease-out",
            carDriftAnim
          )}
          style={{
            left: `${CAR_X}px`,
            top: `${LANE_POSITIONS[carLane]}px`,
            transform: `translateY(-50%)`
          }}
        >
          <img 
            src={orangeLamboImage}
            alt="Orange Lamborghini"
            className="w-20 h-16 object-contain drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 ${Math.floor(gameSpeed)}px hsl(var(--primary) / 0.6))`
            }}
          />
          
          {/* Exhaust effect when speeding */}
          {gameSpeed > 4 && (
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-2">
              <div className="w-full h-full bg-gradient-to-l from-primary/60 to-transparent rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-l from-secondary/40 to-transparent rounded-full animate-pulse delay-100" />
            </div>
          )}
        </div>
      )}

      {/* Entities */}
      {entities.map(entity => (
        <div
          key={entity.id}
          className={cn(
            "absolute w-8 h-8 rounded transition-all duration-100",
            entity.type === 'bean' 
              ? "bg-coffee-light shadow-sm" 
              : "bg-destructive shadow-md border border-destructive-foreground"
          )}
          style={{
            left: `${entity.x}px`,
            top: `${entity.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {entity.type === 'bean' && (
            <div className="w-full h-full bg-coffee rounded-full shadow-sm animate-pulse" />
          )}
          {entity.type === 'pothole' && (
            <div className="w-full h-full bg-destructive/80 rounded-full border-2 border-destructive-foreground" />
          )}
        </div>
      ))}

      {/* UI Overlay */}
      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-foreground">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-primary/30">
            <div className="text-sm opacity-80">Distance</div>
            <div className="text-lg font-bold">{Math.floor(distance)}m</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-primary/30">
            <div className="text-sm opacity-80">Score</div>
            <div className="text-lg font-bold">{score}</div>
          </div>
        </div>
      )}

      {/* Mobile Control Buttons */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-8 md:hidden">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyPress({ key: 'ArrowUp' } as KeyboardEvent);
            }}
            className="bg-card/60 backdrop-blur-sm rounded-full p-3 border border-primary/30 text-primary hover:border-primary hover:bg-primary/20 transition-all duration-200 active:scale-95 touch-manipulation"
          >
            <div className="text-xl font-bold">↑</div>
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyPress({ key: 'ArrowDown' } as KeyboardEvent);
            }}
            className="bg-card/60 backdrop-blur-sm rounded-full p-3 border border-primary/30 text-primary hover:border-primary hover:bg-primary/20 transition-all duration-200 active:scale-95 touch-manipulation"
          >
            <div className="text-xl font-bold">↓</div>
          </button>
        </div>
      )}

      {/* Caffeine meter */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-4 right-20 md:right-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-primary/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Caffeine</span>
              <span className="text-sm font-bold">{caffeine}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-speed transition-all duration-300 ease-out shadow-glow"
                style={{ width: `${caffeine}%` }}
              />
              {caffeine > 80 && (
                <div className="absolute inset-0 bg-gradient-speed animate-pulse-neon rounded-full" />
              )}
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        width={800}
        height={400}
      />
    </div>
  );
};