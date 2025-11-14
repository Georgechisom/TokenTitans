import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, ArrowLeft } from "lucide-react";

const Leaderboard = () => {
  const navigate = useNavigate();

  // Mock leaderboard data - in production from Supabase
  const leaderboardData = Array.from({ length: 50 }, (_, i) => ({
    rank: i + 1,
    wallet: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
    wins: Math.floor(Math.random() * 50) + 10,
    nfts: Math.floor(Math.random() * 40) + 5,
    winRate: `${Math.floor(Math.random() * 40 + 40)}%`
  })).sort((a, b) => b.wins - a.wins);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-neon">
            Global Leaderboard
          </h1>
          <div className="w-20" />
        </div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
        >
          {/* 2nd Place */}
          <div className="order-1">
            <Card className="glass p-6 text-center border-muted-foreground/50">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <span className="text-3xl">🥈</span>
              </div>
              <div className="text-2xl font-bold mb-1">2nd</div>
              <div className="font-mono text-sm mb-2">{leaderboardData[1]?.wallet}</div>
              <div className="text-lg font-bold text-muted-foreground">{leaderboardData[1]?.wins} wins</div>
            </Card>
          </div>

          {/* 1st Place */}
          <div className="order-2">
            <Card className="glass p-8 text-center border-2 border-gold shadow-[0_0_30px_hsl(var(--gold)/0.3)]">
              <Trophy className="w-20 h-20 mx-auto mb-3 text-gold" />
              <div className="text-3xl font-bold mb-1 text-gold">1st</div>
              <div className="font-mono text-sm mb-2">{leaderboardData[0]?.wallet}</div>
              <div className="text-2xl font-bold text-gold">{leaderboardData[0]?.wins} wins</div>
              <Medal className="w-6 h-6 mx-auto mt-3 text-gold" />
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="order-3">
            <Card className="glass p-6 text-center border-accent/50">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-3xl">🥉</span>
              </div>
              <div className="text-2xl font-bold mb-1">3rd</div>
              <div className="font-mono text-sm mb-2">{leaderboardData[2]?.wallet}</div>
              <div className="text-lg font-bold text-accent">{leaderboardData[2]?.wins} wins</div>
            </Card>
          </div>
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold text-neon-purple">All Rankings</h2>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/30 text-sm font-bold text-muted-foreground">
              <div className="col-span-2">Rank</div>
              <div className="col-span-4">Wallet</div>
              <div className="col-span-2">Wins</div>
              <div className="col-span-2">NFTs</div>
              <div className="col-span-2">Win Rate</div>
            </div>

            {/* Table Body */}
            <div className="max-h-[600px] overflow-y-auto">
              {leaderboardData.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`grid grid-cols-12 gap-4 p-4 border-b border-border/10 hover:bg-muted/30 transition-colors ${
                    player.rank <= 3 ? "bg-muted/20" : ""
                  }`}
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      player.rank === 1 ? "bg-gold text-background" :
                      player.rank === 2 ? "bg-muted-foreground text-background" :
                      player.rank === 3 ? "bg-accent text-background" :
                      "bg-muted text-foreground"
                    }`}>
                      {player.rank}
                    </div>
                  </div>
                  <div className="col-span-4 font-mono text-sm flex items-center">
                    {player.wallet}
                  </div>
                  <div className="col-span-2 font-bold text-primary flex items-center">
                    {player.wins}
                  </div>
                  <div className="col-span-2 font-bold text-secondary flex items-center">
                    {player.nfts}
                  </div>
                  <div className="col-span-2 text-muted-foreground flex items-center">
                    {player.winRate}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Think you can climb the ranks?
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/game")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--neon-cyan)/0.5)]"
          >
            Challenge the Champions
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;