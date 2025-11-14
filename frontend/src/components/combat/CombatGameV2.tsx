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

const CombatGameV2 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<
    "selection" | "fighting" | "victory"
  >("selection");
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

  class Fighter {
    constructor(
      x: number,
      y: number,
      character: Character,
      isPlayer1: boolean
    ) {
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

      // Tracking for hit registration
      this.hitRegistered = false;
    }

    updateAnimation() {
      this.frameTimer++;
      if (this.frameTimer >= this.frameDelay) {
        this.frameTimer = 0;
        this.frame++;

        const maxFrames: { [key: string]: number } = {
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

        if (this.frame >= (maxFrames[this.state] || 6)) {
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

    drawHealthBar(ctx: CanvasRenderingContext2D) {
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

    draw(ctx: CanvasRenderingContext2D) {
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
      this.damageNumbers.forEach((dmg: any, index: number) => {
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
    }

    drawHuman(ctx: CanvasRenderingContext2D) {
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
      const armL = { x: -28, y: -12 };
      const armR = { x: 15, y: -12 };
      const legL = { x: -12, y: 20 };
      const legR = { x: 2, y: 20 };

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

    drawRobot(ctx: CanvasRenderingContext2D) {
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

    drawCybernetic(ctx: CanvasRenderingContext2D) {
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

    update(groundLevel: number, opponent: any) {
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

    takeDamage(amount: number, isCritical: boolean) {
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

    checkCollision(rect1: any, fighter: any) {
      return (
        rect1.x < fighter.x + fighter.width &&
        rect1.x + rect1.width > fighter.x &&
        rect1.y < fighter.y + fighter.height &&
        rect1.y + rect1.height > fighter.y
      );
    }

    move(direction: number, running = false) {
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

    attack(type: string) {
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

  // AI Decision System
  const getAIControls = (fighter: any, opponent: any) => {
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

    // Decision making
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
      // Too close
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

  const handleGameStart = (config: any) => {
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

    const canvas = canvasRef.current as HTMLCanvasElement;
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

export default CombatGameV2;
