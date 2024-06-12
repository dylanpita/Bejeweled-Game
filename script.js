// Constants
const GRID_SIZE = 12; // The size of the grid in terms of number of cells.
const CELL_SIZE = 600 / GRID_SIZE; // The size of each cell in the grid.
const ANIMATION_DURATION = 2000; // The duration of animations in milliseconds.

/**
 * Represents a game of shapes.
 */
class Game {
  /**
   * Initializes a new game.
   */
  constructor() {
    // Get the canvas element
    this.canvas = document.querySelector('.canvas');
    this.ctx = this.canvas.getContext('2d');

    // Set the canvas dimensions
    this.canvas.width = 600;
    this.canvas.height = 650; // Increased height to fit the score

    // Center the canvas on the screen
    const canvas_rect = this.canvas.getBoundingClientRect();
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = `${(window.innerHeight - canvas_rect.height) / 2}px`;
    this.canvas.style.left = `${(window.innerWidth - canvas_rect.width) / 2}px`;

    // Define the shapes and their colors
    this.shapes = [
      { type: 'circle', color: 'red' },
      { type: 'square', color: 'blue' },
      { type: 'triangle', color: 'green' },
      { type: 'diamond', color: 'yellow' },
      { type: 'hexagon', color: 'purple' }
    ];

    // Initialize the grid with random shapes
    this.grid = this.initializeGrid();

    // Initialize the game state
    this.selected_cell = null; // The currently selected cell.
    this.score = 0; // The player's current score.

    // Add event listeners
    this.canvas.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    // Check for matches every 100ms
    setInterval(() => {
      this.checkMatches();
    }, 100);

    // Start the game loop
    this.update();
  }

