import React, { useState, useEffect, useRef } from "react";
import { Sword, Zap, Shield, Trophy, ArrowLeft } from "lucide-react";

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

const CombatGame = () => {
  const canvasRef = useRef(null);
  const [selectedChar1, setSelectedChar1] = useState(null);
  const [selectedChar2, setSelectedChar2] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [fighter1, setFighter1] = useState(null);
  const [fighter2, setFighter2] = useState(null);
  const gameLoopRef = useRef(null);
  const keysPressed = useRef({});

  // Card flow states
  const [currentCard, setCurrentCard] = useState(1);
  const [battleMode, setBattleMode] = useState<"ai" | "player" | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [player1Character, setPlayer1Character] = useState(null);
  const [player2Character, setPlayer2Character] = useState(null);
  const [showCardFlow, setShowCardFlow] = useState(true);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "left"
  );
  const [victoryScreen, setVictoryScreen] = useState<{
    winner: string;
    character: any;
  } | null>(null);

  const characters = [
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

  class Fighter {
    constructor(x, y, character, isPlayer1) {
      this.x = x;
      this.y = y;
      this.width = 70;
      this.height = 90;
      this.character = character;
      this.isPlayer1 = isPlayer1;
      this.health = 100;
      this.maxHealth = 100;
      this.velocity = { x: 0, y: 0 };
      this.speed = 5;
      this.runSpeed = 8;
      this.jumpPower = 14;
      this.gravity = 0.6;
      this.isJumping = false;
      this.grounded = false;
      this.facing = isPlayer1 ? 1 : -1;
      this.isRunning = false;

      // Animation states
      this.state = "idle";
      this.frame = 0;
      this.frameTimer = 0;
      this.frameDelay = 6;

      // Combat
      this.attacking = false;
      this.attackTimer = 0;
      this.attackCooldown = 0;
      this.hitbox = null;
      this.currentMove = null;
      this.comboCounter = 0;
      this.stunned = false;
      this.stunnedTimer = 0;

      // Special move energy
      this.energy = 50;
      this.maxEnergy = 100;

      // Visual effects
      this.hitEffect = false;
      this.hitEffectTimer = 0;
      this.damageNumbers = [];
    }

    updateAnimation() {
      this.frameTimer++;
      if (this.frameTimer >= this.frameDelay) {
        this.frameTimer = 0;
        this.frame++;

        const maxFrames = {
          idle: 6,
          walk: 8,
          run: 6,
          jump: 3,
          punch: 5,
          kick: 6,
          uppercut: 7,
          special: 10,
          hurt: 3,
          block: 2,
        };

        if (this.frame >= maxFrames[this.state]) {
          if (this.attacking) {
            this.attacking = false;
            this.state = "idle";
            this.hitbox = null;
            this.currentMove = null;
          }
          this.frame = 0;
        }
      }
    }

    drawHealthBar(ctx) {
      const barWidth = 100;
      const barHeight = 10;
      const barX = this.x + this.width / 2 - barWidth / 2;
      const barY = this.y - 25;

      // Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

      // Health bar
      const healthPercent = this.health / this.maxHealth;
      const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);

      if (healthPercent > 0.6) {
        gradient.addColorStop(0, "#2ECC71");
        gradient.addColorStop(1, "#27AE60");
      } else if (healthPercent > 0.3) {
        gradient.addColorStop(0, "#F39C12");
        gradient.addColorStop(1, "#E67E22");
      } else {
        gradient.addColorStop(0, "#E74C3C");
        gradient.addColorStop(1, "#C0392B");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

      // Border
      ctx.strokeStyle = "#ECF0F1";
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Energy bar
      const energyY = barY + 14;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barX - 2, energyY - 2, barWidth + 4, 6);

      const energyGradient = ctx.createLinearGradient(
        barX,
        0,
        barX + barWidth,
        0
      );
      energyGradient.addColorStop(0, "#F1C40F");
      energyGradient.addColorStop(1, "#F39C12");
      ctx.fillStyle = energyGradient;
      ctx.fillRect(barX, energyY, (this.energy / this.maxEnergy) * barWidth, 4);

      ctx.strokeStyle = "#ECF0F1";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, energyY, barWidth, 4);

      // Name and health text
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        this.character.name.split("-")[0].trim(),
        barX + barWidth / 2,
        barY - 5
      );

      // Health percentage
      ctx.font = "bold 8px Arial";
      ctx.fillText(
        `${Math.ceil(this.health)}%`,
        barX + barWidth / 2,
        barY + barHeight - 2
      );
    }

    draw(ctx) {
      ctx.save();

      // Draw health bar and name
      this.drawHealthBar(ctx);

      // Hit effect flash
      if (this.hitEffect) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(
          this.x - 10,
          this.y - 10,
          this.width + 20,
          this.height + 20
        );
        ctx.globalAlpha = 1;
      }

      // Character shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(
        this.x + this.width / 2,
        this.y + this.height + 5,
        this.width / 2,
        8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Transform for facing direction
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.scale(this.facing, 1);

      // Draw based on character build type
      if (this.character.build === "robot") {
        this.drawRobot(ctx);
      } else if (this.character.build === "cybernetic") {
        this.drawCybernetic(ctx);
      } else {
        this.drawHuman(ctx);
      }

      ctx.restore();

      // Draw damage numbers
      this.damageNumbers.forEach((dmg, index) => {
        ctx.save();
        ctx.globalAlpha = dmg.alpha;
        ctx.fillStyle = dmg.critical ? "#FFD700" : "#FF3366";
        ctx.font = `bold ${dmg.critical ? 20 : 16}px Arial`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.strokeText(`-${dmg.value}`, dmg.x, dmg.y);
        ctx.fillText(`-${dmg.value}`, dmg.x, dmg.y);
        ctx.restore();

        dmg.y -= 1;
        dmg.alpha -= 0.02;
        if (dmg.alpha <= 0) {
          this.damageNumbers.splice(index, 1);
        }
      });

      // Draw hitbox for debugging (optional)
      if (this.hitbox && false) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          this.hitbox.x,
          this.hitbox.y,
          this.hitbox.width,
          this.hitbox.height
        );
      }
    }

    drawHuman(ctx) {
      const bodyColor = this.character.color;
      const secondaryColor = this.character.secondaryColor;
      const skinTone =
        this.character.gender === "female" ? "#FFD5B5" : "#C68642";

      const isFemale = this.character.gender === "female";
      const bodyWidth = isFemale ? 25 : 30;
      const bodyHeight = isFemale ? 38 : 42;

      // Animation offsets
      let headY = -40;
      let bodyY = -20;
      let armL = { x: -28, y: -12 };
      let armR = { x: 15, y: -12 };
      let legL = { x: -12, y: 20 };
      let legR = { x: 2, y: 20 };

      // State-specific poses
      if (this.state === "idle") {
        const bounce = Math.sin(this.frame * 0.3) * 2;
        headY += bounce;
        bodyY += bounce;
        armL.y += bounce;
        armR.y += bounce;
      } else if (this.state === "walk" || this.state === "run") {
        const swingAmount = this.state === "run" ? 15 : 10;
        const legSwing = Math.sin(this.frame * 0.8) * swingAmount;
        const armSwing = Math.cos(this.frame * 0.8) * (swingAmount - 2);

        armL.y += armSwing;
        armR.y -= armSwing;
        legL.x += legSwing * 0.3;
        legR.x -= legSwing * 0.3;

        bodyY += Math.abs(Math.sin(this.frame * 0.4)) * 3;
        headY += Math.abs(Math.sin(this.frame * 0.4)) * 3;
      } else if (this.state === "jump") {
        armL.y = -18;
        armR.y = -18;
        legL.y = 18;
        legR.y = 18;
        legL.x = -10;
        legR.x = 4;
      } else if (this.state === "punch") {
        const extend = Math.min(this.frame * 10, 40);
        armR.x = 15 + extend;
        armR.y = -15;
        armL.x = -22;
        armL.y = -8;
        bodyY += 2;
      } else if (this.state === "kick") {
        const extend = Math.min(this.frame * 12, 50);
        legR.x = 5 + extend;
        legR.y = 10;
        legL.x = -15;
        armL.y = -18;
        armR.y = -18;
        bodyY -= 5;
      } else if (this.state === "uppercut") {
        const rise = Math.min(this.frame * 8, 35);
        armR.x = 10;
        armR.y = -15 - rise;
        armL.x = -22;
        bodyY += 5;
        headY += 3;
      } else if (this.state === "special") {
        const spin = this.frame * 0.5;
        ctx.rotate(spin);

        armL.x = -30;
        armL.y = -15;
        armR.x = 20;
        armR.y = -15;
      }

      // Draw legs first (behind body)
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(legL.x, legL.y, 10, 25);
      ctx.fillRect(legR.x, legR.y, 10, 25);

      // Draw body
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-bodyWidth / 2, bodyY, bodyWidth, bodyHeight);

      // Draw belt/waist
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(-bodyWidth / 2, bodyY + bodyHeight - 8, bodyWidth, 8);

      // Draw arms
      ctx.fillStyle = bodyColor;
      ctx.fillRect(armL.x, armL.y, 12, 22);
      ctx.fillRect(armR.x, armR.y, 12, 22);

      // Draw hands
      ctx.fillStyle = skinTone;
      ctx.fillRect(armL.x, armL.y + 20, 12, 8);
      ctx.fillRect(armR.x, armR.y + 20, 12, 8);

      // Draw head
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0, headY, isFemale ? 13 : 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw hair
      ctx.fillStyle =
        this.character.id === 3 || this.character.id === 4
          ? "#D4A574"
          : "#2C1810";
      if (isFemale && (this.character.id === 3 || this.character.id === 9)) {
        // Ponytail
        ctx.fillRect(-8, headY - 12, 16, 8);
        ctx.beginPath();
        ctx.arc(0, headY - 8, 10, 0, Math.PI, true);
        ctx.fill();
      } else if (this.character.id === 10) {
        // Ninja mask
        ctx.fillStyle = "#000";
        ctx.fillRect(-14, headY - 5, 28, 12);
      } else {
        // Short hair
        ctx.beginPath();
        ctx.arc(0, headY - 2, isFemale ? 14 : 16, 0, Math.PI, true);
        ctx.fill();
      }

      // Draw face features
      ctx.fillStyle = "#000";
      ctx.fillRect(-6, headY - 2, 3, 3); // Left eye
      ctx.fillRect(3, headY - 2, 3, 3); // Right eye

      // Draw mouth
      if (this.attacking || this.state === "special") {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, headY + 4, 4, 0, Math.PI);
        ctx.stroke();
      }
    }

    drawRobot(ctx) {
      const primaryColor = this.character.color;
      const glowColor = this.character.secondaryColor;

      // Animation
      let bodyY = -25;
      let headY = -42;

      if (this.state === "idle") {
        const hover = Math.sin(this.frame * 0.2) * 3;
        bodyY += hover;
        headY += hover;
      }

      // Glow effect
      if (this.state === "special" || this.attacking) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20;
      }

      // Draw legs (robotic)
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-15, 18, 12, 28);
      ctx.fillRect(3, 18, 12, 28);

      // Leg joints
      ctx.fillStyle = glowColor;
      ctx.fillRect(-15, 30, 12, 4);
      ctx.fillRect(3, 30, 12, 4);

      // Draw body (chassis)
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-20, bodyY, 40, 48);

      // Chest panel
      ctx.fillStyle = glowColor;
      ctx.fillRect(-12, bodyY + 10, 24, 20);

      // Core light
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(0, bodyY + 20, 6, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-32, bodyY + 5, 12, 30);
      ctx.fillRect(20, bodyY + 5, 12, 30);

      // Arm joints
      ctx.fillStyle = glowColor;
      ctx.fillRect(-32, bodyY + 20, 12, 4);
      ctx.fillRect(20, bodyY + 20, 12, 4);

      // Draw head (helmet)
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-16, headY - 12, 32, 24);

      // Visor
      ctx.fillStyle = glowColor;
      ctx.fillRect(-14, headY - 6, 28, 10);

      // Eyes (glowing)
      ctx.fillStyle = "#FFF";
      ctx.fillRect(-10, headY - 4, 6, 6);
      ctx.fillRect(4, headY - 4, 6, 6);

      ctx.shadowBlur = 0;
    }

    drawCybernetic(ctx) {
      const bodyColor = "#C68642";
      const cyberColor = this.character.secondaryColor;

      let armRY = -15;
      if (this.state === "punch") {
        armRY = -15 - this.frame * 3;
      }

      // Lightning effect for special
      if (this.state === "special") {
        ctx.strokeStyle = "#00D9FF";
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * 40 - 20, -40);
          ctx.lineTo(Math.random() * 40 - 20, 40);
          ctx.stroke();
        }
      }

      // Body
      ctx.fillStyle = this.character.color;
      ctx.fillRect(-18, -22, 36, 45);

      // Legs
      ctx.fillStyle = cyberColor;
      ctx.fillRect(-14, 23, 12, 24);
      ctx.fillRect(2, 23, 12, 24);

      // Normal arm
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-30, -15, 12, 25);
      ctx.fillRect(-30, 8, 12, 8);

      // Cybernetic arm
      ctx.fillStyle = cyberColor;
      ctx.fillRect(18, armRY, 14, 28);

      // Cyber arm details
      ctx.strokeStyle = "#00D9FF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, armRY + 10);
      ctx.lineTo(30, armRY + 10);
      ctx.stroke();

      // Head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, -38, 14, 0, Math.PI * 2);
      ctx.fill();

      // Cyber eye
      ctx.fillStyle = "#00D9FF";
      ctx.fillRect(2, -40, 6, 4);
      ctx.fillStyle = "#000";
      ctx.fillRect(-8, -40, 4, 4);
    }

    update(groundLevel, opponent) {
      this.updateAnimation();

      // Update timers
      if (this.attackCooldown > 0) this.attackCooldown--;
      if (this.stunnedTimer > 0) {
        this.stunnedTimer--;
        if (this.stunnedTimer === 0) this.stunned = false;
      }
      if (this.hitEffectTimer > 0) {
        this.hitEffectTimer--;
        if (this.hitEffectTimer === 0) this.hitEffect = false;
      }

      // Apply gravity
      if (!this.grounded) {
        this.velocity.y += this.gravity;
      }

      // Update position
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // Ground collision
      if (this.y + this.height >= groundLevel) {
        this.y = groundLevel - this.height;
        this.velocity.y = 0;
        this.grounded = true;
        this.isJumping = false;
        if (this.state === "jump") this.state = "idle";
      } else {
        this.grounded = false;
      }

      // Boundary checks
      if (this.x < 20) this.x = 20;
      if (this.x + this.width > 780) this.x = 780 - this.width;

      // Update facing direction toward opponent
      if (opponent && !this.attacking) {
        this.facing = this.x < opponent.x ? 1 : -1;
      }

      // Check for hit
      if (this.hitbox && opponent && !this.hitRegistered) {
        if (this.checkCollision(this.hitbox, opponent)) {
          let damage = 0;
          let isCritical = false;

          switch (this.currentMove) {
            case "special":
              damage = 25;
              isCritical = true;
              break;
            case "uppercut":
              damage = 15;
              isCritical = Math.random() > 0.7;
              break;
            case "kick":
              damage = 12;
              break;
            case "punch":
              damage = 8;
              break;
          }

          opponent.takeDamage(damage, isCritical);
          this.energy = Math.min(100, this.energy + 8);
          this.hitRegistered = true;
          this.comboCounter++;

          // Knockback
          const knockbackForce = isCritical ? 8 : 5;
          opponent.velocity.x = this.facing * knockbackForce;
          opponent.velocity.y = -4;

          // Stun on critical
          if (isCritical) {
            opponent.stunned = true;
            opponent.stunnedTimer = 20;
          }
        }
      }
    }

    takeDamage(amount, isCritical) {
      this.health = Math.max(0, this.health - amount);
      this.hitEffect = true;
      this.hitEffectTimer = 8;

      // Add damage number
      this.damageNumbers.push({
        value: Math.ceil(amount),
        x: this.x + this.width / 2,
        y: this.y,
        alpha: 1,
        critical: isCritical,
      });

      // Flash effect
      if (this.state !== "special" && this.state !== "jump") {
        this.state = "hurt";
        this.frame = 0;
      }
    }

    checkCollision(rect1, fighter) {
      return (
        rect1.x < fighter.x + fighter.width &&
        rect1.x + rect1.width > fighter.x &&
        rect1.y < fighter.y + fighter.height &&
        rect1.y + rect1.height > fighter.y
      );
    }

    move(direction, running = false) {
      if (this.attacking || this.stunned) return;

      this.isRunning = running;
      const moveSpeed = running ? this.runSpeed : this.speed;
      this.velocity.x = direction * moveSpeed;

      if (this.grounded && direction !== 0) {
        this.state = running ? "run" : "walk";
      } else if (this.grounded && direction === 0) {
        this.state = "idle";
      }
    }

    jump() {
      if (this.grounded && !this.attacking && !this.stunned) {
        this.velocity.y = -this.jumpPower;
        this.isJumping = true;
        this.grounded = false;
        this.state = "jump";
      }
    }

    attack(type) {
      if (this.attacking || this.attackCooldown > 0 || this.stunned) return;

      if (type === "special" && this.energy < 100) return;

      this.attacking = true;
      this.attackCooldown =
        type === "special" ? 50 : type === "uppercut" ? 35 : 25;
      this.frame = 0;
      this.frameTimer = 0;
      this.state = type;
      this.currentMove = type;
      this.velocity.x = 0;
      this.hitRegistered = false;

      if (type === "special") {
        this.energy = 0;
      }

      // Create hitbox after animation starts
      setTimeout(() => {
        let hitboxWidth = 50;
        let hitboxHeight = 30;
        let offsetX = 0;
        let offsetY = this.height / 3;

        switch (type) {
          case "special":
            hitboxWidth = 120;
            hitboxHeight = 80;
            offsetX = this.facing > 0 ? this.width : -hitboxWidth;
            offsetY = 0;
            break;
          case "kick":
            hitboxWidth = 75;
            hitboxHeight = 25;
            offsetX = this.facing > 0 ? this.width : -hitboxWidth;
            offsetY = this.height / 2;
            break;
          case "uppercut":
            hitboxWidth = 50;
            hitboxHeight = 60;
            offsetX = this.facing > 0 ? this.width - 20 : -hitboxWidth + 20;
            offsetY = -20;
            break;
          default: // punch
            hitboxWidth = 55;
            offsetX = this.facing > 0 ? this.width : -hitboxWidth;
            break;
        }

        this.hitbox = {
          x: this.x + offsetX,
          y: this.y + offsetY,
          width: hitboxWidth,
          height: hitboxHeight,
        };
      }, 150);
    }

    stop() {
      if (!this.attacking && !this.stunned) {
        this.velocity.x = 0;
        if (this.grounded) this.state = "idle";
      }
    }
  }

  // Arena drawing function
  const drawArena = (ctx, width, height, groundLevel) => {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
    skyGradient.addColorStop(0, "#0F2027");
    skyGradient.addColorStop(0.5, "#203A43");
    skyGradient.addColorStop(1, "#2C5364");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, groundLevel);

    // Background structures (colosseum style)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

    // Left pillars
    for (let i = 0; i < 3; i++) {
      const x = 50 + i * 60;
      ctx.fillStyle = "#34495E";
      ctx.fillRect(x, groundLevel - 180, 30, 180);
      ctx.fillStyle = "#2C3E50";
      ctx.fillRect(x, groundLevel - 180, 30, 20);
      ctx.fillRect(x, groundLevel - 40, 30, 20);
    }

    // Right pillars
    for (let i = 0; i < 3; i++) {
      const x = 620 + i * 60;
      ctx.fillStyle = "#34495E";
      ctx.fillRect(x, groundLevel - 180, 30, 180);
      ctx.fillStyle = "#2C3E50";
      ctx.fillRect(x, groundLevel - 180, 30, 20);
      ctx.fillRect(x, groundLevel - 40, 30, 20);
    }

    // Distant archways
    ctx.fillStyle = "rgba(52, 73, 94, 0.4)";
    for (let i = 0; i < 5; i++) {
      const x = 150 + i * 110;
      ctx.beginPath();
      ctx.arc(x, groundLevel - 50, 30, Math.PI, 0, true);
      ctx.fill();
    }

    // Ground
    const groundGradient = ctx.createLinearGradient(0, groundLevel, 0, height);
    groundGradient.addColorStop(0, "#5D4E37");
    groundGradient.addColorStop(1, "#3E2723");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundLevel, width, height - groundLevel);

    // Arena floor pattern
    ctx.strokeStyle = "rgba(139, 69, 19, 0.3)";
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, groundLevel);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Center circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, groundLevel + 30, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Center line
    ctx.setLineDash([15, 15]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, groundLevel);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Torch lights effect
    const torchGradient1 = ctx.createRadialGradient(
      100,
      groundLevel - 150,
      0,
      100,
      groundLevel - 150,
      100
    );
    torchGradient1.addColorStop(0, "rgba(255, 140, 0, 0.3)");
    torchGradient1.addColorStop(1, "rgba(255, 140, 0, 0)");
    ctx.fillStyle = torchGradient1;
    ctx.fillRect(0, groundLevel - 250, 200, 250);

    const torchGradient2 = ctx.createRadialGradient(
      700,
      groundLevel - 150,
      0,
      700,
      groundLevel - 150,
      100
    );
    torchGradient2.addColorStop(0, "rgba(255, 140, 0, 0.3)");
    torchGradient2.addColorStop(1, "rgba(255, 140, 0, 0)");
    ctx.fillStyle = torchGradient2;
    ctx.fillRect(600, groundLevel - 250, 200, 250);
  };

  useEffect(() => {
    if (!gameStarted || !fighter1 || !fighter2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const groundLevel = 480;

    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = () => {
      // Draw arena background
      drawArena(ctx, 800, 600, groundLevel);

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
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, 800, 600);

        // Winner announcement
        const winner =
          fighter1.health > 0
            ? fighter1.character.name
            : fighter2.character.name;
        const winnerColor =
          fighter1.health > 0
            ? fighter1.character.color
            : fighter2.character.color;

        ctx.fillStyle = winnerColor;
        ctx.font = "bold 64px Arial";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 8;
        ctx.strokeText("VICTORY!", 400, 250);
        ctx.fillText("VICTORY!", 400, 250);

        ctx.fillStyle = "#FFF";
        ctx.font = "bold 36px Arial";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 6;
        ctx.strokeText(winner, 400, 310);
        ctx.fillText(winner, 400, 310);

        ctx.font = "24px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.strokeText("Press R to Restart", 400, 380);
        ctx.fillText("Press R to Restart", 400, 380);

        // Trophy icon
        ctx.save();
        ctx.translate(400, 420);
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-15, 10);
        ctx.lineTo(15, 10);
        ctx.lineTo(15, 0);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-10, 10, 20, 15);
        ctx.fillRect(-15, 25, 30, 5);
        ctx.restore();

        if (keysPressed.current["r"]) {
          setGameStarted(false);
          setSelectedChar1(null);
          setSelectedChar2(null);
          setFighter1(null);
          setFighter2(null);
        }
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
  }, [gameStarted, fighter1, fighter2]);

  const startGame = () => {
    if (selectedChar1 && selectedChar2) {
      const char1 = characters.find((c) => c.id === selectedChar1);
      const char2 = characters.find((c) => c.id === selectedChar2);

      setFighter1(new Fighter(100, 300, char1, true));
      setFighter2(new Fighter(650, 300, char2, false));
      setGameStarted(true);
    }
  };

  if (!gameStarted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-2">
            COMBAT ARENA
          </h1>
          <p className="text-gray-300 text-lg">Choose Your Champions</p>
        </div>

        <div className="flex gap-8 w-full max-w-7xl">
          {/* Player 1 Selection */}
          <div className="flex-1 bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl p-6 border-4 border-blue-500 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-blue-300 flex items-center gap-2">
                <Shield size={32} /> PLAYER 1
              </h2>
              {selectedChar1 && (
                <div className="text-green-400 font-bold">✓ READY</div>
              )}
            </div>
            <div className="bg-black bg-opacity-30 rounded p-3 mb-4">
              <p className="text-blue-200 text-sm font-semibold mb-1">
                CONTROLS:
              </p>
              <p className="text-gray-300 text-xs">WASD - Move | Shift - Run</p>
              <p className="text-gray-300 text-xs">
                F - Punch | G - Kick | T - Uppercut | H - Special
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar1(char.id)}
                  disabled={selectedChar2 === char.id}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    selectedChar1 === char.id
                      ? "bg-blue-600 shadow-lg shadow-blue-500/50 scale-105 ring-4 ring-blue-300"
                      : selectedChar2 === char.id
                      ? "bg-gray-800 opacity-50 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-700 hover:scale-105"
                  }`}
                >
                  <div
                    className="w-full h-24 rounded mb-2 flex items-center justify-center font-bold text-white text-lg shadow-inner"
                    style={{
                      backgroundColor: char.color,
                      backgroundImage: `linear-gradient(135deg, ${char.color} 0%, ${char.secondaryColor} 100%)`,
                    }}
                  >
                    {char.build === "robot"
                      ? "🤖"
                      : char.build === "cybernetic"
                      ? "⚡"
                      : char.gender === "female"
                      ? "👩‍🦰"
                      : "👨‍🦱"}
                  </div>
                  <p className="text-white font-bold text-sm mb-1">
                    {char.name.split("-")[0]}
                  </p>
                  <p className="text-gray-400 text-xs">{char.style}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {char.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
              <span className="text-4xl font-bold text-white">VS</span>
            </div>
          </div>

          {/* Player 2 Selection */}
          <div className="flex-1 bg-gradient-to-br from-red-900 to-red-950 rounded-xl p-6 border-4 border-red-500 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-red-300 flex items-center gap-2">
                <Sword size={32} /> PLAYER 2
              </h2>
              {selectedChar2 && (
                <div className="text-green-400 font-bold">✓ READY</div>
              )}
            </div>
            <div className="bg-black bg-opacity-30 rounded p-3 mb-4">
              <p className="text-red-200 text-sm font-semibold mb-1">
                CONTROLS:
              </p>
              <p className="text-gray-300 text-xs">
                Arrows - Move | Enter - Run
              </p>
              <p className="text-gray-300 text-xs">
                J - Punch | K - Kick | U - Uppercut | L - Special
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar2(char.id)}
                  disabled={selectedChar1 === char.id}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    selectedChar2 === char.id
                      ? "bg-red-600 shadow-lg shadow-red-500/50 scale-105 ring-4 ring-red-300"
                      : selectedChar1 === char.id
                      ? "bg-gray-800 opacity-50 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-700 hover:scale-105"
                  }`}
                >
                  <div
                    className="w-full h-24 rounded mb-2 flex items-center justify-center font-bold text-white text-lg shadow-inner"
                    style={{
                      backgroundColor: char.color,
                      backgroundImage: `linear-gradient(135deg, ${char.color} 0%, ${char.secondaryColor} 100%)`,
                    }}
                  >
                    {char.build === "robot"
                      ? "🤖"
                      : char.build === "cybernetic"
                      ? "⚡"
                      : char.gender === "female"
                      ? "👩‍🦰"
                      : "👨‍🦱"}
                  </div>
                  <p className="text-white font-bold text-sm mb-1">
                    {char.name.split("-")[0]}
                  </p>
                  <p className="text-gray-400 text-xs">{char.style}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {char.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={!selectedChar1 || !selectedChar2}
          className={`mt-8 px-16 py-5 rounded-xl text-2xl font-bold flex items-center gap-4 transition-all duration-300 ${
            selectedChar1 && selectedChar2
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-2xl shadow-purple-500/50 hover:scale-110 animate-pulse"
              : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
          }`}
        >
          <Zap size={32} /> START BATTLE <Zap size={32} />
        </button>

        <div className="mt-8 text-gray-400 text-sm text-center">
          <p>
            💡 Tip: Build your energy bar with successful hits to unleash
            devastating special moves!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="mb-3 bg-black bg-opacity-60 rounded-lg px-6 py-3 text-white">
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-blue-400 font-bold">P1:</span> WASD +
            Shift(Run) | F(Punch) G(Kick) T(Uppercut) H(Special)
          </div>
          <div>
            <span className="text-red-400 font-bold">P2:</span> Arrows +
            Enter(Run) | J(Punch) K(Kick) U(Uppercut) L(Special)
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-8 border-yellow-600 rounded-xl shadow-2xl shadow-yellow-600/30"
      />
      <div className="mt-3 text-gray-400 text-xs">
        Press ESC to pause • Energy bar fills with successful hits • Special
        moves require full energy
      </div>
    </div>
  );
};

export default CombatGame;
