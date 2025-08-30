//global variables
//let grammerInput, grammerButton;
let expressionInput, expressionButton;
let nextStepButton;

let totalRows = 13;
let actionColumns = 6;
let goToColumns = 3;

let grammar = [
  {num: "1", lhs: "E", rhs: ["E", "+", "T"], rhsCount: 3},
  {num: "2", lhs: "E", rhs: ["T"], rhsCount: 1},
  {num: "3", lhs: "T", rhs: ["T", "*", "F"], rhsCount: 3},
  {num: "4", lhs: "T", rhs: ["F"], rhsCount: 1},
  {num: "5", lhs: "F", rhs: ["(", "E", ")"], rhsCount: 3},
  {num: "6", lhs: "F", rhs: ["id"], rhsCount: 1},
];

let actionArray = ["id", "+", "*", "(", ")", "$"];
let goToArray = ["E", "T", "F"];



let SRPGrid = [
  { E: "1", T: "2", F: "3",  "(": "s4", id: "s5", "+": undefined,   "*": undefined,   ")": undefined,    $: undefined },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "s6", "*": undefined,   ")": undefined,    $: "acc" },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "r2", "*": "s7", ")": "r2",  $: "r2" },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "r4", "*": "r4", ")": "r4",  $: "r4" },
  { E: "8", T: "2", F: "3",  "(": "s4", id: "s5", "+": undefined,   "*": undefined,   ")": undefined,    $: undefined },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "r6", "*": "r6", ")": "r6",  $: "r6" },
  { E: undefined,  T: "9", F: "3",  "(": "s4", id: "s5", "+": undefined,   "*": undefined,   ")": undefined,    $: undefined },
  { E: undefined,  T: undefined,  F: "10", "(": "s4", id: "s5", "+": undefined,   "*": undefined,   ")": undefined,    $: undefined },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "s6", "*": undefined,   ")": "s11", $: undefined },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "r1", "*": "s7", ")": "r1",  $: "r1" },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "r3", "*": "r3", ")": "r3",  $: "r3" },
  { E: undefined,  T: undefined,  F: undefined,   "(": undefined,   id: undefined,   "+": "r5", "*": "r5", ")": "r5",  $: "r5" }
];

console.table(SRPGrid);

let stack = ["0", ];


let goToX;

let tokens = [];

function setup() {
  createCanvas(1920, 1080);

  stroke(255);
  strokeWeight(3);

  // Use createElement to make a textarea
  // grammerInput = createElement('textarea');
  // grammerInput.position(1260, 50);
  // grammerInput.size(200, 300);
  // grammerInput.style('text-align', 'left');
  // grammerInput.style('padding', '5px'); 
  // grammerInput.style('font-size', '16px');
  // grammerInput.style('background-color', '#E8E8E8');

  expressionInput = createElement('textarea');
  expressionInput.position(1260, 50);
  expressionInput.size(200, 300);
  expressionInput.style('text-align', 'left');
  expressionInput.style('padding', '5px'); 
  expressionInput.style('font-size', '16px');
  expressionInput.style('background-color', '#E8E8E8');

  // grammerButton = createButton('Submit Grammer');
  // grammerButton.position(1260, 370);
  // grammerButton.size(213, 20);
  // grammerButton.mousePressed(grammerParser);
  // grammerButton.style('background-color', '#4CAF50');
  
  expressionButton = createButton('Submit Expression');
  expressionButton.position(1260, 370);
  expressionButton.size(213, 20);
  expressionButton.mousePressed(parse);
  expressionButton.style('background-color', '#4CAF50');

  nextStepButton = createButton('Next Step');
  nextStepButton.position(1260, 730);
  nextStepButton.mousePressed(step);

  textAlign(CENTER, CENTER);

 
}


//#region draw
function draw() {
  background(0);

  fill(0);
  strokeWeight(3);
  textAlign(CENTER, CENTER);
  // Action Border
  rect(120, 100, actionColumns * 120, totalRows * 50);

  // goTo Border
  goToX = (120 + actionColumns * 120 + 10);
  rect(goToX, 100, goToColumns * 120, totalRows * 50);

  drawActionTable();

  drawgoToTable();

  drawGrid();

  displayGrammar();

  displayExpression();
}

