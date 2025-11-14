// Arena theme data and rendering functions

export interface Theme {
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

export const THEMES: Theme[] = [
  {
    id: "wrestling-ring",
    name: "Floodlit Wrestling Ring",
    image: "/themes/Floodlit_Wrestling_Ring.jpg",
    description: "Classic arena with ropes and spotlights",
    colors: {
      primary: "#FFB700",
      secondary: "#333333",
      accent: "#FFFFFF",
    },
  },
  {
    id: "forest",
    name: "Misty Forest Clearing",
    image: "/themes/Misty_Forest_Clearing.jpeg",
    description: "Ancient trees shrouded in fog",
    colors: {
      primary: "#2D5016",
      secondary: "#1A2F0F",
      accent: "#8B9A7F",
    },
  },
  {
    id: "warehouse",
    name: "Derelict Warehouse",
    image: "/themes/Derelict_Warehouse.jpeg",
    description: "Industrial ruins with rusted beams",
    colors: {
      primary: "#8B4513",
      secondary: "#3C3C3C",
      accent: "#FF6B35",
    },
  },
  {
    id: "cyberpunk",
    name: "Rainy Cyberpunk Alley",
    image: "/themes/Rainy_Cyberpunk_Alley.jpeg",
    description: "Neon-lit streets in endless rain",
    colors: {
      primary: "#00D9FF",
      secondary: "#0A0E27",
      accent: "#FF006E",
    },
  },
  {
    id: "colosseum",
    name: "Crumbling Roman Colosseum",
    image: "/themes/Crumbling_Roman_Colosseum.jpg",
    description: "Ancient battleground of legends",
    colors: {
      primary: "#8B7355",
      secondary: "#2C1810",
      accent: "#D4A574",
    },
  },
];

export const drawArenaThemed = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundLevel: number,
  themeId: string
) => {
  const theme = THEMES.find((t) => t.id === themeId);

  switch (themeId) {
    case "cyberpunk":
      drawCyberpunkArena(ctx, width, height, groundLevel, theme!.colors);
      break;
    case "forest":
      drawForestArena(ctx, width, height, groundLevel, theme!.colors);
      break;
    case "warehouse":
      drawWarehouseArena(ctx, width, height, groundLevel, theme!.colors);
      break;
    case "wrestling-ring":
      drawWrestlingRingArena(ctx, width, height, groundLevel, theme!.colors);
      break;
    case "colosseum":
    default:
      drawColosseum(ctx, width, height, groundLevel, theme!.colors);
  }
};

const drawColosseum = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundLevel: number,
  colors: { primary: string; secondary: string; accent: string }
) => {
  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
  skyGradient.addColorStop(0, "#0F2027");
  skyGradient.addColorStop(0.5, "#203A43");
  skyGradient.addColorStop(1, "#2C5364");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, groundLevel);

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

  // Torch lights
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

