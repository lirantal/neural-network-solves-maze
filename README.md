# Neural Network Maze Solver

A Neural Network that learns to solve ASCII-based mazes using reinforcement learning.

![Neural Network Maze Solver Demo](.github/neural-net-train.gif)

## Overview

This project demonstrates how a neural network can learn to navigate through a text-based maze. The neural network:
- Takes the current maze state as input
- Learns through trial and error using reinforcement learning
- Outputs movement decisions (up, down, left, right)
- Receives rewards for reaching the goal and penalties for invalid moves

## Prerequisites

- Node.js (v20 or higher)
- npm

For Linux/Ubuntu systems or GitHub Codespaces, you'll need these additional dependencies:

```sh
sudo apt-get update
sudo apt-get install -y libgl1-mesa-dev
sudo apt-get install -y libxi-dev libx11-dev libxext-dev
```

## Installation

1. Clone the repository:
```sh
git clone https://github.com/lirantal/neural-network-solves-maze.git
cd neural-network-solves-maze
```

2. Install dependencies:
```sh
npm install
```

## Usage

Run the maze solver:

```sh
node index.js
```

The program will:
1. Load a predefined ASCII maze
2. Train the neural network through multiple iterations
3. Display the training progress
4. Show the final solution path through the maze

## Maze Format

The maze is represented using ASCII characters:
- `S`: Start position
- `E`: End/Goal position
- `#`: Wall
- ` `: Open path (space)

Example maze:

```
# # # # # # #
S       #   #
# # #   #   #
#           #
#   # # #   #
#       #   E
# # # # # # #
```

## How It Works

1. **Input Processing**:
   - Takes x, y coordinates of current position
   - Uses direction vectors (dx, dy) for possible movements
   - Calculates Manhattan distance to goal for each move

2. **Neural Network Structure**:
   - Uses brain.js with 2 hidden layers of 8 neurons
   - Input layer: 4 neurons (x, y, direction_x, direction_y)
   - Output layer: 2 neurons (valid move, better distance to goal)
   - Trained for 2000 iterations with 0.005 error threshold

3. **Learning Process**:
   - Generates training data from all valid moves in the maze
   - For each position, evaluates all possible directions
   - Scores moves based on whether they reduce distance to goal
   - Uses visualization to show training progress
   - Final path finding uses neural net predictions to choose best moves

## License

This project is licensed under the Apache 2.0 License.

## Author

Liran Tal <liran@lirantal.com>