# TokenTitans

TokenTitans is a decentralized turn based battle game built on Ethereum. Players engage in PlayervsPlayer or PlayervsAI battles with simple mechanics: attack to deal 20 damage or defend to pass the turn without health changes. Health starts at 100 and ends when it reaches 0. The game is fee free, with winners receiving an ERC721 NFT as a proof of victory. The smart contract handles immutable state and enforcement, while the frontend provides an immersive arena experience with character selection and animations. AI opponents are powered off-chain by NullShot for intelligent, adaptive decisions.

## Project Overview

This project demonstrates blockchain AI fusion in the Agentic Economy: on-chain for trustless rules and NFTs, off-chain for sophisticated AI via NullShot's Model Context Protocols (MCPs). It aligns with themes of autonomous agents and interoperable AI-blockchain applications, suitable for the gaming community.

Core components:

- Smart Contract: Manages games, turns, health, and NFT minting.
- Frontend: Next.js app for wallet connection, game UI, and AI orchestration.
- AI Integration: NullShot agent computes moves based on game state, submitting them to the contract.

## Features

- PvP and PvAI modes.
- Turn-based combat: Attack deals 20 damage; defend passes turn (no health change).
- 24-hour timeout for stalled PvP games.
- Automatic NFT minting for human winners (AI does not receive NFTs).
- Active game tracking (one game per player at a time).
- Pause/unpause for owner (emergency controls).
- Events for all actions, enabling frontend reactivity.

## Tech Stack

- Backend (Smart Contract): Solidity 0.8.28, OpenZeppelin (Ownable, ReentrancyGuard, Pausable, ERC721).
- Frontend: Next.js 14, React, Thirdweb SDK (wallet connect, contract interactions).
- AI: NullShot Framework (TypeScript, MCPs for battle context, multi-LLM support like Grok/OpenAI).
- Deployment: Lisk Ethereum for contract; Vercel for frontend.
- Testing: Foundry for contract; Jest/Vitest for frontend.

## Installation and Setup

### Prerequisites

- Node.js 18+.
- Foundry (for contract testing/deployment): Install via `curl -L https://foundry.paradigm.xyz | bash && foundryup`.
- MetaMask or compatible wallet.
- NullShot API key (from nullshot.ai) for AI.

### Clone and Install

1. Clone the repo: `git clone https://github.com/Georgechisom/TokenTitans.git && cd TokenTitans`.
2. Install dependencies: `npm install`.
3. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_id
   NULLSHOT_API_KEY=your_nullshot_key
   ```
4. For AI: Ensure NullShot is configured (see AI section).

### Contract Setup

1. Compile: `forge build`.
2. Test: `forge test`.
3. Deploy to testnet (e.g., Sepolia): Update `script/Deploy.s.sol` with RPC URL and deploy via `forge script script/Deploy.s.sol:DeployScript --rpc-url $LISK_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY -vvv`
   4: verification on lisk
   forge verify-contract \
    --rpc-url https://rpc.sepolia-api.lisk.com \
    --verifier blockscout \
    --verifier-url 'https://sepolia-blockscout.lisk.com/api/' \
    0x23d9fD9b1bDED33Bda0eb7e17D708563665b8bCd \
    src/TokenTitans.sol:TokenTitans`.
   - Contract address will be emitted; update frontend config.

### Frontend Setup

1. Run dev server: `npm run dev`.
2. Open `http://localhost:3000`.

## Usage

### Playing the Game

1. Connect wallet via Thirdweb (MetaMask prompt).
2. Select mode: PvP (create game, share ID) or PvAI.
3. Choose character (frontend-only; cosmetic for now).
4. Take turns: Click Attack (deal 20 damage) or Defend (pass turn).
5. PvAI: Frontend auto-queries NullShot for AI move when it's AI's turn.
6. Game ends on 0 health, forfeit, or timeout. Winner gets NFT.

### Example Flow (PvAI)

- Create game: `createGame(true)` (via frontend).
- If AI turn: Frontend sends state to NullShot → gets "attack" → calls `submitAIMove(gameId, true)`.
- Your turn: Click Attack → `makeMove(gameId, true)`.
- Win: NFT minted automatically; view in wallet.

### Game State Queries

Use `getGame(gameId)` for full state (health, turn, status).
`getGameStatus(gameId)` for quick win checks.

## Smart Contract Details

Deployed as `TokenTitans` (ERC721: "TokenTitansWinner", symbol "TTW").

### Key Structs and Mappings

- `Game`: Stores id, players, isAI, health1/2, currentTurn, status, winner, lastMoveTime.
- `games(uint256 => Game)`: Per-game data.
- `activeGame(address => uint256)`: One active game per player.
- `nftMinted(uint256 => bool)`: Prevents duplicate NFTs per game.

### Core Functions

