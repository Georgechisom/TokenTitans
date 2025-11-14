import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CHARACTERS, THEMES } from "@/lib/thirdweb";
import { Sword, Shield, Flame, ArrowLeft, Trophy } from "lucide-react";
import toast from "react-hot-toast";

const Arena = () => {
  const navigate = useNavigate();
  const { id: gameId } = useParams();
  const [searchParams] = useSearchParams();

  const charId = searchParams.get("char") || "muay-thai";
  const themeId = searchParams.get("theme") || "wrestling-ring";
  const isAI = searchParams.get("ai") === "true";

  const playerChar = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];
  const aiChar = CHARACTERS.find((c) => c.id !== charId) || CHARACTERS[1];
  const selectedTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const [playerHealth, setPlayerHealth] = useState(100);
  const [aiHealth, setAiHealth] = useState(100);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerBlocked, setPlayerBlocked] = useState(false);
  const [aiBlocked, setAiBlocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    if (playerHealth <= 0) {
      setGameOver(true);
      setWinner("ai");
      toast.error("Defeated! Better luck next time.");
    } else if (aiHealth <= 0) {
      setGameOver(true);
      setWinner("player");
      toast.success("Victory! You've won the battle!");
    }
  }, [playerHealth, aiHealth]);

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && isAI) {
      // AI turn - simple random strategy
      const timer = setTimeout(() => {
        const aiMove = Math.random();
        if (aiMove < 0.4) {
          handleAIAttack();
        } else if (aiMove < 0.7) {
          handleAIDefend();
        } else if (aiHealth <= 20) {
          handleAISpecial();
        } else {
          handleAIAttack();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver]);

  const handleAttack = () => {
    if (!isPlayerTurn || gameOver) return;

    let damage = 20;
    if (aiBlocked) {
      damage = 0;
      toast("Blocked! No damage dealt", { icon: "🛡️" });
      setAiBlocked(false);
    } else {
      setAiHealth((prev) => Math.max(0, prev - damage));
      toast.success(`Hit! -${damage} damage`);
    }

    setLastAction("player-attack");
    setPlayerBlocked(false);
    setIsPlayerTurn(false);
  };

  const handleDefend = () => {
    if (!isPlayerTurn || gameOver) return;

    setPlayerBlocked(true);
    toast("Defending... Next attack will be blocked", { icon: "🛡️" });
    setLastAction("player-defend");
    setIsPlayerTurn(false);
  };

  const handleSpecial = () => {
    if (!isPlayerTurn || gameOver || aiHealth > 20) return;

    const damage = 40;
    setAiHealth((prev) => Math.max(0, prev - damage));
    toast.success(`FINISHING MOVE! -${damage} damage`, { icon: "🔥" });
    setLastAction("player-special");
    setPlayerBlocked(false);
    setIsPlayerTurn(false);
  };

  const handleAIAttack = () => {
    let damage = 20;
    if (playerBlocked) {
      damage = 0;
      toast("AI attack blocked!", { icon: "🛡️" });
      setPlayerBlocked(false);
    } else {
      setPlayerHealth((prev) => Math.max(0, prev - damage));
      toast.error(`AI hits you for ${damage} damage!`);
    }

    setLastAction("ai-attack");
    setAiBlocked(false);
    setIsPlayerTurn(true);
  };

  const handleAIDefend = () => {
    setAiBlocked(true);
    toast("AI is defending...", { icon: "🤖" });
    setLastAction("ai-defend");
    setIsPlayerTurn(true);
  };

  const handleAISpecial = () => {
    const damage = 40;
    setPlayerHealth((prev) => Math.max(0, prev - damage));
    toast.error(`AI FINISHING MOVE! -${damage} damage`, { icon: "💀" });
    setLastAction("ai-special");
    setAiBlocked(false);
    setIsPlayerTurn(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={selectedTheme.image}
          alt={selectedTheme.name}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            // Fallback to animated background if image fails
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallbackDiv = document.createElement("div");
              fallbackDiv.className =
                "absolute inset-0 bg-gradient-to-b from-background via-background to-muted";
              parent.appendChild(fallbackDiv);
              const motionDiv = document.createElement("div");
              motionDiv.className = "absolute inset-0 opacity-20";
              motionDiv.style.backgroundImage =
                "radial-gradient(circle, hsl(var(--neon-cyan) / 0.2) 0%, transparent 50%)";
              motionDiv.style.backgroundSize = "200% 200%";
              parent.appendChild(motionDiv);
            }
          }}
        />
        <div className="absolute inset-0 bg-black/50" />{" "}
        {/* Overlay for readability */}
      </div>

      {/* Arena Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/game")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2" />
            Exit Arena
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Arena</div>
            <div className="text-xs font-mono text-primary">
              {selectedTheme.name}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Game ID: {gameId}
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Turn Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className={`inline-block px-6 py-3 rounded-full glass ${
              isPlayerTurn ? "border-primary" : "border-secondary"
            }`}
          >
            <span className="text-lg font-bold">
              {isPlayerTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
            </span>
          </div>
        </motion.div>

        {/* Fighters */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 flex-1">
          {/* Player */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={lastAction?.startsWith("player") ? "animate-shake" : ""}
          >
            <Card className="glass p-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-primary mb-2">YOU</h2>
                <p className="text-sm text-muted-foreground">
                  {playerChar.name}
                </p>
              </div>

              {/* Health Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Health</span>
                  <span className="text-lg font-bold text-primary">
                    {playerHealth}/100
                  </span>
                </div>
                <Progress value={playerHealth} className="h-4" />
              </div>

              {/* Character Display */}
              <div className="relative aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <div className="text-8xl">🥊</div>
                {playerBlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Shield className="w-20 h-20 text-primary animate-pulse" />
                  </motion.div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-xs text-muted-foreground">STR</div>
                  <div className="text-lg font-bold text-primary">
                    {playerChar.strength}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">SPD</div>
                  <div className="text-lg font-bold text-secondary">
                    {playerChar.speed}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* AI/Opponent */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className={lastAction?.startsWith("ai") ? "animate-shake" : ""}
          >
            <Card className="glass p-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-accent mb-2">
                  OPPONENT
                </h2>
                <p className="text-sm text-muted-foreground">{aiChar.name}</p>
              </div>

              {/* Health Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Health</span>
                  <span className="text-lg font-bold text-accent">
                    {aiHealth}/100
                  </span>
                </div>
                <Progress value={aiHealth} className="h-4" />
              </div>

              {/* Character Display */}
              <div className="relative aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <div className="text-8xl transform scale-x-[-1]">🤖</div>
                {aiBlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Shield className="w-20 h-20 text-accent animate-pulse" />
                  </motion.div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-xs text-muted-foreground">STR</div>
                  <div className="text-lg font-bold text-accent">
                    {aiChar.strength}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">SPD</div>
                  <div className="text-lg font-bold text-secondary">
                    {aiChar.speed}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Controls */}
        <AnimatePresence>
          {!gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-2xl mx-auto mt-auto"
            >
              <Card className="glass p-6">
                <h3 className="text-lg font-bold mb-4 text-center">
                  Your Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    size="lg"
                    onClick={handleAttack}
                    disabled={!isPlayerTurn}
                    className="flex flex-col items-center gap-2 h-auto py-6 bg-primary hover:bg-primary/90"
                  >
                    <Sword className="w-8 h-8" />
                    <span>Attack</span>
                    <span className="text-xs opacity-80">-20 damage</span>
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleDefend}
                    disabled={!isPlayerTurn}
                    className="flex flex-col items-center gap-2 h-auto py-6 bg-secondary hover:bg-secondary/90"
                  >
                    <Shield className="w-8 h-8" />
                    <span>Defend</span>
                    <span className="text-xs opacity-80">
                      Block next attack
                    </span>
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleSpecial}
                    disabled={!isPlayerTurn || aiHealth > 20}
                    className="flex flex-col items-center gap-2 h-auto py-6 bg-accent hover:bg-accent/90"
                  >
                    <Flame className="w-8 h-8" />
                    <span>Special</span>
                    <span className="text-xs opacity-80">
                      -40 damage (HP≤20)
                    </span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto mt-auto"
            >
              <Card className="glass p-8 text-center border-2 border-primary">
                <Trophy className="w-20 h-20 mx-auto mb-4 text-primary animate-pulse" />
                <h2 className="text-4xl font-bold mb-4 text-neon">
                  {winner === "player" ? "VICTORY!" : "DEFEATED!"}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {winner === "player"
                    ? "You've proven your worth in the arena!"
                    : "Train harder and return stronger!"}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/game")}
                    className="flex-1"
                    variant="outline"
                  >
                    New Battle
                  </Button>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Dashboard
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Arena;
