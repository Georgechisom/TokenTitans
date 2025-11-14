import { createThirdwebClient } from "thirdweb";

// Initialize Thirdweb client
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "",
});

// Contract configuration
export const CONTRACT_ADDRESS = "0x23d9fD9b1bDED33Bda0eb7e17D708563665b8bCd";
export const CHAIN_ID = 4202; // lisk testnet

// Character data
export const CHARACTERS = [
  {
    id: "muay-thai",
    name: "Young Male Muay Thai",
    strength: 85,
    speed: 90,
    image: "/characters/muay-thai.png",
    description: "Lightning-fast striker with devastating knee attacks",
  },
  {
    id: "boxer",
    name: "Old Male Boxer",
    strength: 95,
    speed: 70,
    image: "/characters/boxer.png",
    description: "Veteran brawler with knockout power",
  },
  {
    id: "mma-female",
    name: "Young Female MMA Fighter",
    strength: 80,
    speed: 95,
    image: "/characters/mma-female.png",
    description: "Agile ground specialist with submission mastery",
  },
  {
    id: "kickboxer",
    name: "Old Female Kickboxer",
    strength: 85,
    speed: 85,
    image: "/characters/kickboxer.png",
    description: "Balanced fighter with precision strikes",
  },
  {
    id: "robot",
    name: "Tactical Robot",
    strength: 100,
    speed: 60,
    image: "/characters/robot.png",
    description: "Mechanical titan with unstoppable force",
  },
  {
    id: "brawler",
    name: "Street Brawler Male",
    strength: 90,
    speed: 75,
    image: "/characters/brawler.png",
    description: "Raw power from underground fighting circuits",
  },
  {
    id: "assassin",
    name: "Elite Assassin Female",
    strength: 75,
    speed: 100,
    image: "/characters/assassin.png",
    description: "Shadow operative with lethal precision",
  },
  {
    id: "cyborg",
    name: "Cybernetic Soldier",
    strength: 95,
    speed: 85,
    image: "/characters/cyborg.png",
    description: "Enhanced warrior with bio-mechanical augments",
  },
  {
    id: "grappler",
    name: "Veteran Grappler Male",
    strength: 90,
    speed: 70,
    image: "/characters/grappler.png",
    description: "Master of throws and bone-crushing holds",
  },
  {
    id: "ninja",
    name: "Agile Ninja Female",
    strength: 70,
    speed: 100,
    image: "/characters/ninja.png",
    description: "Swift shadow dancer with deadly accuracy",
  },
] as const;

// Arena themes
export const THEMES = [
  {
    id: "wrestling-ring",
    name: "Floodlit Wrestling Ring",
    image: "/themes/Floodlit_Wrestling_Ring.jpg",
    description: "Classic arena with ropes and spotlights",
  },
  {
    id: "forest",
    name: "Misty Forest Clearing",
    image: "/themes/Misty_Forest_Clearing.jpeg",
    description: "Ancient trees shrouded in fog",
  },
  {
    id: "warehouse",
    name: "Derelict Warehouse",
    image: "/themes/Derelict_Warehouse.jpeg",
    description: "Industrial ruins with rusted beams",
  },
  {
    id: "cyberpunk",
    name: "Rainy Cyberpunk Alley",
    image: "/themes/Rainy_Cyberpunk_Alley.jpeg",
    description: "Neon-lit streets in endless rain",
  },
  {
    id: "colosseum",
    name: "Crumbling Roman Colosseum",
    image: "/themes/Crumbling_Roman_Colosseum.jpg",
    description: "Ancient battleground of legends",
  },
] as const;
