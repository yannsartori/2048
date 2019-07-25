//Apologizes to future self for poor code. I was learning "dynamically"

/*
Summary of code:
The general approach is to have a logic board where each tile has its current 
position (stored as a its array position on the board) and the position before 
(stored as object properties). Each DOM element has an id indicative of its 
position in the "before" state. Then for each tile", we check its old position,
get the DOM element using that as a key, and update both the tile's position 
properties and the dom position. This allows for a transition.
*/

/* MVC more like MVYeet*/

let dumbconsole = function(obj) { //debugging purposes
    console.log(JSON.parse(JSON.stringify(obj)));
};
let SIZE = 0; const BORDER_SIZE = 10; const TILE_SIZE = 100; //size determined by user
const LEFT = 37; const UP = 38; const RIGHT = 39; const DOWN = 40; const TAB = 9; const CTRL = 32;
let score = 0; //needs to be global or else stuff breaks
let highScore = 0; //fetched from cookies

main();



//constructor
function Tile(value) {
  // Generaters a random number of either 2**1 or 2**2 if no argument supplied
  if (value !== undefined) this.value = value;
  else this.value = (Math.floor(Math.random()*10) < 9) ? 2 : 4; //10 percent chance of getting a 4
  this.top = -1; 
  this.left = -1;
  this.merged = false; //stores information about the tile with which another merged. Used to fetch the element (id) and animation purposes
  this.mergedTop = -1;
  this.mergedLeft = -1;
  this.determineColour = function() {
    switch(this.value) {
      case (2):    this.backgroundColour = "#eee4da"; this.textColour = "#73695f"; break;
      case (4):    this.backgroundColour = "#ece0ca"; this.textColour = "#797061"; break;
      case (8):    this.backgroundColour = "#f0b27a"; this.textColour = "#fef0dd"; break;
      case (16):   this.backgroundColour = "#ed8d51"; this.textColour = "#fef0dd"; break; 
      case (32):   this.backgroundColour = "#f77f63"; this.textColour = "#fef0dd"; break;
      case (64):   this.backgroundColour = "#f75d37"; this.textColour = "#fef0dd"; break;
      case (128):  this.backgroundColour = "#f6d76b"; this.textColour = "#fef0dd"; break;
      case (256):  this.backgroundColour = "#f1cf53"; this.textColour = "#fef0dd"; break;
      case (512):  this.backgroundColour = "#eec752"; this.textColour = "#fef0dd"; break;
      case (1024): this.backgroundColour = "#efc53f"; this.textColour = "#fef0dd"; break;
      case (2048): this.backgroundColour = "#ecc400"; this.textColour = "#fef0dd"; break;
      default:     this.backgroundColour = "#3d3a31"; this.textColour = "#fef0dd"; break;
    }
  };
  this.increaseValue = function() {
    this.value *= 2;
    this.merged = true;
    this.determineColour();
  };
  this.determineColour();
}
function main() {
  let id = setInterval(function() {
    SIZE = document.getElementById("grid").getAttribute("size");
    if (SIZE) { //waits for user to give a size
      clearInterval(id);
      cookie();
      let htmlGrid = document.getElementById("grid"); let listener = document.getElementById("game");
      let gameBoard = [];
      window.addEventListener("keydown", event => {//prevents page movement
          if([TAB, CTRL, LEFT, UP, RIGHT, DOWN].indexOf(event.keyCode) != -1) event.preventDefault();
      });
      
      for (let i = 0; i < SIZE; i++) { //initializes a SIZExSIZE array filled with blank tiles.
        gameBoard.push([]);
        for (let j = 0; j < SIZE; j++) {
          gameBoard[i].push(null);
        }
      }
      let wrapper = function (event) {
        playGame(gameBoard, htmlGrid, event, wrapper)
      };
      addTile(gameBoard, htmlGrid);
      addTile(gameBoard, htmlGrid);
      draw(gameBoard, htmlGrid);
      let timeoutId = 0;
      //listener.addEventListener("keydown", wrapper);
      listener.addEventListener("keydown", function(event) {
      	clearTimeout(timeoutId);
        timeoutId = setTimeout(() => wrapper(event), 125);
      });
    }
  }, 50);
}
function cookie() {
  if (!document.cookie) {
    let dateString = (new Date(2030, 0)).toUTCString();
    document.cookie = `highScore=0; expires=${dateString}; path=/`;
  } else {
    highScore = +getHighScore();
  }
}
function getHighScore() {
  let name = "highScore=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function playGame(gameBoard, htmlGrid, event, wrapper) {
  if ([LEFT, RIGHT, UP, DOWN].indexOf(event.keyCode)< 0) return; //invalid keycode
  if (isMergeAvailable(gameBoard)) {
      let retVal = getMoveAndUpdateScore(gameBoard, event);
      let keyCode = retVal[0];
      if (retVal[1]) { //if pieces moved
        draw(gameBoard, htmlGrid, keyCode);
        addTile(gameBoard, htmlGrid);
      }
      dumbconsole(gameBoard);
  } else {
      alert("No new moves detected");
      document.cookie = (score > highScore) ? `highScore=${score}; expires=${(new Date(2030, 0)).toUTCString()}` : document.cookie;
      listener.removeEventListener("keydown", wrapper); //finds it in main(); 
  }
}
function isMergeAvailable(grid) {
  //horizontal
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - 1; j++) {
      //if there is a blank grid space or two adjacent grid spaces match value
      if (!grid[i][j] || !grid[i][j + 1] || grid[i][j].value === grid[i][j + 1].value) return true;    
    }
  }
  //vertical
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE - 1; i++) {
      if (grid[i][j].value === grid[i + 1][j].value) return true;
    }
  }
  return false;
}
function getMoveAndUpdateScore(grid, event) {
  let sum = 0; let somethingChanged = false;
  let merge = []; //used to prevent a cascade sort of effect when multiple merges could occur e.g. 2 2 4 8 = - 4 4 8, not - - - 16
  for (let i = 0; i < SIZE; i++) {
    merge.push([]);
    for (let j = 0; j < SIZE; j++) {
      merge[i].push(false);
    }
  }
  switch (event.keyCode) {
    case (LEFT):
      for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
          for (let k = j; k > 0; k--) { //iterates to the direction of the keypress
            if (!grid[i][k]) continue;               
            else if (!grid[i][k-1]) { //swap
	      somethingChanged = true;
              grid[i][k-1] = deepCopy(grid[i][k]); //deep copies
              grid[i][k] = null;
            } else if ((grid[i][k].value === grid[i][k-1].value) && !merge[i][k-1] && !merge[i][k]) { //if they are of the same value, and none have been merged previously
              somethingChanged = true;
              grid[i][k-1].increaseValue();
              grid[i][k-1].mergedTop = grid[i][k].top;
              grid[i][k-1].mergedLeft = grid[i][k].left;
              grid[i][k] = null;
              merge[i][k-1] = true;
              sum += grid[i][k-1].value;
            } 
          }
        }
      }
      break;
    case (UP):
      for (let j = 0; j < SIZE; j++) { //logic is the same as in the case of left...
        for (let i = 0; i < SIZE; i++) {
          for (let k = i; k > 0; k--) {
            if (!grid[k][j]) continue;
            else if (!grid[k-1][j]) {
	      somethingChanged = true;
              grid[k-1][j] = deepCopy(grid[k][j]);
              grid[k][j] = null;
            } else if ((grid[k][j].value === grid[k-1][j].value) && !merge[k-1][j] && !merge[k][j]) {
	      somethingChanged = true;	    
              grid[k-1][j].increaseValue();
              grid[k-1][j].mergedTop = grid[k][j].top;
              grid[k-1][j].mergedLeft = grid[k][j].left;
              grid[k][j] = null;
              merge[k-1][j] = true;
              sum += grid[k-1][j].value;
            } 
          }
        }
      }
      break;
    case (RIGHT):
      for (let i = 0; i < SIZE; i++) {
        for (let j = SIZE-1; j >= 0; j--) {
          for (let k = j; k < SIZE-1; k++) {
            if (!grid[i][k]) continue;
            else if (!grid[i][k+1]) {
	      somethingChanged = true;
              grid[i][k+1] = deepCopy(grid[i][k]);
              grid[i][k] = null;
            } else if ((grid[i][k].value === grid[i][k+1].value) && !merge[i][k+1] && !merge[i][k]) {
	      somethingChanged = true;
              grid[i][k+1].increaseValue();
              grid[i][k+1].mergedTop = grid[i][k].top;
              grid[i][k+1].mergedLeft = grid[i][k].left;
              grid[i][k] = null;
              merge[i][k+1] = true;
              sum += grid[i][k+1].value;
            } 
          }
        }
      }
      break;
    case (DOWN):
      for (let j = 0; j < SIZE; j++) {
        for (let i = SIZE -1; i >= 0; i--) {
          for (let k = i; k < SIZE - 1; k++) {
            if (!grid[k][j]) continue;
            else if (!grid[k+1][j]) {
	      somethingChanged = true;
              grid[k+1][j] = deepCopy(grid[k][j]);
              grid[k][j] = null;
            } else if ((grid[k][j].value === grid[k+1][j].value) && !merge[k+1][j] && !merge[k][j]) {
	      somethingChanged = true;
              grid[k+1][j].increaseValue();
              grid[k+1][j].mergedTop = grid[k][j].top;
              grid[k+1][j].mergedLeft = grid[k][j].left;
              grid[k][j] = null;
              merge[k+1][j] = true;
              sum += grid[i][k+1].value;
            } 
          }
        }
      }
    }
    score += sum;
    return [event.keyCode, somethingChanged];
  }
