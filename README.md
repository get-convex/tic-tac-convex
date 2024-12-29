# Tic Tac Convex

A small demo project to explore and experiment with AI Codegen and Convex.

# Overview

This project is a web-based application for playing a multiplayer Tic-Tac-Toe game. It supports both human and AI players and provides a user-friendly interface for managing games and players.

## Key Technologies

+ Uses type-route for routing
+ Uses convex for state management
+ Uses React for UI

### Types

- **Player**: Represents a player in the game, with attributes for name, ID, and type (human or AI).
- **GameState**: Enum-like type representing the state of the game (waiting, playing, finished).
- **Game**: Represents a game instance, including the board state, players, current player, winner, and other metadata.

### Main Application (`App.tsx`)

- The main component of the application, responsible for rendering the game interface and managing the game state.
- Utilizes custom hooks like `useGameState` and `useAIPlayer` to manage game logic and AI behavior.

### Game Logic (`gameLogic.ts`)

- Contains core functions like `checkWinner` to determine the winner of the game based on the board state.
- Provides utility functions like `getAvailableMoves` to assist in AI decision-making.

### State Management (`useGameState.ts`)

- Manages the state of the game using React hooks.
- Handles actions like creating a game, joining a game, adding an AI player, and making moves.
- Persists game state in local storage for session continuity.

### AI Player Logic (`useAIPlayer.ts`)

- Implements AI behavior for the game.
- Automatically makes moves for AI players when it's their turn.

### Common Components

- **Button (`Button.tsx`)**: A reusable button component with different styling variants (primary, secondary, success).
- **Redirect (`Redirect.tsx`)**: A component for handling route redirection using the `type-route` library.

### Routing (`routes.ts`)

- Defines application routes using the `type-route` library.
- Provides a `RouteProvider` and hooks for managing navigation within the app.
