'use client';

import { useEffect, useState, useCallback } from 'react';

type Position = {
  x: number;
  y: number;
};

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    generateFood();
    setIsPaused(false);
  };

  const checkCollision = (head: Position) => {
    // 检查是否撞墙
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // 检查是否撞到自己
    return snake.some((segment, index) => {
      if (index === 0) return false;
      return segment.x === head.x && segment.y === head.y;
    });
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((currentSnake) => {
      const head = currentSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      if (checkCollision(newHead)) {
        setIsGameOver(true);
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      // 检查是否吃到食物
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPaused((p) => !p);
        return;
      }

      if (isGameOver) {
        if (e.key === 'Enter') {
          resetGame();
        }
        return;
      }

      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
            return direction.y === 1 ? direction : { x: 0, y: -1 };
          case 'ArrowDown':
            return direction.y === -1 ? direction : { x: 0, y: 1 };
          case 'ArrowLeft':
            return direction.x === 1 ? direction : { x: -1, y: 0 };
          case 'ArrowRight':
            return direction.x === -1 ? direction : { x: 1, y: 0 };
          default:
            return direction;
        }
      })();

      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyPress);
    const gameInterval = setInterval(moveSnake, GAME_SPEED);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameInterval);
    };
  }, [direction, isGameOver, moveSnake]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[400px] px-4 mb-2">
        <div className="text-xl font-bold">得分: {score}</div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPaused ? '继续' : '暂停'}
        </button>
      </div>
      
      <div
        className="relative bg-gray-100 border-2 border-gray-300"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              borderRadius: index === 0 ? '4px' : '2px',
            }}
          />
        ))}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        />
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">游戏结束!</h2>
            <p className="mb-4">最终得分: {score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        使用方向键控制蛇的移动，空格键暂停游戏
      </div>
    </div>
  );
}

export default SnakeGame; 