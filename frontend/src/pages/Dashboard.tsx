import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Swords, Medal, ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - in production, this would come from Supabase/blockchain
  const mockStats = {
    totalWins: 12,
    totalGames: 25,
    nftsEarned: 8,
    winRate: "48%",
    favoriteCharacter: "Young Male Muay Thai"
  };

  const mockLeaderboard = [
    { rank: 1, wallet: "0x1234...5678", wins: 45, nfts: 35 },
    { rank: 2, wallet: "0x8765...4321", wins: 38, nfts: 28 },
    { rank: 3, wallet: "0xabcd...ef12", wins: 32, nfts: 25 },
    { rank: 4, wallet: "0x9876...1234", wins: 28, nfts: 22 },
    { rank: 5, wallet: "0x5432...9876", wins: 25, nfts: 20 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2" />
            Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-neon">
            Battle Dashboard
          </h1>
          <div className="w-20" />
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="glass p-6">
            <Trophy className="w-10 h-10 text-primary mb-3" />
            <div className="text-3xl font-bold text-primary mb-1">
              {mockStats.totalWins}
            </div>
            <div className="text-sm text-muted-foreground">Total Wins</div>
          </Card>

          <Card className="glass p-6">
            <Swords className="w-10 h-10 text-secondary mb-3" />
            <div className="text-3xl font-bold text-secondary mb-1">
              {mockStats.totalGames}
            </div>
            <div className="text-sm text-muted-foreground">Battles Fought</div>
          </Card>

          <Card className="glass p-6">
            <Medal className="w-10 h-10 text-accent mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">
              {mockStats.nftsEarned}
            </div>
            <div className="text-sm text-muted-foreground">NFTs Earned</div>
          </Card>

          <Card className="glass p-6">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {mockStats.winRate}
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass p-6">
              <h2 className="text-2xl font-bold mb-6 text-neon-purple">
                Global Leaderboard
              </h2>
              <div className="space-y-3">
                {mockLeaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        player.rank === 1 ? "bg-gold text-background" :
                        player.rank === 2 ? "bg-muted-foreground text-background" :
                        player.rank === 3 ? "bg-accent/50 text-background" :
                        "bg-muted text-foreground"
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-mono text-sm">{player.wallet}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.wins} wins • {player.nfts} NFTs
                        </div>
                      </div>
                    </div>
                    <Trophy className={`w-5 h-5 ${
                      player.rank === 1 ? "text-gold" :
                      player.rank === 2 ? "text-muted-foreground" :
                      player.rank === 3 ? "text-accent" :
                      "text-muted-foreground/50"
                    }`} />
                  </div>
                ))}
              </div>
              <Button
                className="w-full mt-6"
                variant="outline"
                onClick={() => navigate("/leaderboard")}
              >
                View Full Leaderboard
              </Button>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* New Battle */}
            <Card className="glass p-6">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <Button
                size="lg"
                className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--neon-cyan)/0.5)]"
                onClick={() => navigate("/game")}
              >
                <Swords className="mr-2" />
                Start New Battle
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://testnets.opensea.io", "_blank")}
              >
                View My NFTs
              </Button>
            </Card>

            {/* Profile Stats */}
            <Card className="glass p-6">
              <h2 className="text-xl font-bold mb-4">Profile Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Favorite Fighter</div>
                  <div className="font-bold text-foreground">{mockStats.favoriteCharacter}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Recent Performance</div>
                  <div className="flex gap-1">
                    {[1, 1, 0, 1, 0, 1, 1, 1].map((result, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                          result ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                        }`}
                      >
                        {result ? "W" : "L"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="glass p-6 border-primary/30">
              <h3 className="font-bold mb-2 text-primary">💡 Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Use defend strategically to block incoming attacks! Time your special moves when opponents have ≤20 HP for maximum impact.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;