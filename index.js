const timers = require('node:timers/promises');
const brain = require('brain.js');

// Define the maze structure
// const maze = [
//     ['#', '#', '#', '#', '#', '#', '#'],
//     ['S', ' ', ' ', ' ', '#', ' ', '#'],
//     ['#', '#', '#', ' ', '#', ' ', '#'],
//     ['#', ' ', ' ', ' ', ' ', ' ', '#'],
//     ['#', ' ', '#', '#', '#', ' ', '#'],
//     ['#', ' ', ' ', ' ', '#', ' ', 'E'],
//     ['#', '#', '#', '#', '#', '#', '#']
// ];

const maze = [
    ['#', '#', '#', '#', '#', '#', '#'],
    ['S', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', '#', '#', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', '#', '#', ' ', '#'],
    ['#', ' ', ' ', '#', '#', ' ', '#'],
    ['#', ' ', ' ', '#', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', ' ', '#'],
    ['#', ' ', '#', '#', '#', ' ', '#'],
    ['E', ' ', ' ', '#', '#', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#'],
];

let storedMazeTrainingProgress = []

function visualizeMazeAtPosition(maze, currentPosition) {
    const visualMaze = maze.map(row => [...row]);

    const [x, y] = currentPosition;
    visualMaze[y][x] = '*';
    
    console.log('\nPath through the maze:');
    visualMaze.forEach(row => console.log(row.join(' ')));
}

function saveMazeVisualizationAtPosition(maze, currentPosition) {
    const visualMaze = maze.map(row => [...row]);

    const [x, y] = currentPosition;
    visualMaze[y][x] = '*';
    
    storedMazeTrainingProgress.push(visualMaze)
}

// Convert maze positions to coordinates
function getPosition(symbol) {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === symbol) {
                return [x, y];
            }
        }
    }
    return null;
}

const start = getPosition('S');
const end = getPosition('E');

function calculateManhattenDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Generate training data
function generateTrainingData() {
    const data = [];
    
    // We'll create training data for valid moves
    const directions = [
        [0, 1],  // down
        [0, -1], // up
        [1, 0],  // right
        [-1, 0]  // left
    ];
    
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] !== '#') {
                directions.forEach(([dx, dy]) => {
                    const newX = x + dx;
                    const newY = y + dy;
                    
                    // Check if move is valid
                    if (newY >= 0 && newY < maze.length &&
                        newX >= 0 && newX < maze[y].length &&
                        maze[newY][newX] !== '#') {
                        
                        // - Do we want to print the maze at this position?
                        // visualizeMazeAtPosition(maze, [newX, newY])
                        // - Or do we want to save and print later?
                        saveMazeVisualizationAtPosition(maze, [newX, newY])

                        // Calculate distance to exit before and after move
                        const currentDist = calculateManhattenDistance(x, y, end[0], end[1]);
                        const newDist = calculateManhattenDistance(newX, newY, end[0], end[1]);
                        
                        data.push({
                            input: {
                                // TBD: we can also normalize the x/y values
                                // to keep them between 0 and 1
                                x: x,
                                y: y,
                                direction_x: dx,
                                direction_y: dy
                            },
                            output: {
                                valid: 1,
                                better: newDist < currentDist ? 1 : 0
                            }
                        });
                    }
                });
            }
        }
    }
    
    return data;
}

// Create and train the neural network
const net = new brain.NeuralNetwork({
    hiddenLayers: [8, 8]
});

const trainingData = generateTrainingData();
const stats = net.train(trainingData, {
    iterations: 2000,
    errorThresh: 0.005
});

// Function to solve the maze
function solveMaze() {
    let currentPos = [...start];
    const path = [currentPos];
    const maxSteps = 100; // Prevent infinite loops
    let steps = 0;
    const visited = new Set();
    
    while (steps < maxSteps) {
        steps++;
        
        // Try all possible directions
        const directions = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];
        
        let bestMove = null;
        let bestScore = -1;

        visited.add(`${currentPos[0]},${currentPos[1]}`);
        
        directions.forEach(([dx, dy]) => {
            const newX = currentPos[0] + dx;
            const newY = currentPos[1] + dy;
            
            if (newY >= 0 && newY < maze.length &&
                newX >= 0 && newX < maze[0].length &&
                maze[newY][newX] !== '#'
                && !visited.has(`${newX},${newY}`)) {
                
                const output = net.run({
                    x: currentPos[0],
                    y: currentPos[1],
                    direction_x: dx,
                    direction_y: dy
                });
                
                const score = output.valid * output.better;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = [newX, newY];
                }
            }
        });
        
        if (bestMove) {
            currentPos = bestMove;
            path.push([...currentPos]);
            
            // Check if we reached the exit
            if (maze[currentPos[1]][currentPos[0]] === 'E') {
                console.log(`Total steps: ${steps}`);
                return path;
            }
        } else {
            break;
        }
    }
    
    console.log(`Total steps: ${steps}`);
    return null;
}

async function printTrainingProgress() {
    // clear the console
    console.clear();
    console.log('\nPath through the maze:\n');

    for (let i = 0; i < storedMazeTrainingProgress.length; i++) {
        console.clear();
        storedMazeTrainingProgress[i].forEach(row => console.log(row.join(' ')));
        await timers.setTimeout(300)
    }

    console.log('\n\n');
}

printTrainingProgress()
  .then(() => {
    // Test the solution
    const solution = solveMaze();
    console.log(stats);

    if (solution) {
        console.log('Solution found!');
        
        // Create a copy of the maze to visualize the path
        const visualMaze = maze.map(row => [...row]);
        solution.forEach(([x, y]) => {
            if (visualMaze[y][x] !== 'S' && visualMaze[y][x] !== 'E') {
                visualMaze[y][x] = '*';
            }
        });
        
        // Print the solution
        console.log('\nPath through the maze:');
        visualMaze.forEach(row => console.log(row.join(' ')));
    } else {
        console.log('No solution found');
    }
  })