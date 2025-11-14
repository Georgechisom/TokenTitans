import { motion } from "framer-motion";
import { Swords, Trophy, Zap, Shield, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Swords,
      title: "Epic PvP & AI Battles",
      description: "Face opponents in strategic turn-based combat with realistic damage mechanics"
    },
    {
      icon: Trophy,
      title: "Earn Battle NFTs",
      description: "Mint exclusive victory NFTs on Ethereum - proof of your dominance"
    },
    {
      icon: Zap,
      title: "Special Finishing Moves",
      description: "Unleash devastating 40-damage specials when opponents are vulnerable"
    },
    {
      icon: Shield,
      title: "Strategic Defense",
      description: "Block incoming attacks and turn the tide of battle in your favor"
    },
    {
      icon: Users,
      title: "Global Leaderboard",
      description: "Compete for the top spot and earn bragging rights worldwide"
    },
    {
      icon: Sparkles,
      title: "10 Unique Fighters",
      description: "Choose from diverse combat specialists, each with unique stats and styles"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: "radial-gradient(circle at center, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-neon leading-tight">
              TOKEN<span className="text-neon-purple">TITANS</span>
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-foreground/90 font-semibold">
              Enter the Arena
            </p>
            <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto">
              Fight. Win. Own Your Glory. The most intense turn-based battle arena on blockchain.
            </p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--neon-cyan)/0.5)] hover:shadow-[0_0_30px_hsl(var(--neon-cyan)/0.8)] transition-all"
                onClick={() => navigate('/game')}
              >
                <Swords className="mr-2" />
                Enter Arena
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-primary/50 hover:bg-primary/10"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="mr-2" />
                View Leaderboard
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { label: "Total Battles", value: "10,000+", color: "neon-cyan" },
              { label: "NFTs Minted", value: "5,000+", color: "neon-purple" },
              { label: "Active Players", value: "1,500+", color: "blood-red" }
            ].map((stat, i) => (
              <Card key={i} className="glass p-6 border-border/50">
                <div className={`text-3xl font-bold text-${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="relative z-10 py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neon">
              How to Play
            </h2>
            <p className="text-xl text-muted-foreground">
              Master the arena in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your Web3 wallet to enter the arena" },
              { step: "02", title: "Choose Fighter", desc: "Select from 10 unique combat specialists and arena theme" },
              { step: "03", title: "Battle", desc: "Attack, defend, or unleash special moves to defeat opponents" },
              { step: "04", title: "Claim NFT", desc: "Win battles to mint exclusive victory NFTs" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass p-6 h-full border-border/50 hover:border-primary/50 transition-colors">
                  <div className="text-6xl font-bold text-primary/20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neon-purple">
              Battle Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Next-generation combat mechanics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass p-6 h-full border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-2xl text-center max-w-4xl mx-auto border-2 border-primary/30"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neon">
              Ready for Battle?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of fighters in the ultimate blockchain battle arena. Connect your wallet and prove your worth.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(var(--neon-cyan)/0.5)] hover:shadow-[0_0_40px_hsl(var(--neon-cyan)/0.8)] transition-all"
              onClick={() => navigate('/game')}
            >
              <Swords className="mr-2" />
              Start Fighting Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 TokenTitans. All rights reserved. Built on Ethereum.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;