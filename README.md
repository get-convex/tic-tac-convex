# Tic Tac Convex

A multiplayer Tic-Tac-Toe game built with React and Convex.

## Overview

This project is a web-based application for playing multiplayer Tic-Tac-Toe. It supports both human and AI players and provides a user-friendly interface for managing games and players.

### Backend (Convex)

- **Schema**: Defines the data model for players and games
- **Queries**: Real-time data fetching for game state
- **Mutations**: Handle game actions like moves and joining
- **Actions**: Manage AI player behavior

### Frontend (React)

- **Main Application** (`App.tsx`): Routes and main game flow
- **Components**: Reusable UI components for the game interface
- **Hooks**: Custom hooks for interfacing with Convex backend

### Common Components

- **Button** (`Button.tsx`): A reusable button component with different styling variants
- **Redirect** (`Redirect.tsx`): A component for handling route redirection

### Routing (`routes.ts`)

- Defines application routes using the `type-route` library
- Provides a `RouteProvider` and hooks for managing navigation

## Features

- Real-time multiplayer gameplay
- AI opponents
- Persistent game state
- Clean, modern UI
- Type-safe backend and frontend
