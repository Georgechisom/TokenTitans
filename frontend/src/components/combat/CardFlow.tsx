import React, { useState } from "react";
import { Zap, Shield, Sword, ArrowLeft } from "lucide-react";

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

interface Theme {
  id: string;
  name: string;
  image: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface CardFlowProps {
  onGameStart: (config: {
    battleMode: "ai" | "player";
    theme: Theme;
    player1: Character;
    player2: Character;
  }) => void;
  onBack: () => void;
  characters: Character[];
  themes: Theme[];
}

const CardFlow: React.FC<CardFlowProps> = ({
  onGameStart,
  onBack,
  characters,
  themes,
}) => {
  const [currentCard, setCurrentCard] = useState(1);
  const [battleMode, setBattleMode] = useState<"ai" | "player" | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [player1Character, setPlayer1Character] = useState<Character | null>(
    null
  );
  const [player2Character, setPlayer2Character] = useState<Character | null>(
    null
  );
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "left"
  );
  const [isSliding, setIsSliding] = useState(false);

  const handleBattleModeSelect = (mode: "ai" | "player") => {
    setBattleMode(mode);
    setSlideDirection("left");
    setIsSliding(true);
    setTimeout(() => {
      setCurrentCard(2);
      setIsSliding(false);
    }, 500);
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setSlideDirection("right");
    setIsSliding(true);
    setTimeout(() => {
      setCurrentCard(3);
      setIsSliding(false);
    }, 500);
  };

  const handlePlayer1CharacterSelect = (character: Character) => {
    setPlayer1Character(character);
    if (battleMode === "ai") {
      // Auto-select different AI character
      const availableCharacters = characters.filter(
        (c) => c.id !== character.id
      );
      const aiCharacter =
        availableCharacters[
          Math.floor(Math.random() * availableCharacters.length)
        ];
      setPlayer2Character(aiCharacter);
      setSlideDirection("left");
      setIsSliding(true);
      setTimeout(() => {
        setCurrentCard(4);
        setIsSliding(false);
      }, 500);
    } else {
      setSlideDirection("left");
      setIsSliding(true);
      setTimeout(() => {
        setCurrentCard(3.5); // Intermediate card for Player 2
        setIsSliding(false);
      }, 500);
    }
  };

  const handlePlayer2CharacterSelect = (character: Character) => {
    setPlayer2Character(character);
    setSlideDirection("left");
    setIsSliding(true);
    setTimeout(() => {
      setCurrentCard(4);
      setIsSliding(false);
    }, 500);
  };

  const handleConfirmAndFight = () => {
    if (selectedTheme && player1Character && player2Character && battleMode) {
      onGameStart({
        battleMode,
        theme: selectedTheme,
        player1: player1Character,
        player2: player2Character,
      });
    }
  };

  const handleBackButton = () => {
    if (currentCard === 1) {
      onBack();
    } else {
      setSlideDirection("right");
      setIsSliding(true);
      setTimeout(() => {
        setCurrentCard(Math.max(1, currentCard - 1));
        setIsSliding(false);
      }, 500);
    }
  };

