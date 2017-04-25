/*
MIT License
Copyright (c) 2017 Emiliano Carrillo Moncayo
https://github.com/emiliano-carrillo/Elementary-Cellular-Automata
*/

// -- SPLASHSCREEN --
function hideSplashScreen() {
  $("#SplashScreen").css({
    "-webkit-transition-duration" : "0.4s",
    "display" : "none",
  });
  $("#ControlPanel").css("display", "block");
}

/* -- CELLUALAR AUTOMATA -- */
//GLOBAL Variables
var windowW;
var controlPanelHeight = $("#ControlPanel").height();
var numberOfCells;
var finalGeneration =  $("#finalGenIn").val();
var ruleset = $("#rulesetIn").val();
var defRuleset;
var randomState;
var medianaCell;
var rulesetArray = [];

var aliveColor;
var deadColor;

var cellx, celly;
var cells = [];

//My Cell Object
function Cell(i, cellLength, x, y, gen){
  //Gets the colors in in hex and converts to rgb from color input
  aliveColor = $("#aliveColor").val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)});
  deadColor = $("#deadColor").val().match(/[A-Za-z0-9]{2}/g).map(function(v) { return parseInt(v, 16)});
  this.alive = false;
  this.x = x;
  this.y = y;
  this.length = cellLength;
  this.generation = gen;
  this.display = function(alive){
    alive == false ? fill( deadColor[0], deadColor[1], deadColor[2]) : fill( aliveColor[0], aliveColor[1], aliveColor[2]);
    rect(this.x, this.y, this.length, this.length);
  }
}


//  FUNCTIONS

function drawFirstGen(firstTime){
  //Calculate the length of each cell given the window size and num of Cells
  background(250, 250, 250);
  windowW = $(window).width();
  numberOfCells = $('#cellNumIn').val();
  var cellLength = windowW/numberOfCells;
  //Check if it is the first time to run this function
  if (firstTime == true) {
    for (var i = 0; i < numberOfCells; i++) {
      cellx = i*cellLength;
      celly = 0;
      cells[i] = new Cell(i , cellLength, cellx, celly, 0);
    }
  }
  //Draw an array of cells
  for (var i = 0; i < numberOfCells; i++) {
    cells[i].x = i*cellLength;
    cells[i].y = 0;
    cells[i].length = cellLength;
    stroke(	52, 73, 94, 50);
    cells[i].display(cells[i].alive);
  }
}

function detectClickedCell(){
  //For every cell, compare if it has been clicked given the distance.
  //Change state if it has been clicked.
  for (var i = 0; i <numberOfCells; i++) {
    var centerXOfCell =  (i *  cells[i].length) + (cells[i].length / 2);
    var centerYOfCell = cells[i].length / 2;
    var distanceOfClick = dist(mouseX, mouseY, centerXOfCell, centerYOfCell);
    var radius = cells[i].length/2;
    //Wanted... Dead or alive?
    if (distanceOfClick < radius) {
      cells[i].alive == true ? cells[i].alive = false : cells[i].alive = true;
      drawFirstGen(false);
    }
  }
}

function incorrectRuleset(){
  alert("Please type any positive integer less than 255,\nor type any 8Digit binary number.");
  document.getElementById("rulesetIn").value = 110;
  defRuleset = "01101110";
}

function calculateRuleset(){
  var bin = 0;
  if (ruleset.length <= 3) {
    //It's an Integer
    //If it is an integer on the range [0,255], convert to binary, else error.
    (ruleset >= 0 && ruleset <= 255) ? defRuleset = ("00000000"+(ruleset >>> 0).toString(2)).substr(-8): incorrectRuleset();
  } else if (ruleset.length == 8) {
    //It has 8 Characters
    for (var i = 0; i < ruleset.length; i++) {
      if (ruleset[i] == 0 || ruleset[i] == 1){ bin += 1; }
    }
    //If it is made out of 1s and 0s, correct
    bin == 8 ? defRuleset = ruleset : incorrectRuleset();
  } else{ incorrectRuleset(); }
}

function printStartingValues(){
  console.log("Ruleset:", defRuleset, " CellsPGen:", numberOfCells, "End:", finalGeneration);
}

function makeAnArrayOutOfRuleset(){
  calculateRuleset();
  for (var i = 0; i < defRuleset.length; i++) {
    (defRuleset[i] == 1) ? rulesetArray[i] = true : rulesetArray[i] = false;
  }
}

function checkBorder(){
  document.getElementById("checkBorder").checked == true ? stroke(	52, 73, 94, 50): noStroke();
}

function showLoader(loadingProgress){
  $("#Loader").css({
    "display" : "block",
  });
}


function hideLoader(loadingProgress){
  $("#Loader").css({
    "display" : "none",
  });
}