function addTile(gameBoard, htmlGrid) {
  //Determines which positions can have a tile
    let freePositions = [];
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (!gameBoard[i][j]) freePositions.push([i,j]);
      }
    }
    
    //Chooses a position and fills
    let pos = Math.floor(Math.random() * freePositions.length)
    let tileToBeChosen = freePositions[pos];
    newTileAnimation(gameBoard, tileToBeChosen[0], tileToBeChosen[1], htmlGrid);
}
async function newTileAnimation(gameBoard, row, col, htmlGrid, merged) {
  //adds piece to logic
  if (!merged) gameBoard[row][col] = new Tile(); //i.e. if arg not supplied
  gameBoard[row][col].top = row;
  gameBoard[row][col].left = col;
  //creates piece for graphical purposes
  let piece = document.createElement("div");
  piece.className = "tile";
  piece.id = `${row} ${col}`;
  piece.style.backgroundColor = gameBoard[row][col].backgroundColour;
  piece.style.color = gameBoard[row][col].textColour;
  piece.innerHTML = gameBoard[row][col].value;
  //places tile of dimension 0px x 0px in the center of the tile.
  piece.style.top = ((TILE_SIZE + BORDER_SIZE) * row + BORDER_SIZE + (TILE_SIZE / 2)) + "px";
  piece.style.left = ((TILE_SIZE + BORDER_SIZE) * col + BORDER_SIZE + (TILE_SIZE / 2)) + "px";
  htmlGrid.append(piece);
  //places tile flush in the tile and resizes to 100px x 100px in 0.2s
  await sleep(1); //needed to prevent a snafu
  piece.style.top = ((TILE_SIZE + BORDER_SIZE) * row + BORDER_SIZE) + "px";
  piece.style.left = ((TILE_SIZE + BORDER_SIZE) * col + BORDER_SIZE ) + "px";
  piece.style.height = piece.style.width = TILE_SIZE + "px"; 
}
function deepCopy(tile) {
  if (!tile) return null;
  let newTile = new Tile();
  for (let prop in tile) {//no object properties so we don't worry yet
    newTile[prop] = tile[prop];
  }
  return newTile;
}
async function draw(gameBoard, htmlGrid, keyCode) {
  //checks which positions change. if they changed, fetches the dom element and updates its coords.
  let step = 1;
  let bound = gameBoard.length;
  //direction of checks follow keycode to prevent weird animations
  if (keyCode === UP || keyCode === DOWN) {
    let i = 0;
    if (keyCode === DOWN) {
      i = gameBoard.length - 1;
      step = -1;
      bound = -1;
    }
     for (i; i != bound; i += step) {
      for (let j = 0; j < gameBoard[0].length; j++) {
        if (gameBoard[i][j]) {
          let id = `${gameBoard[i][j].top} ${gameBoard[i][j].left}`;
          let curElem = document.getElementById(id);
          curElem.style.top = ((TILE_SIZE + BORDER_SIZE) * i + BORDER_SIZE) + "px";
          curElem.style.left = ((TILE_SIZE + BORDER_SIZE) * j + BORDER_SIZE) + "px";
          curElem.id = `${i} ${j}`;
          curElem.innerHTML = gameBoard[i][j].value;
          curElem.style.backgroundColor = gameBoard[i][j].backgroundColour; //needed even if no merge, or else weird errors occur
          curElem.style.color = gameBoard[i][j].textColour;
	  if (gameBoard[i][j].merged) {
	    await sleep(5);
            gameBoard[i][j].merged = false;
            id = `${gameBoard[i][j].mergedTop} ${gameBoard[i][j].mergedLeft}`;
            let mergedElem = document.getElementById(id);
            mergedElem.style.top = ((TILE_SIZE + BORDER_SIZE) * i + BORDER_SIZE) + "px";
            mergedElem.style.left = ((TILE_SIZE + BORDER_SIZE) * j + BORDER_SIZE) + "px";
            mergedElem.outerHTML = "";
	    await sleep(5);
            newTileAnimation(gameBoard, i, j, htmlGrid, true);
	    curElem.outerHTML = "";
          } else {
            curElem.style.color = gameBoard[i][j].textColour;
	    curElem.style.backgroundColor = gameBoard[i][j].backgroundColour; //twice because css works slowly
            curElem.innerHTML = gameBoard[i][j].value;
            gameBoard[i][j].top = i;
            gameBoard[i][j].left = j;
          }
	  await sleep(5);
	}
      }
    }
  } else if (keyCode === LEFT || keyCode === RIGHT) {//same logic
    let j = 0;
    if (keyCode === RIGHT) {
      j = gameBoard.length - 1;
      step = -1;
      bound = -1;
    }
     for (j; j != bound; j += step) {
      for (let i = 0; i < gameBoard[0].length; i++) {
        if (gameBoard[i][j]) {
          let id = `${gameBoard[i][j].top} ${gameBoard[i][j].left}`;
          let curElem = document.getElementById(id);
          curElem.style.top = ((TILE_SIZE + BORDER_SIZE) * i + BORDER_SIZE) + "px";
          curElem.style.left = ((TILE_SIZE + BORDER_SIZE) * j + BORDER_SIZE) + "px";
          curElem.id = `${i} ${j}`;
          curElem.innerHTML = gameBoard[i][j].value;
          curElem.style.backgroundColor = gameBoard[i][j].backgroundColour;
          curElem.style.color = gameBoard[i][j].textColour;
	  if (gameBoard[i][j].merged) {
            await sleep(5);
	    gameBoard[i][j].merged = false;
            id = `${gameBoard[i][j].mergedTop} ${gameBoard[i][j].mergedLeft}`;
            let mergedElem = document.getElementById(id);
            mergedElem.style.top = ((TILE_SIZE + BORDER_SIZE) * i + BORDER_SIZE) + "px";
            mergedElem.style.left = ((TILE_SIZE + BORDER_SIZE) * j + BORDER_SIZE) + "px";
            mergedElem.outerHTML = ""; //removes...
            await sleep(5);
	    newTileAnimation(gameBoard, i, j, htmlGrid, true);
	    curElem.outerHTML = "";  
	  } else {
	  curElem.style.color = gameBoard[i][j].textColour;
          curElem.style.backgroundColor = gameBoard[i][j].backgroundColour;
          curElem.innerHTML = gameBoard[i][j].value;
          gameBoard[i][j].top = i;
          gameBoard[i][j].left = j;
          }
	  await sleep(5);
	}
      }
    }
  }
  if (score > highScore) highScore = score;
  document.getElementById("highScore").innerHTML = `High Score:<br>${highScore}`;
  document.getElementById("score").innerHTML = `Score:<br>${score}`;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function coolBoard() { //purely for aesthetical purposes
  setTimeout(function() {
    let htmlGrid = document.getElementById("grid"); let listener = document.getElementById("game");
    let gameBoard = [];
    gameBoard.push([]); gameBoard.push([]); gameBoard.push([]); gameBoard.push([]);
    gameBoard[0].push(new Tile(8192)); gameBoard[0].push(new Tile(16384)); gameBoard[0].push(new Tile(32768)); gameBoard[0].push(new Tile(65536));
    gameBoard[1].push(new Tile(4096)); gameBoard[1].push(new Tile(2048)); gameBoard[1].push(new Tile(1024)); gameBoard[1].push(new Tile(512));
    gameBoard[2].push(new Tile(32)); gameBoard[2].push(new Tile(64)); gameBoard[2].push(new Tile(128)); gameBoard[2].push(new Tile(256));
    gameBoard[3].push(new Tile(16)); gameBoard[3].push(new Tile(8)); gameBoard[3].push(new Tile(4)); gameBoard[3].push(new Tile(2));
    highScore = 131070; //2**17 - 1 - 1
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let curElem = document.createElement("div");
        curElem.className = "tile";
        curElem.style.top = ((TILE_SIZE + BORDER_SIZE) * i + BORDER_SIZE) + "px";
        curElem.style.left = ((TILE_SIZE + BORDER_SIZE) * j + BORDER_SIZE) + "px";
        curElem.innerHTML = gameBoard[i][j].value;
        curElem.style.backgroundColor = gameBoard[i][j].backgroundColour;
        curElem.style.color = gameBoard[i][j].textColour;
        curElem.style.height = curElem.style.width = TILE_SIZE + "px";
        htmlGrid.append(curElem);
      }
    }
    document.getElementById("highScore").innerHTML = `High Score:<br>${highScore}`;
    document.getElementById("score").innerHTML = `Score:<br>${highScore}`;
  }, 10000);
}
