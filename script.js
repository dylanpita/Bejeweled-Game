// Get the canvas element
const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions
canvas.width = 600;
canvas.height = 650; // Increased height to fit the score

// Center the canvas on the screen
const canvas_rect = canvas.getBoundingClientRect();
canvas.style.position = 'absolute';
canvas.style.top = `${(window.innerHeight - canvas_rect.height) / 2}px`;
canvas.style.left = `${(window.innerWidth - canvas_rect.width) / 2}px`;

// Define the grid dimensions
const grid_size = 12;
const cell_size = canvas.width / grid_size;

// Define the shapes and their colors
const shapes = [
  { type: 'circle', color: 'red' },
  { type: 'square', color: 'blue' },
  { type: 'triangle', color: 'green' },
  { type: 'diamond', color: 'yellow' },
  { type: 'hexagon', color: 'purple' }
];

// Initialize the grid with random shapes
let grid = [];
for (let i = 0; i < grid_size; i++) {
  grid[i] = [];
  for (let j = 0; j < grid_size; j++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    grid[i][j] = { shape, selected: false, animating: false };
  }
}

// Initialize the game state
let selected_cell = null;
let score = 0;

// Draw the grid
function draw_grid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
      const cell = grid[i][j];
      if (cell.shape) {
        ctx.fillStyle = cell.shape.color;
        ctx.beginPath();
        switch (cell.shape.type) {
          case 'circle':
            ctx.arc(j * cell_size + cell_size / 2, i * cell_size + cell_size / 2, cell_size / 2, 0, 2 * Math.PI);
            break;
          case 'square':
            ctx.rect(j * cell_size, i * cell_size, cell_size, cell_size);
            break;
          case 'triangle':
            ctx.moveTo(j * cell_size + cell_size / 2, i * cell_size);
            ctx.lineTo(j * cell_size + cell_size, i * cell_size + cell_size);
            ctx.lineTo(j * cell_size, i * cell_size + cell_size);
            ctx.closePath();
            break;
          case 'diamond':
            ctx.moveTo(j * cell_size + cell_size / 2, i * cell_size);
            ctx.lineTo(j * cell_size + cell_size, i * cell_size + cell_size / 2);
            ctx.lineTo(j * cell_size + cell_size / 2, i * cell_size + cell_size);
            ctx.lineTo(j * cell_size, i * cell_size + cell_size / 2);
            ctx.closePath();
            break;
          case 'hexagon':
            ctx.moveTo(j * cell_size + cell_size / 2, i * cell_size);
            ctx.lineTo(j * cell_size + cell_size, i * cell_size + cell_size / 4);
            ctx.lineTo(j * cell_size + cell_size, i * cell_size + 3 * cell_size / 4);
            ctx.lineTo(j * cell_size + cell_size / 2, i * cell_size + cell_size);
            ctx.lineTo(j * cell_size, i * cell_size + 3 * cell_size / 4);
            ctx.lineTo(j * cell_size, i * cell_size + cell_size / 4);
            ctx.closePath();
            break;
        }
        ctx.fill();
        if (cell.selected) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }
  // Draw the score outside the grid
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, 10, canvas.height - 40);
}

// Handle user input
canvas.addEventListener('click', (event) => {
  const x = Math.floor(event.offsetX / cell_size);
  const y = Math.floor(event.offsetY / cell_size);
  if (selected_cell === null) {
    selected_cell = { x, y };
    grid[y][x].selected = true;
  } else {
    const temp = grid[y][x].shape;
    grid[y][x].shape = grid[selected_cell.y][selected_cell.x].shape;
    grid[selected_cell.y][selected_cell.x].shape = temp;
    grid[selected_cell.y][selected_cell.x].selected = false;
    selected_cell = null;
  }
});

// Check for matches
function check_matches() {
    // Check rows
    for (let i = 0; i < grid_size; i++) {
      let match = 1;
      let match_type = null;
      for (let j = 0; j < grid_size; j++) {
        if (grid[i][j] && grid[i][j].shape) {
          if (grid[i][j].shape.type === match_type) {
            match++;
          } else {
            if (match >= 3) {
              for (let k = j - match; k < j; k++) {
                destroy_cell(i, k);
              }
              score += match;
            }
            match = 1;
            match_type = grid[i][j].shape.type;
          }
        }
      }
      if (match >= 3) {
        for (let k = grid_size - match; k < grid_size; k++) {
          destroy_cell(i, k);
        }
        score += match;
      }
    }
    // Check columns
    for (let j = 0; j < grid_size; j++) {
      let match = 1;
      let match_type = null;
      for (let i = 0; i < grid_size; i++) {
        if (grid[i][j] && grid[i][j].shape) {
          if (grid[i][j].shape.type === match_type) {
            match++;
          } else {
            if (match >= 3) {
              for (let k = i - match; k < i; k++) {
                destroy_cell(k, j);
              }
              score += match;
            }
            match = 1;
            match_type = grid[i][j].shape.type;
          }
        }
      }
      if (match >= 3) {
        for (let k = grid_size - match; k < grid_size; k++) {
          destroy_cell(k, j);
        }
        score += match;
      }
    }
  }

// Destroy a cell
function destroy_cell(i, j) {
  grid[i][j].shape = null;
  grid[i][j].animating = true;
  // Animate the destruction
  const animation_duration = 500; // milliseconds
  const start_time = performance.now();
  function animate_destruction() {
    const current_time = performance.now();
    const progress = (current_time - start_time) / animation_duration;
    if (progress < 1) {
      ctx.fillStyle = 'white';
      ctx.fillRect(j * cell_size, i * cell_size, cell_size, cell_size * (1 - progress));
      requestAnimationFrame(animate_destruction);
    } else {
      // Shift down cells above
      for (let k = i; k > 0; k--) {
        grid[k][j].shape = grid[k - 1][j].shape;
      }
      // Add a new shape at the top
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      grid[0][j].shape = shape;
      grid[i][j].animating = false;
    }
  }
  animate_destruction();
}

// Draw the grid and update the game state
function update() {
  draw_grid();
  requestAnimationFrame(update);
}

// Check for matches every 100ms
setInterval(check_matches, 100);

update();