- `createGame(bool vsAI) returns (uint256)`: Starts game; random turn order.
- `joinGame(uint256 gameId)`: Enters PvP; sets random turn.
- `makeMove(uint256 gameId, bool attack)`: Player move; switches turn, checks win.
- `submitAIMove(uint256 gameId, bool attack)`: Submits off-chain AI move (player1 only).
- `forfeitGame(uint256 gameId)`: Instant loss; mints NFT to opponent.
- `claimTimeout(uint256 gameId)`: Wins stalled PvP after 24 hours.
- View: `getGame(uint256)`, `getLatestGameId()`, `getGameStatus(uint256)`.

### Events

- `GameCreated(uint256 gameId, address creator, bool vsAI)`
- `PlayerJoined(uint256 gameId, address player)`
- `MoveMade(uint256 gameId, address player, bool attacked, uint256 amount)`
- `GameEnded(uint256 gameId, GameStatus status, address winner)`
- `WinnerNFTMinted(uint256 gameId, address winner, uint256 tokenId)`

### Security and Gas

- ReentrancyGuard on state changes.
- Checks: Valid gameId, ongoing status, your turn/player.
- Gas-efficient: Minimal storage; pseudo-random via keccak (not secure RNG, but fine for no-stakes).

NFTs: Sequential tokenIds; \_safeMint to winner on end (no AI).

## Frontend Details

Built with Next.js for a responsive arena UI.

### Key Components

- `pages/index.tsx`: Home with wallet connect (Thirdweb `<ConnectWallet />`).
- `components/GameArena.tsx`: Health bars, turn indicator, Attack/Defend buttons.
- `components/AIHandler.tsx`: Queries NullShot on AI turn; submits via Thirdweb `useContractWrite`.
- `hooks/useContract.ts`: Thirdweb hooks for contract reads/writes (e.g., `useContractWrite({ contract, method: "makeMove" })`).
- Styling: Tailwind CSS; animations via Framer Motion (e.g., damage flashes).
- Character Selection: Dropdown (e.g., "Warrior", "Mage") – cosmetic; store in local state.

### Integration Points

- Wallet: ThirdwebProvider wraps app; activeChain="sepolia" (update for mainnet).
- Contract: Configured via `defineChain` and ABI (import from `/abis/TokenTitans.json`).
- Real-time: Poll `getGame` every 5s or listen to events via Thirdweb SDK.

Run `npm run build` for production; deploy to Vercel.

## NullShot AI Integration

NullShot powers the PvAI opponent as an autonomous agent using MCPs for modularity.

### Setup

- Install: `npm i @nullshot/ai`.
- Config: In `.env.local`, add `NULLSHOT_API_KEY`.
- MCP Definition (in `lib/ai.ts`):

  ```typescript
  import { createAgent, MCP } from "@nullshot/ai";

  const battleMCP = new MCP({
    context: { health: 100, opponentHealth: 100, turn: 'AI', history: [] },
    plugins: [
      { name: 'strategy', fn: (state) => /* Simulate outcomes */ },
      { name: 'llm', provider: 'grok' } // Or 'openai'
    ]
  });

  export async function getAIMove(gameState: any) {
    const agent = createAgent({ mcp: battleMCP });
    const prompt = `In TokenTitans (health: ${gameState.health2}, opponent: ${gameState.health1}). Decide: attack (true) or defend (false). Reason step-by-step.`;
    const response = await agent.query(prompt);
    return { attack: response.includes('attack'), reason: response };
  }
  ```

### How It Works

- On AI turn (`currentTurn === address(0)`): Frontend calls `getAIMove` → parses response → `submitAIMove(gameId, attack)`.
- Adaptivity: MCP context includes history; agent learns (e.g., defend if opponent aggressive).
- Streaming: Use NullShot's real-time for "thinking" animations.
- Fallback: If NullShot fails, default to random (but rare).

This makes AI feel alive: strategic defends, opportunistic attacks, even "trash talk" via chat bubbles.

## Deployment

### Contract

- Local: `forge create --rpc-url http://localhost:8545 --private-key 0xac0000...`.
- Testnet: Use Remix or Foundry script; verify on Etherscan.
- Mainnet: Update to Base/Optimism for low fees.

### Frontend

- Build: `npm run build`.
- Deploy: `vercel --prod`; set env vars in Vercel dashboard.

### Full Stack

1. Deploy contract → note address.
2. Update `constants/contractAddress.ts` in frontend.
3. Deploy frontend → done.

## Testing

### Contract

- `forge test --match-path test/TokenTitans.t.sol`: Covers create, moves, win, NFT, timeout.

### Frontend

- `npm test`: Jest for components; simulate AI with mocks.
- E2E: Cypress for wallet flows (optional).

### AI

- Mock NullShot: `jest.mock('@nullshot/ai')` → test move submission.

## Contributing

Fork, branch, PR with tests. Focus on AI enhancements (e.g., multi-agent PvAI) or character NFTs.

## License

MIT. See LICENSE file.