const drawCyberpunkArena = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundLevel: number,
  colors: { primary: string; secondary: string; accent: string }
) => {
  // Dark sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
  skyGradient.addColorStop(0, "#0A0E27");
  skyGradient.addColorStop(0.5, "#1A1533");
  skyGradient.addColorStop(1, "#2D1B4E");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, groundLevel);

  // Neon buildings
  const buildingColors = ["#FF006E", "#00D9FF", "#FFBE0B", "#8338EC"];
  for (let i = 0; i < 4; i++) {
    const x = i * (width / 4);
    const height = 80 + Math.random() * 60;
    ctx.fillStyle = buildingColors[i];
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x, groundLevel - height, width / 4, height);
    ctx.globalAlpha = 1;

    // Neon outline
    ctx.strokeStyle = buildingColors[i];
    ctx.lineWidth = 3;
    ctx.strokeRect(x, groundLevel - height, width / 4, height);
  }

  // Rain effect
  ctx.strokeStyle = "rgba(0, 217, 255, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * groundLevel;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 2, y + 10);
    ctx.stroke();
  }

  // Ground with neon glow
  const groundGradient = ctx.createLinearGradient(0, groundLevel, 0, height);
  groundGradient.addColorStop(0, "#1a0f2e");
  groundGradient.addColorStop(1, "#0a0e27");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundLevel, width, height - groundLevel);

  // Neon floor grid
  ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
  ctx.lineWidth = 2;
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, groundLevel);
    ctx.lineTo(i, height);
    ctx.stroke();
  }

  // Center neon circle
  ctx.strokeStyle = "rgba(255, 0, 110, 0.5)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(width / 2, groundLevel + 30, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Glow effect
  ctx.shadowColor = "#FF006E";
  ctx.shadowBlur = 20;
  ctx.strokeStyle = "rgba(255, 0, 110, 0.3)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(width / 2, groundLevel + 30, 80, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawForestArena = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundLevel: number,
  colors: { primary: string; secondary: string; accent: string }
) => {
  // Sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
  skyGradient.addColorStop(0, "#87CEEB");
  skyGradient.addColorStop(0.5, "#6BA3C9");
  skyGradient.addColorStop(1, "#556B8D");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, groundLevel);

  // Fog
  ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
  ctx.fillRect(0, groundLevel - 100, width, 100);

  // Trees
  const treePositions = [50, 150, 300, 500, 650, 750];
  treePositions.forEach((x) => {
    // Trunk
    ctx.fillStyle = "#5C4033";
    ctx.fillRect(x - 20, groundLevel - 150, 40, 150);

    // Foliage
    ctx.fillStyle = "#2D5016";
    ctx.beginPath();
    ctx.arc(x, groundLevel - 140, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1A2F0F";
    ctx.beginPath();
    ctx.arc(x - 30, groundLevel - 120, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 30, groundLevel - 120, 50, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ground
  const groundGradient = ctx.createLinearGradient(0, groundLevel, 0, height);
  groundGradient.addColorStop(0, "#3D5817");
  groundGradient.addColorStop(1, "#2C3910");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundLevel, width, height - groundLevel);

  // Grass pattern
  ctx.strokeStyle = "rgba(155, 200, 100, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = groundLevel + Math.random() * 30;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 5, y - 10);
    ctx.stroke();
  }

  // Center circle
  ctx.strokeStyle = "rgba(200, 200, 100, 0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width / 2, groundLevel + 30, 80, 0, Math.PI * 2);
  ctx.stroke();
};

const drawWarehouseArena = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundLevel: number,
  colors: { primary: string; secondary: string; accent: string }
) => {
  // Dark sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
  skyGradient.addColorStop(0, "#3C3C3C");
  skyGradient.addColorStop(0.5, "#2A2A2A");
  skyGradient.addColorStop(1, "#1A1A1A");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, groundLevel);

  // Metal beams
  ctx.fillStyle = "#555555";
  ctx.fillRect(0, groundLevel - 80, 100, 80);
  ctx.fillRect(width - 100, groundLevel - 80, 100, 80);
  ctx.fillRect(0, groundLevel - 150, width, 20);

  // Rust effects
  ctx.fillStyle = "rgba(255, 140, 0, 0.3)";
  ctx.fillRect(10, groundLevel - 70, 80, 70);
  ctx.fillRect(width - 90, groundLevel - 70, 80, 70);

  // Rusted metal floor
  const groundGradient = ctx.createLinearGradient(0, groundLevel, 0, height);
  groundGradient.addColorStop(0, "#4A4A4A");
  groundGradient.addColorStop(1, "#2A2A2A");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundLevel, width, height - groundLevel);

  // Metal plates
  ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
  ctx.lineWidth = 3;
  for (let i = 0; i < width; i += 80) {
    for (let j = 0; j < height - groundLevel; j += 60) {
      ctx.strokeRect(i, groundLevel + j, 80, 60);
    }
  }

  // Spotlight glow
  const spotlightGradient = ctx.createRadialGradient(100, 50, 0, 100, 50, 150);
  spotlightGradient.addColorStop(0, "rgba(255, 200, 0, 0.3)");
  spotlightGradient.addColorStop(1, "rgba(255, 200, 0, 0)");
  ctx.fillStyle = spotlightGradient;
  ctx.fillRect(0, 0, 200, 200);

  const spotlightGradient2 = ctx.createRadialGradient(
    width - 100,
    50,
    0,
    width - 100,
    50,
    150
  );
  spotlightGradient2.addColorStop(0, "rgba(255, 200, 0, 0.3)");
  spotlightGradient2.addColorStop(1, "rgba(255, 200, 0, 0)");
  ctx.fillStyle = spotlightGradient2;
  ctx.fillRect(width - 200, 0, 200, 200);

  // Center circle
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width / 2, groundLevel + 30, 80, 0, Math.PI * 2);
  ctx.stroke();
};

const drawWrestlingRingArena = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundLevel: number,
  colors: { primary: string; secondary: string; accent: string }
) => {
  // Sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundLevel);
  skyGradient.addColorStop(0, "#1a1a2e");
  skyGradient.addColorStop(0.5, "#16213e");
  skyGradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, groundLevel);

  // Spotlights
  for (let i = 0; i < 3; i++) {
    const x = (width / 3) * (i + 0.5);
    const gradient = ctx.createRadialGradient(x, 20, 0, x, 20, 150);
    gradient.addColorStop(0, "rgba(255, 200, 0, 0.4)");
    gradient.addColorStop(1, "rgba(255, 200, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 150, 0, 300, 200);
  }

  // Ring posts
  const postPositions = [80, width - 80];
  postPositions.forEach((x) => {
    ctx.fillStyle = "#333333";
    ctx.fillRect(x - 10, groundLevel - 120, 20, 120);
    ctx.fillStyle = "#FFB700";
    ctx.fillRect(x - 15, groundLevel - 125, 30, 10);
  });

  // Ropes
  const ropeColors = ["#333333", "#CC0000", "#FFFFFF"];
  ropeColors.forEach((color, idx) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, groundLevel - 80 + idx * 20);
    ctx.lineTo(width - 80, groundLevel - 80 + idx * 20);
    ctx.stroke();
  });

  // Canvas mat
  const matGradient = ctx.createLinearGradient(0, groundLevel, 0, height);
  matGradient.addColorStop(0, "#CC0000");
  matGradient.addColorStop(1, "#990000");
  ctx.fillStyle = matGradient;
  ctx.fillRect(80, groundLevel - 80, width - 160, 80);

  // Ground
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, groundLevel, width, height - groundLevel);

  // Ring border
  ctx.strokeStyle = "#FFB700";
  ctx.lineWidth = 4;
  ctx.strokeRect(80, groundLevel - 80, width - 160, 80);

  // Center circle on mat
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, groundLevel - 40, 60, 0, Math.PI * 2);
  ctx.stroke();
};
