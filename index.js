const brain = require('brain.js');

// Define the maze structure
const maze = [
    ['#', '#', '#', '#', '#', '#', '#'],
    ['S', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', '#', '#', ' ', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', '#', '#', '#', ' ', '#'],
    ['#', ' ', ' ', ' ', '#', ' ', 'E'],
    ['#', '#', '#', '#', '#', '#', '#']
];

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
    
    while (steps < maxSteps) {
        steps++;
        
        // Try all possible directions
        const directions = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];
        
        let bestMove = null;
        let bestScore = -1;
        
        directions.forEach(([dx, dy]) => {
            const newX = currentPos[0] + dx;
            const newY = currentPos[1] + dy;
            
            if (newY >= 0 && newY < maze.length &&
                newX >= 0 && newX < maze[0].length &&
                maze[newY][newX] !== '#') {
                
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