function drawActionTable() {

  fill(220);
  rect(120, 50, 120 * actionColumns, 50);
  fill(0);
  textSize(30);
  text("Action", 120 + (120 * actionColumns) / 2, 75);

  for(i = 0; i < totalRows; i++) {
    fill(220);
    rect(50, 100 + (i * 50), 70, 50);

    fill(0);
    textSize(20);

    (i > 0) ? text(i - 1, 85, 125 + (i * 50)) : text("State", 85, 125);
  }

  for(i = 0; i < actionColumns; i++) {
    fill(220);
    rect(120 + (i * 120), 100, 120, 50);
    fill(0);
    textSize(20);
    text(actionArray[i], 180 + (i * 120), 125);
  }

}

function drawgoToTable() {

  fill(220);
  rect(goToX, 50, goToColumns * 120, 50);
  fill(0);
  textSize(30);
  text("GoTo", goToX + (goToColumns * 120) / 2, 75);

  for(i = 0; i < goToColumns; i++) {
    fill(220);
    rect(goToX + (i * 120), 100, 120, 50);
    fill(0);
    textSize(20);
    text(goToArray[i], goToX + 60 + (i * 120), 125);
  }


}

function drawGrid() {
  // ACTIONS
  for (let i = 0; i < totalRows; i++) {
    for (let j = 0; j < actionColumns; j++) {
      // Highlight current cell
      if (i === actionHighlightedRow && j === actionHighlightedColumn && actionHighlightedColumn !== -1 && !improperSyntax) {
        fill(0, 255, 0); // Highlight shift cell in green
      } else if(i === actionHighlightedRow && j === actionHighlightedColumn  && actionHighlightedColumn !== -1 && improperSyntax) {
        fill(255, 0, 0);
      } else {
        fill(0); // Regular cell background
      }

      if(i < totalRows - 1) {
        rect(120 + (j * 120), 150 + (i * 50), 120, 50);
      } 

      fill(0); // black text
      textSize(20);
      if (SRPGrid[i] && SRPGrid[i][actionArray[j]] !== undefined) {
        text(SRPGrid[i][actionArray[j]], 180 + (j * 120), 175 + (i * 50));
      }
    }
  }


  // GOTOs
  for (let i = 0; i < totalRows; i++) {
    for (let j = 0; j < goToColumns; j++) {
      if (i === goToHighlightedRow && j === goToHighlightedColumn && highlightedIsGoto) {
        fill(0, 255, 0);
      } else {
        fill(0);
      }

      if(i < totalRows - 1) {
        rect(goToX + (j * 120), 150 + (i * 50), 120, 50); 
      } 

      fill(0);
      textSize(20);
      if (SRPGrid[i] && SRPGrid[i][goToArray[j]] !== undefined) {
        text(SRPGrid[i][goToArray[j]], goToX + 60 + (j * 120), 175 + (i * 50));
      }
    }
  }
}

function displayGrammar() {
  textAlign(LEFT, CENTER);
  for (let i = 0; i < grammar.length; i++) {
    if (grammar[i].num === currentRuleNum) {
      fill(0, 255, 0); // Green
    } else {
      fill(0); // black
    }

    textSize(20);
    text(grammar[i].num + ". " + grammar[i].lhs + " -> " + grammar[i].rhs.join(" "), 1260, 420 + (i * 30));
  }
}

function displayExpression() {
  textAlign(LEFT, CENTER);
  textSize(20);

  fill(0);
  text("Stack: ", 1490, 420); // spread vertically
  for (let i = 0; i < stack.length; i++) {
    text(stack[i], 1550 + (i * 20), 420);
  }

  text("Expression: ", 1490, 470);
  for(let i = 0; i < tokens.length; i++) {
    if (i === currentToken) {
      fill(0, 255, 0); // Highlight current token
    } else {
      fill(0);
    }
    text(tokens[i], 1600 + (i * 20), 470);
  }
  
}

//#endregion

//#region parsing logic (assignment)
//global variables
let previouseState = 0;
let goToToken = "";

let currentRuleNum = -1;
let actionHighlightedRow = -1;
let actionHighlightedColumn = -1;
let goToHighlightedRow = -1;
let goToHighlightedColumn = -1;

let highlightedIsGoto = false;

let improperSyntax = false;


let currentToken = 0;