  const slideVariants = {
    enter: (dir: string) => ({
      x: dir === "left" ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: string) => ({
      zIndex: 0,
      x: dir === "left" ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const cardContent = () => {
    const baseClasses = `
      absolute inset-0 flex flex-col items-center justify-center p-8
      transition-all duration-500 ease-in-out
      ${
        isSliding
          ? slideDirection === "left"
            ? "translate-x-full opacity-0"
            : "-translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      }
    `;

    // Card 1: Battle Mode Selection
    if (currentCard === 1) {
      return (
        <div className={baseClasses}>
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-2">
              Choose Battle Mode
            </h2>
            <p className="text-gray-300 text-lg">
              Select how you want to fight
            </p>
          </div>

          <div className="flex gap-8 w-full max-w-2xl">
            <button
              onClick={() => handleBattleModeSelect("ai")}
              className={`flex-1 p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                battleMode === "ai"
                  ? "bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl shadow-blue-500/50 ring-4 ring-blue-400"
                  : "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
              }`}
            >
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-2">VS AI</h3>
              <p className="text-gray-300 text-sm">
                Challenge the computer with adaptive difficulty
              </p>
            </button>

            <button
              onClick={() => handleBattleModeSelect("player")}
              className={`flex-1 p-8 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                battleMode === "player"
                  ? "bg-gradient-to-br from-red-600 to-red-800 shadow-2xl shadow-red-500/50 ring-4 ring-red-400"
                  : "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
              }`}
            >
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-2">VS Player</h3>
              <p className="text-gray-300 text-sm">
                Battle with a friend on the same machine
              </p>
            </button>
          </div>
        </div>
      );
    }

    // Card 2: Arena/Theme Selection
    if (currentCard === 2) {
      return (
        <div className={baseClasses}>
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600 mb-2">
              Select Arena
            </h2>
            <p className="text-gray-300 text-lg">Choose your battleground</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedTheme?.id === theme.id
                    ? "ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/50"
                    : "ring-2 ring-gray-600 hover:ring-gray-400"
                }`}
              >
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  <img
                    src={theme.image}
                    alt={theme.name}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4 bg-gray-900">
                  <h3 className="text-white font-bold text-sm mb-1">
                    {theme.name}
                  </h3>
                  <p className="text-gray-400 text-xs">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Card 3: Player 1 Character Selection
    if (currentCard === 3) {
      return (
        <div className={baseClasses}>
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-600 mb-2">
              {battleMode === "ai"
                ? "Choose Your Fighter"
                : "Player 1 - Choose Fighter"}
            </h2>
            <p className="text-gray-300 text-lg">Select your champion</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-5xl max-h-96 overflow-y-auto pr-2">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handlePlayer1CharacterSelect(character)}
                className={`p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  player1Character?.id === character.id
                    ? "bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-500/50 ring-4 ring-purple-400"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div
                  className="w-full h-20 rounded mb-2 flex items-center justify-center font-bold text-white text-2xl shadow-inner"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${character.color} 0%, ${character.secondaryColor} 100%)`,
                  }}
                >
                  {character.build === "robot"
                    ? "🤖"
                    : character.build === "cybernetic"
                    ? "⚡"
                    : character.gender === "female"
                    ? "👩"
                    : "👨"}
                </div>
                <p className="text-white font-bold text-xs mb-1">
                  {character.name.split("-")[0].trim()}
                </p>
                <p className="text-gray-300 text-xs">{character.style}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Card 3.5: Player 2 Character Selection (PvP only)
    if (currentCard === 3.5) {
      return (
        <div className={baseClasses}>
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 mb-2">
              Player 2 - Choose Fighter
            </h2>
            <p className="text-gray-300 text-lg">Select your champion</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-5xl max-h-96 overflow-y-auto pr-2">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handlePlayer2CharacterSelect(character)}
                disabled={player1Character?.id === character.id}
                className={`p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  player2Character?.id === character.id
                    ? "bg-gradient-to-br from-orange-600 to-orange-800 shadow-lg shadow-orange-500/50 ring-4 ring-orange-400"
                    : player1Character?.id === character.id
                    ? "bg-gray-800 opacity-40 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div
                  className="w-full h-20 rounded mb-2 flex items-center justify-center font-bold text-white text-2xl shadow-inner"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${character.color} 0%, ${character.secondaryColor} 100%)`,
                  }}
                >
                  {character.build === "robot"
                    ? "🤖"
                    : character.build === "cybernetic"
                    ? "⚡"
                    : character.gender === "female"
                    ? "👩"
                    : "👨"}
                </div>
                <p className="text-white font-bold text-xs mb-1">
                  {character.name.split("-")[0].trim()}
                </p>
                <p className="text-gray-300 text-xs">{character.style}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Card 4: Final Confirmation
    if (currentCard === 4) {
      return (
        <div className={baseClasses}>
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-2">
              Ready for Battle?
            </h2>
            <p className="text-gray-300 text-lg">Review your selections</p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur border-2 border-purple-500 rounded-xl p-8 w-full max-w-2xl">
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Battle Mode */}
              <div className="text-center">
                <div className="text-3xl mb-3">
                  {battleMode === "ai" ? "🤖" : "👥"}
                </div>
                <p className="text-gray-400 text-sm mb-1">Battle Mode</p>
                <p className="text-white font-bold">
                  {battleMode === "ai" ? "VS AI" : "VS Player"}
                </p>
              </div>

              {/* Theme */}
              <div className="text-center">
                <div className="text-3xl mb-3">🏟️</div>
                <p className="text-gray-400 text-sm mb-1">Arena</p>
                <p className="text-white font-bold text-sm">
                  {selectedTheme?.name || "Not Selected"}
                </p>
              </div>

              {/* Fighters */}
              <div className="text-center">
                <div className="text-3xl mb-3">⚔️</div>
                <p className="text-gray-400 text-sm mb-1">Fighters</p>
                <p className="text-white font-bold text-sm">Selected</p>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              {/* Player 1 */}
              <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4">
                <p className="text-gray-300 text-xs mb-2">PLAYER 1</p>
                <div
                  className="w-full h-16 rounded mb-2 flex items-center justify-center font-bold text-white text-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${player1Character?.color} 0%, ${player1Character?.secondaryColor} 100%)`,
                  }}
                >
                  {player1Character?.build === "robot"
                    ? "🤖"
                    : player1Character?.build === "cybernetic"
                    ? "⚡"
                    : player1Character?.gender === "female"
                    ? "👩"
                    : "👨"}
                </div>
                <p className="text-white font-bold text-sm">
                  {player1Character?.name.split("-")[0]}
                </p>
                <p className="text-gray-300 text-xs">
                  {player1Character?.style}
                </p>
              </div>

              {/* VS */}
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-red-600 to-yellow-600 rounded-full w-16 h-16 flex items-center justify-center border-2 border-white">
                  <span className="font-bold text-white text-xl">VS</span>
                </div>
              </div>

              {/* Player 2 / AI */}
              <div className="flex-1 bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4">
                <p className="text-gray-300 text-xs mb-2">
                  {battleMode === "ai" ? "AI OPPONENT" : "PLAYER 2"}
                </p>
                <div
                  className="w-full h-16 rounded mb-2 flex items-center justify-center font-bold text-white text-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${player2Character?.color} 0%, ${player2Character?.secondaryColor} 100%)`,
                  }}
                >
                  {player2Character?.build === "robot"
                    ? "🤖"
                    : player2Character?.build === "cybernetic"
                    ? "⚡"
                    : player2Character?.gender === "female"
                    ? "👩"
                    : "👨"}
                </div>
                <p className="text-white font-bold text-sm">
                  {player2Character?.name.split("-")[0]}
                </p>
                <p className="text-gray-300 text-xs">
                  {player2Character?.style}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmAndFight}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-xl py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/50 flex items-center justify-center gap-3"
            >
              <Zap size={32} /> FIGHT! <Zap size={32} />
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* Back Button */}
      {currentCard > 1 && (
        <button
          onClick={handleBackButton}
          className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all duration-300 z-50"
        >
          <ArrowLeft size={20} /> Back
        </button>
      )}

      {/* Card Container */}
      <div className="relative w-full max-w-6xl h-screen max-h-[600px] bg-gray-900/60 backdrop-blur border-2 border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl">
        {cardContent()}

        {/* Progress Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[1, 2, 3, 3.5, 4].map((card, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                Math.floor(currentCard) >= Math.floor(card)
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 w-8"
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardFlow;
