import React, { useState, useEffect, useRef } from "react";
import { Zap, Settings } from "lucide-react";
import CardFlow from "./CardFlow";
import { THEMES, drawArenaThemed, Theme } from "@/lib/arenaThemes";
import { Fighter } from "@/lib/Fighter";

interface Character {
  id: number;
  name: string;
  style: string;
  color: string;
  secondaryColor: string;
  description: string;
  build: string;
  gender: string;
}

const CombatGameNew = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"selection" | "fighting" | "victory">(
    "selection"
  );
  const [battleConfig, setBattleConfig] = useState<{
    battleMode: "ai" | "player";
    theme: Theme;
    player1: Character;
    player2: Character;
  } | null>(null);
  const [fighter1, setFighter1] = useState<Fighter | null>(null);
  const [fighter2, setFighter2] = useState<Fighter | null>(null);
  const [winner, setWinner] = useState<{
    character: Character;
    isPlayer1: boolean;
  } | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const characters: Character[] = [
    {
      id: 1,
      name: "Akira - Muay Thai Master",
      color: "#FF3366",
      secondaryColor: "#330000",
      style: "Muay Thai",
      description: "Young martial artist with devastating elbow strikes",
      build: "athletic",
      gender: "male",
    },
    {
      id: 2,
      name: "Marcus - The Boxing Legend",
      color: "#2C3E50",
      secondaryColor: "#E74C3C",
      style: "Boxing",
      description: "Veteran boxer with unmatched precision",
      build: "muscular",
      gender: "male",
    },
    {
      id: 3,
      name: "Sophia - MMA Champion",
      color: "#34495E",
      secondaryColor: "#95A5A6",
      style: "MMA",
      description: "All-around fighter with ground game mastery",
      build: "athletic",
      gender: "female",
    },
    {
      id: 4,
      name: "Helena - Kickboxing Queen",
      color: "#8E44AD",
      secondaryColor: "#C39BD3",
      style: "Kickboxing",
      description: "Experienced fighter with powerful high kicks",
      build: "athletic",
      gender: "female",
    },
    {
      id: 5,
      name: "UNIT-X - Combat Robot",
      color: "#2C3E50",
      secondaryColor: "#00D9FF",
      style: "Tech Combat",
      description: "Advanced tactical combat robot",
      build: "robot",
      gender: "robot",
    },
    {
      id: 6,
      name: "Brutus - Street Brawler",
      color: "#95652C",
      secondaryColor: "#34495E",
      style: "Street Fighting",
      description: "Raw power from the underground circuit",
      build: "heavy",
      gender: "male",
    },
    {
      id: 7,
      name: "Raven - Elite Assassin",
      color: "#1C1C1C",
      secondaryColor: "#7D3C98",
      style: "Assassin Arts",
      description: "Silent and deadly with blade expertise",
      build: "agile",
      gender: "female",
    },
    {
      id: 8,
      name: "Titan - Cybernetic Soldier",
      color: "#D68910",
      secondaryColor: "#273746",
      style: "Cyber Combat",
      description: "Enhanced human with lightning abilities",
      build: "cybernetic",
      gender: "male",
    },
    {
      id: 9,
      name: "Ivan - Grappling Master",
      color: "#784212",
      secondaryColor: "#D4AC0D",
      style: "Grappling",
      description: "Veteran with unbreakable submissions",
      build: "heavy",
      gender: "male",
    },
    {
      id: 10,
      name: "Sakura - Shadow Ninja",
      color: "#C0392B",
      secondaryColor: "#000000",
      style: "Ninjutsu",
      description: "Agile warrior from ancient traditions",
      build: "agile",
      gender: "female",
    },
  ];

  // AI Decision System
  const getAIControls = (fighter: Fighter, opponent: Fighter) => {
    const controls = {
      move: 0,
      running: false,
      jump: false,
      punch: false,
      kick: false,
      uppercut: false,
      special: false,
    };

    const distance = Math.abs(fighter.x - opponent.x);
    const rand = Math.random();

    // Move toward opponent if far
    if (distance > 200) {
      controls.move = fighter.x < opponent.x ? 1 : -1;
      if (rand > 0.6) controls.running = true;
    } else if (distance > 100) {
      // Attack range
      if (rand < 0.4) {
        controls.punch = true;
      } else if (rand < 0.7) {
        controls.kick = true;
      } else if (rand < 0.9) {
        controls.uppercut = true;
      } else if (fighter.energy >= 100) {
        controls.special = true;
      }
    } else {
      // Too close - back up
      controls.move = fighter.x < opponent.x ? -1 : 1;
    }

    // Jump occasionally
    if (rand > 0.85 && fighter.grounded) {
      controls.jump = true;
    }

    // Block when health low
    if (fighter.health < 30 && rand > 0.5) {
      controls.move = fighter.x < opponent.x ? -1 : 1;
    }

    return controls;
  };

  const handleGameStart = (config: {
    battleMode: "ai" | "player";
    theme: Theme;
    player1: Character;
    player2: Character;
  }) => {
    setBattleConfig(config);
    setGameState("fighting");

    const char1 = config.player1;
    const char2 = config.player2;

    const f1 = new Fighter(100, 300, char1, true);
    const f2 = new Fighter(650, 300, char2, false);

    setFighter1(f1);
    setFighter2(f2);
  };

  const handleBackToSelection = () => {
    setGameState("selection");
    setFighter1(null);
    setFighter2(null);
    setWinner(null);
  };

  useEffect(() => {
    if (gameState !== "fighting" || !fighter1 || !fighter2 || !battleConfig)
      return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const groundLevel = 480;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = () => {
      // Draw arena background
      drawArenaThemed(ctx, 800, 600, groundLevel, battleConfig.theme.id);

      // Player 1 controls (WASD + F/G/H/T)
      let p1Move = 0;
      const p1Running = keysPressed.current["shift"];

      if (keysPressed.current["a"]) p1Move = -1;
      if (keysPressed.current["d"]) p1Move = 1;
      if (keysPressed.current["w"]) fighter1.jump();
      if (keysPressed.current["f"]) fighter1.attack("punch");
      if (keysPressed.current["g"]) fighter1.attack("kick");
      if (keysPressed.current["t"]) fighter1.attack("uppercut");
      if (keysPressed.current["h"]) fighter1.attack("special");

      if (p1Move !== 0) {
        fighter1.move(p1Move, p1Running);
      } else {
        fighter1.stop();
      }

      // Player 2 or AI controls
      if (battleConfig.battleMode === "player") {
        // Player 2 controls (Arrow keys + J/K/L/U)
        let p2Move = 0;
        const p2Running = keysPressed.current["enter"];

        if (keysPressed.current["arrowleft"]) p2Move = -1;
        if (keysPressed.current["arrowright"]) p2Move = 1;
        if (keysPressed.current["arrowup"]) fighter2.jump();
        if (keysPressed.current["j"]) fighter2.attack("punch");
        if (keysPressed.current["k"]) fighter2.attack("kick");
        if (keysPressed.current["u"]) fighter2.attack("uppercut");
        if (keysPressed.current["l"]) fighter2.attack("special");

        if (p2Move !== 0) {
          fighter2.move(p2Move, p2Running);
        } else {
          fighter2.stop();
        }
      } else {
        // AI Controls
        const aiControls = getAIControls(fighter2, fighter1);

        if (aiControls.move !== 0) {
          fighter2.move(aiControls.move, aiControls.running);
        } else {
          fighter2.stop();
        }

        if (aiControls.jump) fighter2.jump();
        if (aiControls.punch) fighter2.attack("punch");
        if (aiControls.kick) fighter2.attack("kick");
        if (aiControls.uppercut) fighter2.attack("uppercut");
        if (aiControls.special) fighter2.attack("special");
      }

      // Update fighters
      fighter1.update(groundLevel, fighter2);
      fighter2.update(groundLevel, fighter1);

      // Draw fighters
      fighter1.draw(ctx);
      fighter2.draw(ctx);

      // Draw combo counter
      if (fighter1.comboCounter > 1) {
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`${fighter1.comboCounter}x COMBO!`, 20, 100);
      }
      if (fighter2.comboCounter > 1) {
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`${fighter2.comboCounter}x COMBO!`, 780, 100);
      }

      // Check for winner
      if (fighter1.health <= 0 || fighter2.health <= 0) {
        const winnerIsPlayer1 = fighter1.health > 0;
        const winnerCharacter = winnerIsPlayer1
          ? battleConfig.player1
          : battleConfig.player2;

        setWinner({
          character: winnerCharacter,
          isPlayer1: winnerIsPlayer1,
        });
        setGameState("victory");
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, fighter1, fighter2, battleConfig]);

  // Render states
  if (gameState === "selection") {
    return (
      <CardFlow
        onGameStart={handleGameStart}
        onBack={() => {}}
        characters={characters}
        themes={THEMES}
      />
    );
  }

  if (gameState === "fighting") {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="mb-3 bg-black bg-opacity-60 rounded-lg px-6 py-3 text-white text-sm max-w-4xl">
          <div className="text-center">
            {battleConfig?.battleMode === "player" ? (
              <>
                <div>
                  <span className="text-blue-400 font-bold">P1:</span> WASD +
                  Shift(Run) | F(Punch) G(Kick) T(Uppercut) H(Special)
                </div>
                <div>
                  <span className="text-red-400 font-bold">P2:</span> Arrows +
                  Enter(Run) | J(Punch) K(Kick) U(Uppercut) L(Special)
                </div>
              </>
            ) : (
              <div>
                <span className="text-blue-400 font-bold">PLAYER:</span> WASD +
                Shift(Run) | F(Punch) G(Kick) T(Uppercut) H(Special)
              </div>
            )}
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-8 border-yellow-600 rounded-xl shadow-2xl shadow-yellow-600/30"
        />
        <div className="mt-3 text-gray-400 text-xs">
          Arena: {battleConfig?.theme.name}
        </div>
      </div>
    );
  }

  if (gameState === "victory" && winner) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <div className="animate-bounce text-6xl mb-4">🏆</div>
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4">
            VICTORY!
          </h1>
          <p className="text-4xl font-bold text-white mb-2">
            {winner.character.name.split("-")[0]}
          </p>
          <p className="text-gray-400 text-lg">{winner.character.style}</p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur border-4 border-yellow-400 rounded-2xl p-8 w-full max-w-md mb-12">
          <div className="text-center mb-8">
            <div
              className="w-32 h-32 rounded-lg mx-auto mb-4 flex items-center justify-center font-bold text-6xl shadow-lg"
              style={{
                backgroundImage: `linear-gradient(135deg, ${winner.character.color} 0%, ${winner.character.secondaryColor} 100%)`,
              }}
            >
              {winner.character.build === "robot"
                ? "🤖"
                : winner.character.build === "cybernetic"
                ? "⚡"
                : winner.character.gender === "female"
                ? "👩"
                : "👨"}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleBackToSelection()}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/50 flex items-center justify-center gap-2"
            >
              <Zap size={24} /> Play Again <Zap size={24} />
            </button>
            <button
              onClick={() => handleBackToSelection()}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/50 flex items-center justify-center gap-2"
            >
              <Settings size={24} /> Change Settings <Settings size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CombatGameNew;