  /**
   * Initializes the grid with random shapes.
   * @returns A 2D array representing the grid.
   */
  initializeGrid() {
    let grid = [];
    // Initialize each row in the grid.
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[i] = [];
      // Initialize each cell in the row.
      for (let j = 0; j < GRID_SIZE; j++) {
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        grid[i][j] = { shape, selected: false, animating: false };
      }
    }
    return grid;
  }

  /**
   * Handles user input.
   * @param event The click event.
   */
  handleClick(event) {
    const x = Math.floor(event.offsetX / CELL_SIZE);
    const y = Math.floor(event.offsetY / CELL_SIZE);
    if (this.selected_cell === null) {
      this.selected_cell = { x, y };
      this.grid[y][x].selected = true;
    } else {
      const temp = this.grid[y][x].shape;
      this.grid[y][x].shape = this.grid[this.selected_cell.y][this.selected_cell.x].shape;
      this.grid[this.selected_cell.y][this.selected_cell.x].shape = temp;
      this.grid[this.selected_cell.y][this.selected_cell.x].selected = false;
      this.selected_cell = null;
    }
  }

  /**
   * Checks for matches in the grid.
   */
  checkMatches() {
    // Check rows
    for (let i = 0; i < GRID_SIZE; i++) {
      // Check for matches in the current row.
      let match = 1;
      let match_type = null;
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.grid[i][j] && this.grid[i][j].shape) {
          if (this.grid[i][j].shape.type === match_type) {
            match++;
          } else {
            if (match >= 3) {
              // Destroy the matched cells.
              for (let k = j - match; k < j; k++) {
                this.destroyCell(i, k);
              }
              this.score += match;
            }
            match = 1;
            match_type = this.grid[i][j].shape.type;
          }
        }
      }
      if (match >= 3) {
        // Destroy the matched cells.
        for (let k = GRID_SIZE - match; k < GRID_SIZE; k++) {
          this.destroyCell(i, k);
        }
        this.score += match;
      }
    }
    // Check columns
    for (let j = 0; j < GRID_SIZE; j++) {
      // Check for matches in the current column.
      let match = 1;
      let match_type = null;
      for (let i = 0; i < GRID_SIZE; i++) {
        if (this.grid[i][j] && this.grid[i][j].shape) {
          if (this.grid[i][j].shape.type === match_type) {
            match++;
          } else {
            if (match >= 3) {
              // Destroy the matched cells.
              for (let k = i - match; k < i; k++) {
                this.destroyCell(k, j);
              }
              this.score += match;
            }
            match = 1;
            match_type = this.grid[i][j].shape.type;
          }
        }
      }
      if (match >= 3) {
        // Destroy the matched cells.
        for (let k = GRID_SIZE - match; k < GRID_SIZE; k++) {
          this.destroyCell(k, j);
        }
        this.score += match;
      }
    }
  }

  /**
   * Destroys a cell.
   * @param i The row index of the cell.
   * @param j The column index of the cell.
   */
  destroyCell(i, j) {
    const color = this.grid[i][j].shape ? this.grid[i][j].shape.color : 'white'; // Store the color of the shape
    const shapeType = this.grid[i][j].shape ? this.grid[i][j].shape.type : null; // Store the type of the shape
    this.grid[i][j].shape = null;
    this.grid[i][j].animating = true;
    let offsetY = 0; // Track the vertical offset
    const shatteredPieces = []; // Store the shattered pieces
    // Create the shattered pieces
    for (let k = 0; k < 5; k++) {
      const piece = {
        x: j * CELL_SIZE + CELL_SIZE / 2 + Math.random() * CELL_SIZE - CELL_SIZE / 2,
        y: i * CELL_SIZE + CELL_SIZE / 2 + Math.random() * CELL_SIZE - CELL_SIZE / 2,
        vx: Math.random() * 10 - 5, // Horizontal velocity
        vy: Math.random() * 10 - 5, // Vertical velocity
        type: shapeType,
      };
      shatteredPieces.push(piece);
    }
    // Animate the destruction
    const start_time = performance.now();
    const animateDestruction = () => {
      const current_time = performance.now();
      const progress = (current_time - start_time) / 1000; // Decreased animation duration
      if (progress < 1) {
        // Draw the shattered pieces
        for (const piece of shatteredPieces) {
          this.ctx.fillStyle = color; // Use the stored color
          this.ctx.beginPath();
          switch (piece.type) { // Use the stored shape type
            case 'circle':
              this.ctx.arc(piece.x + piece.vx * progress, piece.y + piece.vy * progress + offsetY, CELL_SIZE / 4, 0, 2 * Math.PI);
              break;
            case 'square':
              this.ctx.rect(piece.x + piece.vx * progress, piece.y + piece.vy * progress + offsetY, CELL_SIZE / 2, CELL_SIZE / 2);
              break;
            case 'triangle':
              this.ctx.moveTo(piece.x + piece.vx * progress, piece.y + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x + CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 2 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x - CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 2 + piece.vy * progress + offsetY);
              this.ctx.closePath();
              break;
            case 'diamond':
              this.ctx.moveTo(piece.x + piece.vx * progress, piece.y + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x + CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 4 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x + piece.vx * progress, piece.y + CELL_SIZE / 2 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x - CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 4 + piece.vy * progress + offsetY);
              this.ctx.closePath();
              break;
            case 'hexagon':
              this.ctx.moveTo(piece.x + piece.vx * progress, piece.y + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x + CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 6 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x + CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 2 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x + piece.vx * progress, piece.y + CELL_SIZE / 2 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x - CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 2 + piece.vy * progress + offsetY);
              this.ctx.lineTo(piece.x - CELL_SIZE / 2 + piece.vx * progress, piece.y + CELL_SIZE / 6 + piece.vy * progress + offsetY);
              this.ctx.closePath();
              break;
          }
          this.ctx.fill();
        }
        offsetY += 5; // Increase the vertical offset
        requestAnimationFrame(animateDestruction);
      } else {
        // Shift down cells above
        for (let k = i; k > 0; k--) {
          this.grid[k][j].shape = this.grid[k - 1][j].shape;
        }
        // Add a new shape at the top
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        this.grid[0][j].shape = shape;
        this.grid[i][j].animating = false;
      }
    };
    animateDestruction();
  }

  /**
   * Draws a cell.
   * @param i The row index of the cell.
   * @param j The column index of the cell.
   */
  drawCell(i, j) {
    const cell = this.grid[i][j];
    if (cell.shape) {
      this.ctx.fillStyle = cell.shape.color;
      this.ctx.beginPath();
      switch (cell.shape.type) {
        case 'circle':
          this.ctx.arc(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, 2 * Math.PI);
          break;
        case 'square':
          this.ctx.rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          break;
        case 'triangle':
          this.ctx.moveTo(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE);
          this.ctx.lineTo(j * CELL_SIZE + CELL_SIZE, i * CELL_SIZE + CELL_SIZE);
          this.ctx.lineTo(j * CELL_SIZE, i * CELL_SIZE + CELL_SIZE);
          this.ctx.closePath();
          break;
        case 'diamond':
          this.ctx.moveTo(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE);
          this.ctx.lineTo(j * CELL_SIZE + CELL_SIZE, i * CELL_SIZE + CELL_SIZE / 2);
          this.ctx.lineTo(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE);
          this.ctx.lineTo(j * CELL_SIZE, i * CELL_SIZE + CELL_SIZE / 2);
          this.ctx.closePath();
          break;
        case 'hexagon':
          this.ctx.moveTo(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE);
          this.ctx.lineTo(j * CELL_SIZE + CELL_SIZE, i * CELL_SIZE + CELL_SIZE / 4);
          this.ctx.lineTo(j * CELL_SIZE + CELL_SIZE, i * CELL_SIZE + 3 * CELL_SIZE / 4);
          this.ctx.lineTo(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE);
          this.ctx.lineTo(j * CELL_SIZE, i * CELL_SIZE + 3 * CELL_SIZE / 4);
          this.ctx.lineTo(j * CELL_SIZE, i * CELL_SIZE + CELL_SIZE / 4);
          this.ctx.closePath();
          break;
      }
      this.ctx.fill();
      if (cell.selected) {
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }
  }

  /**
   * Draws the grid.
   */
  drawGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw each cell in the grid.
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        this.drawCell(i, j);
      }
    }
    // Draw the score outside the grid
    this.ctx.fillStyle = 'black';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`Score: ${this.score}`, 10, this.canvas.height - 40);
  }

  /**
   * Updates the game state.
   */
  update() {
    this.drawGrid();
    requestAnimationFrame(() => {
      this.update();
    });
  }
}

// Create a new game
new Game();