function printAllGenerations(){

  var loadingProgress;
  var thisGen = [];
  thisGen = cells;
  var height = cells[0].length * finalGeneration + controlPanelHeight;
  resizeCanvas(windowWidth, height);

  background(250, 250, 250);

  for (var i = 0; i < numberOfCells; i++) {
    //Display gen0 or UserGen
    thisGen[i].display(thisGen[i].alive);
  }

  for (var gen = 1; gen < finalGeneration; gen++) {

    var nextGen = [];
    for (var i = 0; i < numberOfCells; i++) {
      //Create other Object Array
      var nextGenCellX = i * thisGen[i].length;
      var nextGenCellY = (gen) * thisGen[i].length;
      nextGen[i] = new Cell(i , thisGen[i].length, nextGenCellX, nextGenCellY, gen);
    }

    for (var i = 0; i < numberOfCells; i++) {
      //Variables in order to understand
      var leftCell, rightCell;
      var meCell = thisGen[i];
      //Identificar celdas de los extremos y su vecinos
      (i == 0) ? leftCell = thisGen[numberOfCells-1] : leftCell = thisGen[i-1];
      (i == numberOfCells-1) ? rightCell = thisGen[0] : rightCell = thisGen[i+1];

      //RULESET
      if (leftCell.alive == true && meCell.alive == true && rightCell.alive == true) {
        //Rule 1
        nextGen[i].alive = rulesetArray[0];
      }else if (leftCell.alive == true && meCell.alive == true && rightCell.alive == false)  {
        //Rule 2
        nextGen[i].alive = rulesetArray[1];
      } else if (leftCell.alive == true && meCell.alive == false && rightCell.alive == true) {
        //Rule 3
        nextGen[i].alive = rulesetArray[2];
      } else if (leftCell.alive == true && meCell.alive == false && rightCell.alive == false) {
        //Rule 4
        nextGen[i].alive = rulesetArray[3];
      } else if (leftCell.alive == false && meCell.alive == true && rightCell.alive == true) {
        //Rule 5
        nextGen[i].alive = rulesetArray[4];
      } else if (leftCell.alive == false && meCell.alive == true && rightCell.alive == false) {
        //Rule 6
        nextGen[i].alive = rulesetArray[5];
      } else if (leftCell.alive == false && meCell.alive == false && rightCell.alive == true) {
        //Rule 7
        nextGen[i].alive = rulesetArray[6];
      } else if (leftCell.alive == false && meCell.alive == false && rightCell.alive == false) {
        //Rule 8
        nextGen[i].alive = rulesetArray[7];
      }

      nextGen[i].display(nextGen[i].alive);
    }

    loadingProgress = gen*100/finalGeneration;
    console.log(loadingProgress);

    for (var i = 0; i < numberOfCells; i++) {
      thisGen[i] = nextGen[i];
    }
  }

  hideLoader();
}


/* -- EVENTS -- */
/* THIS BLOCK OF CODE WAITS FOR THE USER TO STOP TYPING*/
var timerid;
$("#cellNumIn").on("input",function(e){
    var value = $(this).val();
    if($(this).data("lastval")!= value){
        $(this).data("lastval",value);
        clearTimeout(timerid);
        timerid = setTimeout(function() {
          //Change the Cells Per Generation and the print them
          drawFirstGen(true);
        },800);
    };
});

$("#finalGenIn").on("input",function(e){
    var value = $(this).val();
    if($(this).data("lastval")!= value){
        $(this).data("lastval",value);
        clearTimeout(timerid);
        timerid = setTimeout(function() {
          //Change the final genaration index
          finalGeneration =  $("#finalGenIn").val();
        },800);
    };
});

$("#rulesetIn").on("input",function(e){
    var value = $(this).val();
    if($(this).data("lastval")!= value){
        $(this).data("lastval",value);
        clearTimeout(timerid);
        timerid = setTimeout(function() {
          //Change the ruleset and then calculate the rule number
          ruleset = $("#rulesetIn").val();
          if (ruleset == ""){incorrectRuleset();}
          calculateRuleset();
        },800);
    };
});

$("#startBtn").click(function(){
  makeAnArrayOutOfRuleset();
  printStartingValues();
  checkBorder();
  //The computer waits for the loader to appear
  setTimeout(function(){
  showLoader();
  }, 1);
  setTimeout(function(){
    printAllGenerations();
  }, 1000);
  });

$("#resetBtn").click(function(){
  setup();
});

$("#randomize").click(function(){
  // Gives 1 or 0 at random
  for (var i = 0; i < numberOfCells; i++) {
    randomState = Math.floor(Math.random() * 2);
    randomState == 1 ? cells[i].alive = true : cells[i].alive = false;
  }
  drawFirstGen(false);
});

$("#oneInTheMiddle").click(function(){
  for (var i = 0; i < numberOfCells; i++) {
    cells[i].alive = false
  }
  medianaCell = Math.floor(numberOfCells/2);
  cells[medianaCell].alive = true;
  drawFirstGen(false);
});

/* -- CANVAS CODE -- */
function setup() {
  //Canvas en la parte superior
  var grid = createCanvas(windowWidth, windowHeight-controlPanelHeight);
  drawFirstGen(true);
  hideLoader();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight-controlPanelHeight);
  drawFirstGen(false);
}

function mouseClicked(){
  detectClickedCell();
}
