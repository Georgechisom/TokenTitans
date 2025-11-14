# Combat Game - Card-Based Selection System

## Overview

The combat game has been completely redesigned with a professional multi-step card selection system featuring smooth slide animations, integrated AI opponent logic, and theme-based arena rendering.

## Features

### 1. **Card Flow System**

The game now uses a 4-step card selection process:

#### Card 1: Battle Mode Selection

- Choose between "VS AI" or "VS Player"
- Interactive buttons with visual feedback
- Selection slides out to the left

#### Card 2: Arena/Theme Selection

- 5 unique themed arenas to choose from
- Each arena has unique visuals and environmental effects
- Selection slides out to the right
- Themes:
  - Floodlit Wrestling Ring (classic arena)
  - Misty Forest Clearing (nature-themed)
  - Derelict Warehouse (industrial)
  - Rainy Cyberpunk Alley (neon cityscape)
  - Crumbling Roman Colosseum (ancient battleground)

#### Card 3: Character Selection

- Player 1 selects their fighter from 10 unique characters
- In VS AI mode: AI automatically selects a random different character
- In VS Player mode: Proceeds to Player 2 selection card
- Characters display fighting style and unique visual representation

#### Card 4: Final Confirmation

- Review of all selections
- Display of battle mode, arena, and both fighters
- "FIGHT!" button to start the game

### 2. **10 Playable Characters**

All characters feature:

- Unique fighting styles and animations
- Three body type variations (human, robot, cybernetic)
- Gender-specific character models
- Distinctive visual styles in-game

**Character List:**

1. **Akira** - Muay Thai Master (Athletic Male)
2. **Marcus** - The Boxing Legend (Muscular Male)
3. **Sophia** - MMA Champion (Athletic Female)
4. **Helena** - Kickboxing Queen (Athletic Female)
5. **UNIT-X** - Combat Robot (Robot)
6. **Brutus** - Street Brawler (Heavy Male)
7. **Raven** - Elite Assassin (Agile Female)
8. **Titan** - Cybernetic Soldier (Cybernetic Male)
9. **Ivan** - Grappling Master (Heavy Male)
10. **Sakura** - Shadow Ninja (Agile Female)

### 3. **Smooth Animations**

- **Slide Transitions**: Cards slide left/right with fade effects
- **Duration**: 0.5s ease-in-out
- **Alternating Directions**: Left then right for visual appeal
- **Progress Indicator**: Visual dots showing progression through cards

### 4. **AI Opponent System**

The AI uses intelligent decision-making:

**Distance-Based Strategy:**

- **>200px away**: Approach opponent, sometimes run
- **100-200px away**: Attack with varied moves
- **<100px away**: Create distance, back up

**Attack Patterns:**

- Punch: 40% chance
- Kick: 30% chance
- Uppercut: 20% chance
- Special: 10% chance (when energy full)

**Defensive Behavior:**

- Jumps occasionally to avoid attacks
- Creates distance when health <30%
- Random blocking patterns

### 5. **Theme-Based Arena Rendering**

Each theme renders with unique visuals:

#### Wrestling Ring

- Ropes and posts
- Spotlights
- Red canvas mat
- Gold accents

#### Cyberpunk

- Neon buildings
- Rain effects
- Glowing grid floor
- Neon circle arena

#### Forest

- Trees and foliage
- Fog effects
- Grass patterns
- Natural lighting

#### Warehouse

- Metal beams
- Rust effects
- Industrial floor plating
- Spotlight illumination

#### Colosseum

- Roman pillars
- Archways
- Torch lighting
- Stone floor pattern

### 6. **Advanced Combat Mechanics**

All version 3 features preserved:

- **Health System**: Full health bars with color indicators
- **Energy System**: Special moves require 100% energy
- **Combo Counter**: Displays consecutive successful hits
- **Damage Numbers**: Floating damage values with critical hits in gold
- **Stun System**: Critical hits stun opponent for 20 frames
- **Knockback**: Movement physics on successful hits
- **Animation States**: 10+ animation states per character

