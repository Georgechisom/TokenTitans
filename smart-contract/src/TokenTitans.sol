// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenTitans is Ownable, ReentrancyGuard, Pausable, ERC721 {
    enum GameStatus { Ongoing, Won, Forfeited }

    struct Game {
        uint256 id;
        address player1;
        address player2; // address(0) if vs AI
        bool isAI;
        uint256 health1;
        uint256 health2;
        address currentTurn; // address of current player, or address(0) for AI turn
        GameStatus status;
        address winner;
        uint256 lastMoveTime;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256) public activeGame;
    uint256 public nextGameId = 1;
    uint256 private nextTokenId = 1;
    mapping(uint256 => bool) private nftMinted;

    error InvalidGameId();
    error GameNotOngoing();
    error NotPlayerInGame();
    error NotYourTurn();
    error GameFull();
    error CannotJoinAIGame();
    error AlreadyJoined();
    error NotAIGame();
    error NotAITurn();
    error ZeroAddress();
    error ActiveGameOngoing();
    error NoTimeoutYet();
    error NFTAlreadyMinted();
    error OnlyHumanPlayerCanSubmitAIMove();

    event GameCreated(uint256 indexed gameId, address indexed creator, bool vsAI);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event MoveMade(uint256 indexed gameId, address indexed player, bool attacked, uint256 amount);
    event GameEnded(uint256 indexed gameId, GameStatus status, address indexed winner);
    event WinnerNFTMinted(uint256 indexed gameId, address indexed winner, uint256 tokenId);

    constructor() Ownable(msg.sender) ERC721("TokenTitansWinner", "TTW") {}

   
    // Creates a new game. If vsAI is true, the second player is the AI.
    // vsAI Whether to play against AI or another player.
    // The ID of the created game.
    function createGame(bool vsAI) external whenNotPaused returns (uint256) {
        if (msg.sender == address(0)) revert ZeroAddress();
        uint256 currentActive = activeGame[msg.sender];
        if (currentActive != 0 && games[currentActive].status == GameStatus.Ongoing) revert ActiveGameOngoing();

        uint256 gameId = nextGameId++;
        Game storage g = games[gameId];
        g.id = gameId;
        g.player1 = msg.sender;
        g.health1 = 100;
        g.health2 = 100;
        g.isAI = vsAI;
        g.status = GameStatus.Ongoing;
        g.lastMoveTime = block.timestamp;

        // Determine starting turn pseudo-randomly
        uint256 rand = _getPseudoRandom(gameId);
        if (vsAI) {
            g.player2 = address(0);
            g.currentTurn = (rand % 2 == 0) ? msg.sender : address(0);
        } else {
            g.player2 = address(0);
            g.currentTurn = address(0); // Waiting for join
        }

        activeGame[msg.sender] = gameId;

        emit GameCreated(gameId, msg.sender, vsAI);
        return gameId;
    }

   
    // Allows a player to join an existing PvP game.
    // gameId The ID of the game to join.
    function joinGame(uint256 gameId) external whenNotPaused {
        if (msg.sender == address(0)) revert ZeroAddress();
        uint256 currentActive = activeGame[msg.sender];
        if (currentActive != 0 && games[currentActive].status == GameStatus.Ongoing) revert ActiveGameOngoing();

        Game storage g = games[gameId];
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        if (g.status != GameStatus.Ongoing) revert GameNotOngoing();
        if (g.isAI) revert CannotJoinAIGame();
        if (g.player2 != address(0)) revert GameFull();
        if (g.player1 == msg.sender) revert AlreadyJoined();

        g.player2 = msg.sender;
        g.lastMoveTime = block.timestamp;

        // Determine starting turn pseudo-randomly after join
        uint256 rand = _getPseudoRandom(gameId);
        g.currentTurn = (rand % 2 == 0) ? g.player1 : g.player2;

        activeGame[msg.sender] = gameId;

        emit PlayerJoined(gameId, msg.sender);
    }

   
    // Allows a player to make a move (attack or defend) on their turn.
    // gameId The ID of the game.
    // attack True to attack (damage opponent 20), false to defend (no health change).
    function makeMove(uint256 gameId, bool attack) external whenNotPaused {
        Game storage g = games[gameId];
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        if (g.status != GameStatus.Ongoing) revert GameNotOngoing();

        address player = msg.sender;
        if (player != g.player1 && player != g.player2) revert NotPlayerInGame();
        if (g.currentTurn != player) revert NotYourTurn();

        uint8 playerNum = (player == g.player1) ? 1 : 2;
        _executeMove(g, playerNum, attack);

        // Check for win condition
        _checkWinCondition(g);
        if (g.status != GameStatus.Ongoing) return;

        // Switch turn
        if (playerNum == 1) {
            g.currentTurn = g.isAI ? address(0) : g.player2;
        } else {
            g.currentTurn = g.player1;
        }

        g.lastMoveTime = block.timestamp;
    }

    // This function to allow human player to submit off-chain computed AI moves.
    // gameId The ID of the game.
    // attack True if AI attacks, false if defends.
    function submitAIMove(uint256 gameId, bool attack) external whenNotPaused {
        Game storage g = games[gameId];
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        if (!g.isAI) revert NotAIGame();
        if (g.currentTurn != address(0)) revert NotAITurn();
        if (g.status != GameStatus.Ongoing) revert GameNotOngoing();
        if (msg.sender != g.player1) revert OnlyHumanPlayerCanSubmitAIMove();

        _executeMove(g, 2, attack);

        // Check for win condition
        _checkWinCondition(g);
        if (g.status != GameStatus.Ongoing) return;

        // Switch turn back to player1
        g.currentTurn = g.player1;

        g.lastMoveTime = block.timestamp;
    }

   
    // Allows a player to forfeit the game.
    // gameId The ID of the game.
    function forfeitGame(uint256 gameId) external whenNotPaused {
        Game storage g = games[gameId];
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        if (g.status != GameStatus.Ongoing) revert GameNotOngoing();

        address player = msg.sender;
        bool isPlayer1 = (player == g.player1);
        bool isPlayer2 = (player == g.player2);
        if (!isPlayer1 && !isPlayer2) revert NotPlayerInGame();

        g.status = GameStatus.Forfeited;
        if (isPlayer1) {
            g.winner = g.isAI ? address(0) : g.player2;
            g.health1 = 0;
        } else {
            g.winner = g.player1;
            g.health2 = 0;
        }

        emit GameEnded(gameId, GameStatus.Forfeited, g.winner);

        activeGame[g.player1] = 0;
        if (!g.isAI) activeGame[g.player2] = 0;

        // Changed: Call to mint NFT if winner is not AI.
        _mintNFTIfApplicable(gameId);
    }

   
    // Allows the waiting player to claim a win if the other player has stalled beyond the timeout.
    // gameId The ID of the game.
    function claimTimeout(uint256 gameId) external whenNotPaused {
        Game storage g = games[gameId];
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        if (g.status != GameStatus.Ongoing) revert GameNotOngoing();
        if (g.isAI) revert NotAIGame();
        if (block.timestamp <= g.lastMoveTime + 1 days) revert NoTimeoutYet();

        address claimant = msg.sender;
        if (claimant != g.player1 && claimant != g.player2) revert NotPlayerInGame();
        if (g.currentTurn == claimant) revert NotYourTurn();

        g.status = GameStatus.Forfeited;
        g.winner = claimant;
        if (claimant == g.player1) {
            g.health2 = 0;
        } else {
            g.health1 = 0;
        }

        emit GameEnded(gameId, GameStatus.Forfeited, g.winner);

        activeGame[g.player1] = 0;
        activeGame[g.player2] = 0;

        // Changed: Call to mint NFT if winner is not AI.
        _mintNFTIfApplicable(gameId);
    }

   
    // Retrieves the data for a specific game.
    // gameId The ID of the game.
    // id Game ID.
    // player1 Address of player 1.
    // player2 Address of player 2 (address(0) for AI).
    // isAI Whether the game is against AI.
    // health1 Health of player 1.
    // health2 Health of player 2/AI.
    // currentTurn Address of current turn (address(0) for AI).
    // status Game status enum value.
    // winner Address of winner (address(0) for AI or none).
    // lastMoveTime Timestamp of last move.
    function getGame(uint256 gameId) external view returns (
        uint256 id,
        address player1,
        address player2,
        bool isAI,
        uint256 health1,
        uint256 health2,
        address currentTurn,
        uint256 status,
        address winner,
        uint256 lastMoveTime
    ) {
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        Game memory g = games[gameId];
        return (g.id, g.player1, g.player2, g.isAI, g.health1, g.health2, g.currentTurn, uint256(g.status), g.winner, g.lastMoveTime);
    }

   
    // Retrieves the latest game ID.
    // The latest game ID.
    function getLatestGameId() external view returns (uint256) {
        if (nextGameId == 1) return 0;
        return nextGameId - 1;
    }

   
    // Retrieves the status of a game.
    // gameId The ID of the game.
    // status Game status (0: Ongoing, 1: Won, 2: Forfeited).
    // winner Address of the winner (address(0) for AI or none).
    function getGameStatus(uint256 gameId) external view returns (uint256 status, address winner) {
        if (gameId == 0 || gameId >= nextGameId) revert InvalidGameId();
        Game memory g = games[gameId];
        return (uint256(g.status), g.winner);
    }

    // Internal function to execute a move
    function _executeMove(Game storage g, uint8 playerNum, bool attack) internal {
        address player = (playerNum == 1) ? g.player1 : (g.isAI ? address(0) : g.player2);
        uint256 amount = attack ? 20 : 0; // Changed: Defend does no damage/heal.

        if (attack) {
            if (playerNum == 1) {
                if (g.health2 > amount) g.health2 -= amount;
                else g.health2 = 0;
            } else {
                if (g.health1 > amount) g.health1 -= amount;
                else g.health1 = 0;
            }
        } else {
            // Changed: Defend does nothing to health - just passes the turn.
        }

        emit MoveMade(g.id, player, attack, amount);
    }

    // Internal function to check if the game has ended due to health reaching 0
    function _checkWinCondition(Game storage g) internal {
        if (g.health1 == 0) {
            g.status = GameStatus.Won;
            g.winner = g.isAI ? address(0) : g.player2;
            emit GameEnded(g.id, GameStatus.Won, g.winner);
            activeGame[g.player1] = 0;
            if (!g.isAI) activeGame[g.player2] = 0;
            // Changed: Call to mint NFT if winner is not AI.
            _mintNFTIfApplicable(g.id);
        } else if (g.health2 == 0) {
            g.status = GameStatus.Won;
            g.winner = g.player1;
            emit GameEnded(g.id, GameStatus.Won, g.winner);
            activeGame[g.player1] = 0;
            if (!g.isAI) activeGame[g.player2] = 0;
            // Changed: Call to mint NFT if winner is not AI.
            _mintNFTIfApplicable(g.id);
        }
    }

    // Internal pseudo-random number generator (not secure, but sufficient for no-stake game)
    function _getPseudoRandom(uint256 seed) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, seed)));
    }

    //  To mint NFT to winner if applicable (not AI and not already minted).
    function _mintNFTIfApplicable(uint256 gameId) internal {
        Game storage g = games[gameId];
        if (g.winner == address(0) || nftMinted[gameId]) return;

        uint256 tokenId = nextTokenId++;
        _safeMint(g.winner, tokenId);
        nftMinted[gameId] = true;

        emit WinnerNFTMinted(gameId, g.winner, tokenId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}