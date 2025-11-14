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

interface Velocity {
  x: number;
  y: number;
}

interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DamageNumber {
  value: number;
  x: number;
  y: number;
  alpha: number;
  critical: boolean;
}

export class Fighter {
  x: number;
  y: number;
  width: number;
  height: number;
  character: Character;
  isPlayer1: boolean;
  health: number;
  maxHealth: number;
  velocity: Velocity;
  speed: number;
  runSpeed: number;
  jumpPower: number;
  gravity: number;
  isJumping: boolean;
  grounded: boolean;
  facing: number;
  isRunning: boolean;
  state: string;
  frame: number;
  frameTimer: number;
  frameDelay: number;
  attacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  hitbox: Hitbox | null;
  currentMove: string | null;
  comboCounter: number;
  stunned: boolean;
  stunnedTimer: number;
  energy: number;
  maxEnergy: number;
  hitEffect: boolean;
  hitEffectTimer: number;
  damageNumbers: DamageNumber[];
  hitRegistered: boolean;

  constructor(x: number, y: number, character: Character, isPlayer1: boolean) {
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
      ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
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
    this.damageNumbers.forEach((dmg: DamageNumber, index: number) => {
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
    const skinTone = this.character.gender === "female" ? "#FFD5B5" : "#C68642";

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

  update(groundLevel: number, opponent: Fighter) {
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

  checkCollision(rect1: Hitbox, fighter: Fighter): boolean {
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