### 7. **Victory Screen**

After fight concludes:

- Trophy animation
- Winner name and fighting style
- Two options:
  - "Play Again" - Restart with same settings
  - "Change Settings" - Return to card selection

## File Structure

```
src/
├── components/combat/
│   ├── CombatGameNew.tsx          # Main game component (NEW)
│   ├── CardFlow.tsx               # Card selection UI (NEW)
│   └── CombatGame.tsx             # Legacy version
├── lib/
│   ├── Fighter.ts                 # Fighter class with all mechanics (NEW)
│   ├── arenaThemes.ts             # Arena rendering functions (NEW)
│   ├── thirdweb.ts                # Original config
│   └── utils.ts
└── pages/
    └── Game.tsx                   # Main game page (UPDATED)
```

## Component API

### CombatGameNew

Main component handling game states and flow.

**States:**

- `selection`: Card flow UI
- `fighting`: Canvas-based combat
- `victory`: Victory screen

**Props:** None (self-contained)

### CardFlow

Handles multi-step card selection with animations.

**Props:**

```typescript
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
```

### Fighter Class

Complete fighter implementation with all animations and mechanics.

**Key Methods:**

- `update(groundLevel, opponent)` - Physics & collision
- `draw(ctx)` - Canvas rendering
- `attack(type)` - Initiate attack ("punch", "kick", "uppercut", "special")
- `move(direction, running)` - Move fighter
- `jump()` - Execute jump
- `takeDamage(amount, isCritical)` - Apply damage

**Animation States:**

- idle, walk, run, jump
- punch, kick, uppercut, special
- hurt, block

## Controls

### Player 1

- **Movement**: A/D
- **Sprint**: Hold Shift
- **Punch**: F
- **Kick**: G
- **Uppercut**: T
- **Special**: H (requires full energy)
- **Jump**: W

### Player 2 (PvP Mode)

- **Movement**: Left/Right Arrows
- **Sprint**: Hold Enter
- **Punch**: J
- **Kick**: K
- **Uppercut**: U
- **Special**: L (requires full energy)
- **Jump**: Up Arrow

## Styling

- **Dark theme** with gradient backgrounds
- **Maximum card width**: 600px, centered
- **Glow effects** on interactive elements
- **Responsive design** for mobile compatibility
- **Tailwind CSS** for all styling

## Integration Notes

1. **Replace old Game.tsx** - Now uses CombatGameNew directly
2. **Fighter class isolated** - Can be reused in other components
3. **Theme system extensible** - Add new themes via arenaThemes.ts
4. **AI system modular** - Adjust difficulty in getAIControls()
5. **Canvas rendering independent** - Works without React state during gameloop

## Performance Optimizations

- Canvas requestAnimationFrame for 60fps
- Efficient collision detection
- Minimal state updates during combat
- Proper cleanup of event listeners
- Reference tracking to prevent memory leaks

## Future Enhancements

- [ ] Character skins/customization
- [ ] Difficulty levels for AI
- [ ] Combo system with special effects
- [ ] Sound effects integration
- [ ] Network multiplayer
- [ ] Character progression/leveling
- [ ] Special arenas with environmental hazards
- [ ] Tournament mode

## Browser Compatibility

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- Mobile browsers: ✅ Touch-optimized (on roadmap)

## Debugging

Enable hitbox visualization by changing line in `Fighter.ts`:

```typescript
if (this.hitbox && true) {  // Change false to true
```

This will draw red rectangles showing attack hitboxes.

## Version History

- **v1.0**: Initial card-based system
  - 4-step card flow
  - 5 themed arenas
  - AI opponent system
  - Enhanced victory screen
  - Smooth animations

---

**Last Updated**: November 2025
**Status**: Production Ready