function parse() {
  improperSyntax = false; //ensures that impropersyntax is reset to false at the click of "submit expression" button
  stack = ["0"]; // sets stack to start at 0 "resets stack"
  currentToken = 0; //esures the current token index is reset to 0
  let expression = expressionInput.value(); //gets the expression from the input box
  tokens = expression.split(" "); //splits the expression into tokens

  actionHighlightedRow = -1;
  actionHighlightedColumn = -1;
  goToHighlightedRow = -1;
  goToHighlightedColumn = -1;

  //setTimeout(step, 100); // Start stepping through the tokens
}


function step() {
  currentRuleNum = -1;

  

  let parsingRow = stack[stack.length - 1]; 
  let token = tokens[currentToken]; 
  let action = SRPGrid[parsingRow]?.[token]; 
  // console.log("Parsing Row: ", parsingRow);
  // console.log("Token: ", token);
  // console.log("Action: ", action);

 
  actionHighlightedRow = parseInt(parsingRow); 
  actionHighlightedColumn = actionArray.indexOf(token);
  highlightedIsGoto = false;

  if (action !== undefined) { 
    if (action[0] === "s") { 
      stack.push(token); 
      stack.push(parseInt(action.substring(1))); 
    }
    else if (action[0] === "r") { 
      let validReduction = false;
      validReduction = reduce(parseInt(action.substring(1))); 

      // Goto highlight (based on reduction)
      if (validReduction && SRPGrid[previouseState] && SRPGrid[previouseState][goToToken] !== undefined) { //takes advantage of short circuit evaluation (from class)
        action = SRPGrid[previouseState][goToToken];
        stack.push(parseInt(action));

        //marks GOTO row and column for tracking proggression
        highlightedIsGoto = true;
        goToHighlightedRow = parseInt(previouseState);
        goToHighlightedColumn = goToArray.indexOf(goToToken);

        // console.log("Goto Hilighted Row: ", goToHighlightedRow);
        // console.log("Goto Hilighted Column: ", goToHighlightedColumn);
    
      } else {
        improperSyntax = true;
        return; //halt all parcing since we landed on an undefined square in the goto table
      }

      currentToken--; 
    }
    else if (action === "acc") { //we finished parsing the expression symbolized by landing on "acc"
      console.log("Accepted");
      logStack(stack);
      return;
    }
  } else { //the action was undefined therefore the is an error in the expression
    improperSyntax = true;
    return; //halt all parsing since we landed on an undefined square
  }

  //logStack(stack);
  currentToken++; //go to the next token
}


function reduce(ruleNum) {
  let rhs; //gets the right had side of the rule for example "E -> E + id" (rhs = "E + id")
  let matched = true; //sets a flag that determines if a match to the rhs was found
  let matchedRule;
  for (let rule of grammar) {
    if (parseInt(rule.num) == ruleNum) {
      rhs = rule.rhs;
      matchedRule = rule;
      console.log("rhs: ", rhs);
      break;
    }
  }

    // Check top of stack for a match with this rule's RHS
    for (let i = stack.length - 2, j = rhs.length - 1; j >= 0; i -= 2, j--) {
      if ((i < 0 || stack[i] !== rhs[j])) { //no match found
        matched = false;
        break;
      }
      
    }

    if (matched) { //if a match was found pop the rhs rule from the stack for example stack: 0 E 1 + 3 id 4 --> stack: 0 E 1
      // console.log("Matched Rule: ", rule.lhs, "->", rule.rhs.join(" "));
      // console.log("Matched string: ", tempString);

      currentRuleNum = ruleNum; //get the matched rule number

      // removes the rhs rule from the stack loops for double the length of rhs
      for (let k = 0; k < rhs.length * 2; k++) {
        stack.pop();
      }

      // Now find state under the top
      let stateBeforeRHS = stack[stack.length - 1]; //now that stack is popped the state equals the number brefore the RHS
      goToToken = matchedRule.lhs; //set the goTO token to be the LHS of the RHS
      previouseState = stateBeforeRHS; //sets global variable previous state

      // Push LHS and next state (will be looked up right after reduce)
      stack.push(goToToken); // push LHS
      return true;
    } else {
      return false;
    }

}


function logStack(stack) {
  console.log("Current Stack: ", stack);
  let stackString = stack.join(" ");
  console.log("Stack String: ", stackString);
}

//#endregion