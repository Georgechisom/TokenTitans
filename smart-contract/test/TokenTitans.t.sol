// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TokenTitans} from "../src/TokenTitans.sol";

contract TokenTitansTest is Test {
    TokenTitans public battles;

    address public owner = address(1);
    address public player1 = address(2);
    address public player2 = address(3);

    function setUp() public {
        vm.prank(owner);
        battles = new TokenTitans();
    }

    function test_Deployment() public view {
        assertEq(battles.owner(), owner);
    }

    function test_Pause() public {
        vm.prank(owner);
        battles.pause();
        assertTrue(battles.paused());
    }

    function test_Unpause() public {
        vm.prank(owner);
        battles.pause();
        vm.prank(owner);
        battles.unpause();
        assertFalse(battles.paused());
    }

    function test_CreateGameVsAI() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);
        assertEq(gameId, 1);

        (
            uint256 id,
            address p1,
            address p2,
            bool isAI,
            uint256 health1,
            uint256 health2,
            address currentTurn,
            uint256 status,
            address winner,
            uint256 lastMoveTime
        ) = battles.getGame(gameId);

        assertEq(id, 1);
        assertEq(p1, player1);
        assertEq(p2, address(0));
        assertTrue(isAI);
        assertEq(health1, 100);
        assertEq(health2, 100);
        assertTrue(currentTurn == player1 || currentTurn == address(0));
        assertEq(status, 0); // Ongoing
        assertEq(winner, address(0));
        assertGt(lastMoveTime, 0);
    }

    function test_CreateGameVsPlayer() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);
        assertEq(gameId, 1);

        (
            uint256 id,
            address p1,
            address p2,
            bool isAI,
            uint256 health1,
            uint256 health2,
            address currentTurn,
            uint256 status,
            address winner,
            uint256 lastMoveTime
        ) = battles.getGame(gameId);

        assertEq(id, 1);
        assertEq(p1, player1);
        assertEq(p2, address(0));
        assertFalse(isAI);
        assertEq(health1, 100);
        assertEq(health2, 100);
        assertEq(currentTurn, address(0)); // Waiting for join
        assertEq(status, 0); // Ongoing
        assertEq(winner, address(0));
        assertGt(lastMoveTime, 0);
    }

    function test_JoinGame() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.prank(player2);
        battles.joinGame(gameId);

        (
            uint256 id,
            address p1,
            address p2,
            bool isAI,
            uint256 health1,
            uint256 health2,
            address currentTurn,
            uint256 status,
            address winner,
            uint256 lastMoveTime
        ) = battles.getGame(gameId);

        assertEq(p2, player2);
        assertTrue(currentTurn == player1 || currentTurn == player2);
    }

    function test_MakeMoveAttack() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        vm.prank(player1);
        battles.makeMove(gameId, true); // Attack

        (
            uint256 id,
            address p1,
            address p2,
            bool isAI,
            uint256 health1,
            uint256 health2,
            address currentTurn,
            uint256 status,
            address winner,
            uint256 lastMoveTime
        ) = battles.getGame(gameId);

        assertEq(health2, 80); // 100 - 20
        assertEq(currentTurn, address(0)); // AI turn
    }

    function test_MakeMoveDefend() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        vm.prank(player1);
        battles.makeMove(gameId, false); // Defend

        (
            uint256 id,
            address p1,
            address p2,
            bool isAI,
            uint256 health1,
            uint256 health2,
            address currentTurn,
            uint256 status,
            address winner,
            uint256 lastMoveTime
        ) = battles.getGame(gameId);

        assertEq(health1, 100); // No change on defend
        assertEq(currentTurn, address(0)); // AI turn
    }

    function test_SubmitAIMove() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        // Make player move first
        vm.prank(player1);
        battles.makeMove(gameId, true);

        // Now AI turn
        vm.prank(player1);
        battles.submitAIMove(gameId, true); // AI attacks

        (
            uint256 id,
            address p1,
            address p2,
            bool isAI,
            uint256 health1,
            uint256 health2,
            address currentTurn,
            uint256 status,
            address winner,
            uint256 lastMoveTime
        ) = battles.getGame(gameId);

        // Health should have changed
        assertEq(health1, 80); // 100 - 20
        assertEq(currentTurn, player1); // Back to player
    }

    function test_ForfeitGame() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        vm.prank(player1);
        battles.forfeitGame(gameId);

        (uint256 status, address winner) = battles.getGameStatus(gameId);
        assertEq(status, 2); // Forfeited
        assertEq(winner, address(0)); // AI win
    }

    function test_ClaimTimeout() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.prank(player2);
        battles.joinGame(gameId);

        // Simulate timeout by warping time
        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(player1);
        battles.claimTimeout(gameId);

        (uint256 status, address winner) = battles.getGameStatus(gameId);
        assertEq(status, 2); // Forfeited
        assertEq(winner, player1);
    }

    function test_GetLatestGameId() public {
        vm.prank(player1);
        battles.createGame(true);

        vm.prank(player2);
        battles.createGame(false);

        assertEq(battles.getLatestGameId(), 2);
    }

    function test_ActiveGamePrevention() public {
        vm.prank(player1);
        battles.createGame(true);

        vm.expectRevert(TokenTitans.ActiveGameOngoing.selector);
        vm.prank(player1);
        battles.createGame(false);
    }

    function test_InvalidGameId() public {
        vm.expectRevert(TokenTitans.InvalidGameId.selector);
        battles.getGame(999);
    }

    function test_NotPlayerInGame() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        vm.expectRevert(TokenTitans.NotPlayerInGame.selector);
        vm.prank(player2);
        battles.makeMove(gameId, true);
    }

    function test_NotYourTurn() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.prank(player2);
        battles.joinGame(gameId);

        // Determine who starts
        (
            ,
            ,
            ,
            ,
            ,
            ,
            address currentTurn,
            ,
            ,
        ) = battles.getGame(gameId);

        if (currentTurn == player1) {
            vm.expectRevert(TokenTitans.NotYourTurn.selector);
            vm.prank(player2);
            battles.makeMove(gameId, true);
        } else {
            vm.expectRevert(TokenTitans.NotYourTurn.selector);
            vm.prank(player1);
            battles.makeMove(gameId, true);
        }
    }

    function test_CannotJoinAIGame() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        vm.expectRevert(TokenTitans.CannotJoinAIGame.selector);
        vm.prank(player2);
        battles.joinGame(gameId);
    }

    function test_GameFull() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.prank(player2);
        battles.joinGame(gameId);

        vm.expectRevert(TokenTitans.GameFull.selector);
        vm.prank(address(4));
        battles.joinGame(gameId);
    }

    function test_AlreadyJoined() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.expectRevert(TokenTitans.ActiveGameOngoing.selector);
        vm.prank(player1);
        battles.joinGame(gameId);
    }

    function test_NotAIGame() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.prank(player2);
        battles.joinGame(gameId);

        vm.expectRevert(TokenTitans.NotAIGame.selector);
        vm.prank(player1);
        battles.submitAIMove(gameId, true);
    }

    function test_NotAITurn() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(true);

        vm.expectRevert(TokenTitans.NotAITurn.selector);
        vm.prank(player1);
        battles.submitAIMove(gameId, true);
    }

    function test_ZeroAddress() public {
        vm.expectRevert(TokenTitans.ZeroAddress.selector);
        vm.prank(address(0));
        battles.createGame(true);
    }

    function test_NoTimeoutYet() public {
        vm.prank(player1);
        uint256 gameId = battles.createGame(false);

        vm.prank(player2);
        battles.joinGame(gameId);

        vm.expectRevert(TokenTitans.NoTimeoutYet.selector);
        vm.prank(player1);
        battles.claimTimeout(gameId);
    }
}
