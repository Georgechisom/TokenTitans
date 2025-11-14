# Combat Game - Quick Start Guide

## 🚀 Getting Started

The combat game is now fully integrated into your Game page. Just navigate to `/game` to see it in action!

## 🎮 Game Flow

### Step 1: Select Battle Mode
![Battle Mode Selection]
- **VS AI**: Fight an intelligent computer opponent
- **VS Player**: Battle with a friend on the same keyboard

### Step 2: Choose Your Arena
Select from 5 unique themed battlegrounds:
- 🎪 Floodlit Wrestling Ring
- 🌲 Misty Forest Clearing
- 🏭 Derelict Warehouse
- 🌃 Rainy Cyberpunk Alley
- 🏛️ Crumbling Roman Colosseum

### Step 3: Pick Your Fighter
Choose from 10 unique characters with different fighting styles:
- **Strikers**: Akira (Muay Thai), Marcus (Boxing), Helena (Kickboxing)
- **All-Rounders**: Sophia (MMA), Ivan (Grappling)
- **Agile Fighters**: Raven (Assassin), Sakura (Ninja)
- **Power Fighters**: Brutus (Brawler), Titan (Cybernetic), UNIT-X (Robot)

### Step 4: Confirm & Fight!
Review your selections and hit the **FIGHT!** button

## ⌨️ Controls

### Player 1 Controls
```
↑ W         - Jump
← A  D →    - Move Left/Right
Shift       - Sprint
F           - Punch
G           - Kick
T           - Uppercut
H           - Special Move (requires full energy)
```

### Player 2 Controls (Multiplayer Mode)
```
↑ Up Arrow       - Jump
← Left  Right →  - Move Left/Right
Enter            - Sprint
J                - Punch
K                - Kick
U                - Uppercut
L                - Special Move (requires full energy)
```

## 🎯 Combat Tips

### Energy Management
- Your **Energy Bar** fills as you land successful hits
- Use energy to perform devastating **Special Moves**
- Special moves deal 2-3x normal damage
- When energy reaches 100%, press H (or L for P2) to unleash!

### Combo System
- Land consecutive hits to build a **Combo Multiplier**
- Combos increase your damage output
- More hits = higher multiplier = more damage!
- Watch the combo counter in top-left/right corners

### Fighting Strategy

#### Aggressive Strategy
- **Constant Pressure**: Keep attacking to interrupt opponent
- **Build Combos**: Land multiple hits for bonus damage
- **Mix It Up**: Alternate between punch, kick, and uppercut

#### Defensive Strategy
- **Keep Distance**: Back away when opponent attacks
- **Jump Timing**: Jump to avoid low attacks
- **Energy Building**: Land careful hits to build special move energy

#### Special Move Strategy
- **Save for Finishing Blows**: Use when opponent is low health
- **Predict Movement**: Time it when opponent can't dodge
- **Chain with Knock-back**: Special moves knockback far

### Character Matchups

**Type Advantages:**
- **Strikers** excel at **Distance Control** (Akira, Marcus, Helena)
- **All-Rounders** handle **Any Situation** (Sophia, Ivan)
- **Speed Fighters** have **Better Movement** (Raven, Sakura)
- **Power Fighters** deal **More Damage** (Brutus, Titan, UNIT-X)

## 🏆 Winning

Reduce your opponent's health to 0!

- **Health Bar**: Red bar shows remaining health
- **Damage Numbers**: Floating damage values show impact
- **Critical Hits**: Gold numbers = extra damage with stun effect
- **Stun Effect**: Opponent can't move/attack for a brief moment

## 🤖 Playing Against AI

The AI opponent:
- **Adapts Distance**: Moves closer or farther based on situation
- **Varies Attacks**: Uses mix of punch (40%), kick (30%), uppercut (20%), special (10%)
- **Defensive Play**: When health is low, AI creates distance
- **Strategic Timing**: AI jumps to avoid attacks

**AI Difficulty**: Based on distance-based decision making (can be adjusted)

## 🎨 Visual Feedback

### Health & Energy
- **Green Health**: 60%+ health remaining
- **Orange Health**: 30-60% health
- **Red Health**: <30% critical damage
- **Yellow Energy Bar**: Fills as you hit successfully

### Damage Display
- **White Numbers**: Normal damage
- **Gold Numbers**: Critical hit (larger, more damage)
- **Stun Effect**: Opponent flashes red briefly

### Combo Counter
- **Top-Left** (Player 1): Shows combo multiplier
- **Top-Right** (Player 2): Shows combo multiplier
- **Gold Text**: Appears when combo > 1x

## 🎬 After Victory

### Victory Screen Shows
- 🏆 **Trophy Animation**
- ✨ **Winner's Name** and **Fighting Style**
- 🎮 **Play Again**: Same settings, new fight
- ⚙️ **Change Settings**: Go back to card selection

## 🔧 Customization

### Want to Change Something?

**AI Difficulty:**
- Edit `/src/components/combat/CombatGameNew.tsx`
- Modify `getAIControls()` function
- Adjust distance thresholds (200, 100, etc.)

**Character Stats:**
- Edit character array in `CombatGameNew.tsx`
- Adjust colors, styles, descriptions

**Add New Arena:**
- Edit `/src/lib/arenaThemes.ts`
- Add new theme to `THEMES` array
- Create rendering function

**Animation Speed:**
- Edit `/src/lib/Fighter.ts`
- Adjust `frameDelay`, `speed`, `jumpPower`

## 💡 Pro Tips

1. **Master Distance Control**: Keep opponent at your preferred range
2. **Learn Combos**: Practice chaining attacks for damage
3. **Energy Conservation**: Don't waste energy on missed specials
4. **Character Mastery**: Play each character to learn their strengths
5. **Read the AI**: Predict opponent movement patterns
6. **Use Environment**: Some arenas have visual assists for timing

## ⚡ Performance Tips

- Game runs at **60 FPS** smooth combat
- Canvas rendering optimized
- Minimal lag on standard machines
- Mobile-friendly responsive design

## 🐛 Troubleshooting

### Game Won't Load
- Clear browser cache
- Check console for errors
- Ensure all dependencies installed (`npm install`)

### Controls Not Working
- Click on canvas to focus
- Ensure you're using correct keys (WASD vs Arrows)
- Check Caps Lock is off

### Animations Slow
- Close other browser tabs
- Check GPU acceleration enabled
- Update graphics drivers

### AI Not Moving
- AI operates on decision intervals
- Wait a moment for AI to respond
- Check AI health - if low, AI backs up

## 📱 Mobile Support

Currently optimized for **Desktop**
- Keyboard controls required
- Touch controls coming soon
- Responsive UI layout ready

## 🎓 Learning Resources

See detailed documentation in:
- `COMBAT_GAME_GUIDE.md` - Full technical guide
- `COMBAT_UPDATE_SUMMARY.md` - Implementation summary

## 🎉 Have Fun!

Now you have a complete, professional combat game with:
- ✅ Smooth card-based selection
- ✅ 5 unique arenas
- ✅ 10 playable characters
- ✅ Intelligent AI opponent
- ✅ Advanced combat mechanics
- ✅ Stunning visuals and animations

**Enjoy your battles!** 🥊⚔️🏆

---

**Last Updated**: November 2025
