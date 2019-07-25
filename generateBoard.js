function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
main();
async function main() {
  document.getElementById("game").style.display = "none";
  let size = 0;
  setTimeout(function() {
    size = prompt("size?");
    if (size <= 3 || !size) {
      size = 3;
      let scoreBoxes = document.getElementsByClassName("score");
      let title = document.getElementById("title");
      
      scoreBoxes[0].style.height = "50px";
      scoreBoxes[0].style.width = "100px";
      scoreBoxes[1].style.height = "50px";
      scoreBoxes[1].style.width = "100px";
      title.style.height = "50px";
      title.style.width = "75px";
    } else if (size > 8) size = 8;
    let game = document.getElementById("game");
    let grid = document.getElementById("grid");
    game.style.opacity = 0;
    game.style.display = "block";
    grid.style.opacity = 0;
    grid.style.display = "block";

    game.style.width = (125 * size) + "px";
    game.style.height = (166 + 125 * size) + "px";
    grid.style.height = grid.style.width = (112.5 * size) + "px";
    grid.style.left = ((parseInt(game.style.width) - parseInt(grid.style.width)) / 2) + "px";
    let gridTiles = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let tile = document.createElement("div");
        tile.style.top = (110 * i + 10) + "px"; //110 for the tile + border, + 10 for the initial border offset
        tile.style.left = (110 * j + 10) + "px";
        tile.className = "defaultTile";
	gridTiles.push(tile);
      }
    }
    grid.append(...gridTiles);
    let opacity = 0;
    let id = setInterval(function () {
      opacity += 0.01;
      game.style.opacity = opacity;
      grid.style.opacity = opacity;
      if (opacity > 1) clearInterval(id);
    },10);
    grid.setAttribute("size", size);
  } , 1200);
}
