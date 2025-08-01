import orangeLamboImage from "@/assets/orange-lambo.png";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

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
  baseSpeed: number;
}

const LANE_POSITIONS = [80, 140, 200, 260]; // Y positions for 4 lanes (more spaced out)
const LANE_POSITIONS_MOBILE = ['12.5%', '37.5%', '62.5%', '87.5%']; // X positions for 4 lanes on mobile
const CAR_X = 100; // Fixed X position of the car (desktop)

export const GameCanvas = ({
  gameState,
  onCollision,
  caffeine,
  score,
  distance,
  onGameStateChange,
  baseSpeed,
}: GameCanvasProps) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [carLane, setCarLane] = useState(1); // 0 = top, 1 = middle, 2 = bottom
  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [roadOffset, setRoadOffset] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [carDriftAnim, setCarDriftAnim] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const entitiesRef = useRef(entities);
  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  const isMobile = useIsMobile();
  const gameSpeed = baseSpeed + (caffeine * 0.01); // Slower progression
  const { toast } = useToast();

  // Unified position calculations - use SAME logic for rendering AND collision
  const getCarPosition = () => {
    if (isMobile) {
      return {
        x: getMobileLaneX(carLane),
        y: getCarYMobile()
      };
    } else {
      return {
        x: CAR_X,
        y: LANE_POSITIONS[carLane]
      };
    }
  };

  // Calculate mobile car position dynamically
  const getCarYMobile = () => {
    if (typeof window !== 'undefined') {
      return window.innerHeight - 180;
    }
    return 640; // fallback for SSR
  };

  // Calculate mobile lane X positions dynamically
  const getMobileLaneX = (laneIndex: number) => {
    if (typeof window !== 'undefined') {
      const screenWidth = document.documentElement.clientWidth;
      const positions = [
        screenWidth * 0.125,
        screenWidth * 0.375,
        screenWidth * 0.625,
        screenWidth * 0.875
      ];
      return positions[laneIndex];
    }
    return [80, 160, 240, 320][laneIndex]; // fallback for 4 lanes
  };

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    const key = event.key.toLowerCase();
    if (isMobile) {
      // Mobile: left/right controls
      if ((key === 'arrowleft' || key === 'a') && carLane > 0) {
        setCarLane(prev => prev - 1);
      } else if ((key === 'arrowright' || key === 'd') && carLane < 3) {
        setCarLane(prev => prev + 1);
      }
    } else {
      // Desktop: up/down controls
      if ((key === 'arrowup' || key === 'w') && carLane > 0) {
        setCarLane(prev => prev - 1);
      } else if ((key === 'arrowdown' || key === 's') && carLane < 3) {
        setCarLane(prev => prev + 1);
      }
    }
  }, [gameState, carLane, isMobile]);

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

    if (isMobile) {
      // Mobile: horizontal lanes (left/right)
      const touchX = touch.clientX - rect.left;
      const canvasWidth = rect.width;

      const newLane = Math.floor((touchX / canvasWidth) * 4);
      const clampedLane = Math.max(0, Math.min(3, newLane));

      if (clampedLane !== carLane) {
        setCarLane(clampedLane);
      }
    } else {
      // Desktop: vertical lanes (up/down)
      const touchY = touch.clientY - rect.top;
      const canvasHeight = rect.height;

      const newLane = Math.floor((touchY / canvasHeight) * 4);
      const clampedLane = Math.max(0, Math.min(3, newLane));

      if (clampedLane !== carLane) {
        setCarLane(clampedLane);
      }
    }
  }, [gameState, carLane, isMobile]);

  // Spawn entities
  const spawnEntity = useCallback(() => {
    if (gameState !== 'playing') return;

    const shouldSpawnBean = Math.random() < 0.4; // 40% chance for bean, 60% for pothole
    const randomLane = Math.floor(Math.random() * 4);

    const newEntity: GameEntity = {
      id: `${Date.now()}-${Math.random()}`,
      x: isMobile ? getMobileLaneX(randomLane) : 800, // Mobile: spawn in lane X, Desktop: spawn off-screen right
      y: isMobile ? -50 : LANE_POSITIONS[randomLane], // Mobile: spawn off-screen top, Desktop: spawn in lane Y
      lane: randomLane,
      type: shouldSpawnBean ? 'bean' : 'pothole'
    };

    setEntities(prev => [...prev, newEntity]);
  }, [gameState, isMobile]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing' || isPaused) return;

    setGameTime(prev => prev + 1);
    setRoadOffset(prev => (prev + gameSpeed) % 200);

    const carPos = getCarPosition();

    // Move entities
    const movedEntities = entitiesRef.current.map(entity => ({
      ...entity,
      x: isMobile ? entity.x : entity.x - gameSpeed * 3,
      y: isMobile ? entity.y + gameSpeed * 3 : entity.y
    })).filter(entity =>
      isMobile ? entity.y < getCarYMobile() + 100 : entity.x > -50
    );

    // Check for collisions
    let collidedEntity = null;
    for (const entity of movedEntities) {
      if (entity.lane !== carLane) continue;

      const isEntityVisible = isMobile
        ? (entity.y > 0 && entity.y < window.innerHeight)
        : (entity.x > 0 && entity.x < 800);

      if (!isEntityVisible) continue;

      const carSize = { width: 60, height: 48 };
      const entitySize = { width: 32, height: 32 };
      const carCollisionOffset = 30;

      const carBounds = {
        left: carPos.x - carSize.width / 2 + carCollisionOffset,
        right: carPos.x + carSize.width / 2 + carCollisionOffset,
        top: carPos.y - carSize.height / 2,
        bottom: carPos.y + carSize.height / 2
      };

      const entityBounds = {
        left: entity.x - entitySize.width / 2,
        right: entity.x + entitySize.width / 2,
        top: entity.y - entitySize.height / 2,
        bottom: entity.y + entitySize.height / 2
      };

      const isOverlapping = !(
        carBounds.right < entityBounds.left ||
        carBounds.left > entityBounds.right ||
        carBounds.bottom < entityBounds.top ||
        carBounds.top > entityBounds.bottom
      );

      if (isOverlapping) {
        collidedEntity = entity;
        break;
      }
    }

    if (collidedEntity) {
      onCollision(collidedEntity.type);
      setEntities(prev => prev.filter(e => e.id !== collidedEntity.id));
    } else {
      setEntities(movedEntities);
    }

    // Spawn new entities
    if (gameTime % 45 === 0) { // Spawn every ~0.75 seconds at 60fps
      spawnEntity();
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameSpeed, gameTime, carLane, onCollision, spawnEntity, caffeine, onGameStateChange, isPaused, isMobile]);

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
      setIsPaused(false);
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
    <div className={cn(
      "relative w-full overflow-hidden rounded-lg border border-primary/30",
      isMobile ? "h-screen bg-gradient-road" : "h-96 bg-gradient-road"
    )}>
      {/* Road lanes */}
      <div className="absolute inset-0">
        {/* Road lines */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: isMobile
              ? `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 40px,
                  hsl(var(--primary) / 0.3) 40px,
                  hsl(var(--primary) / 0.3) 42px
                )`
              : `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 40px,
                  hsl(var(--primary) / 0.3) 40px,
                  hsl(var(--primary) / 0.3) 42px
                )`,
            transform: isMobile
              ? `translateY(-${roadOffset}px)`
              : `translateX(-${roadOffset}px)`
          }}
        />

        {/* Lane dividers */}
        {isMobile ? (
          // Mobile: 3 vertical lane dividers creating 4 equal lanes
          [25, 50, 75].map((position, index) => (
            <div
              key={index}
              className="absolute h-full border-l-2 border-dashed border-primary/40"
              style={{ left: `calc(${position}% - 1px)` }}
            />
          ))
        ) : (
          // Desktop: 3 horizontal lane dividers creating 4 lanes
          LANE_POSITIONS.slice(0, -1).map((_, index) => (
            <div
              key={index}
              className="absolute w-full border-t-2 border-dashed border-primary/40"
              style={{ top: `calc(${LANE_POSITIONS[index] + 30}px - 1px)` }}
            />
          ))
        )}
      </div>

      {/* Speed lines effect */}
      {gameState === 'playing' && gameSpeed > 3 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute bg-primary/40 animate-speed-lines",
                isMobile ? "w-0.5 h-20" : "w-20 h-0.5"
              )}
              style={isMobile ? {
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`
              } : {
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
          className="absolute transition-all duration-300 ease-out"
          style={(() => {
            const carPos = getCarPosition();
            return isMobile ? {
              left: `${carPos.x}px`,
              top: `${carPos.y}px`,
              transform: `translate(-50%, -50%) rotate(-90deg)`
            } : {
              left: `${carPos.x}px`,
              top: `${carPos.y}px`,
              transform: `translate(-50%, -50%)` // Changed: now centers both horizontally and vertically on desktop too
            };
          })()}
        >
          <img
            src={orangeLamboImage}
            alt="Orange Lamborghini"
            className="object-contain drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 ${Math.floor(gameSpeed)}px hsl(var(--primary) / 0.6))`,
              imageRendering: 'pixelated', // Prevent scaling artifacts
              width: '60px', // Smaller fixed width
              height: '48px', // Smaller fixed height
              minWidth: '60px', // Prevent shrinking
              maxWidth: '60px' // Prevent growing
            }}
          />

          {/* Exhaust effect when speeding */}
          {gameSpeed > 4 && (
            <div className={cn(
              "absolute w-12 h-2",
              isMobile
                ? "top-8 left-1/2 -translate-x-1/2 rotate-90 w-2 h-12"
                : "-left-6 top-1/2 -translate-y-1/2"
            )}>
              <div className={cn(
                "w-full h-full rounded-full animate-pulse",
                isMobile
                  ? "bg-gradient-to-t from-primary/60 to-transparent"
                  : "bg-gradient-to-l from-primary/60 to-transparent"
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full animate-pulse delay-100",
                isMobile
                  ? "bg-gradient-to-t from-secondary/40 to-transparent"
                  : "bg-gradient-to-l from-secondary/40 to-transparent"
              )} />
            </div>
          )}
        </div>
      )}

      {/* Entities */}
      {entities.map(entity => (
        <div
          key={entity.id}
          className={cn(
            "absolute w-8 h-8 rounded",
            entity.type === 'bean'
              ? "bg-coffee-light shadow-sm"
              : "bg-destructive shadow-md border border-destructive-foreground"
          )}
          style={{
            left: `${entity.x}px`,
            top: `${entity.y}px`,
            transform: 'translate(-50%, -50%)' // Center both horizontally and vertically
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

      {/* Caffeine meter - positioned below car */}
      {gameState === 'playing' && (
        <div className={cn(
          "absolute z-10",
          isMobile
            ? "bottom-20 left-1/2 -translate-x-1/2 w-48"
            : "bottom-4 left-4 w-48"
        )}>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-primary/30">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Caffeine</span>
              <span className="text-xs font-bold">{caffeine}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
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

      {/* Mobile Control Buttons */}
      {gameState === 'playing' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-8 md:hidden">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyPress({ key: 'ArrowLeft' } as KeyboardEvent);
            }}
            className="bg-card/60 backdrop-blur-sm rounded-full p-3 border border-primary/30 text-primary hover:border-primary hover:bg-primary/20 transition-all duration-200 active:scale-95 touch-manipulation"
          >
            <div className="text-xl font-bold">←</div>
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleKeyPress({ key: 'ArrowRight' } as KeyboardEvent);
            }}
            className="bg-card/60 backdrop-blur-sm rounded-full p-3 border border-primary/30 text-primary hover:border-primary hover:bg-primary/20 transition-all duration-200 active:scale-95 touch-manipulation"
          >
            <div className="text-xl font-bold">→</div>
          </button>
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