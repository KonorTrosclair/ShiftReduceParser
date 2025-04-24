//global variables
let grammerInput, grammerButton;
let expressionInput, expressionButton;

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
  { E: "1", T: "2", F: "3", "(": "s4", id: "s5", "+": "", "*": "", ")": "", $: "" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "s6", "*": "", ")": "", $: "acc" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "r2", "*": "s7", ")": "r2", $: "r2" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "r4", "*": "r4", ")": "r4", $: "r4" },
  { E: "8", T: "2", F: "3", "(": "s4", id: "s5", "+": "", "*": "", ")": "", $: "" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "r6", "*": "r6", ")": "r6", $: "r6" },
  { E: "", T: "9", F: "3", "(": "s4", id: "s5", "+": "", "*": "", ")": "", $: "" },
  { E: "", T: "", F: "10", "(": "s4", id: "s5", "+": "", "*": "", ")": "", $: "" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "s6", "*": "", ")": "s11", $: "" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "r1", "*": "s7", ")": "r1", $: "r1" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "r3", "*": "r3", ")": "r3", $: "r3" },
  { E: "", T: "", F: "", "(": "", id: "", "+": "r5", "*": "r5", ")": "r5", $: "r5" }
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
  grammerInput = createElement('textarea');
  grammerInput.position(1260, 50);
  grammerInput.size(200, 300);
  grammerInput.style('text-align', 'left');
  grammerInput.style('padding', '5px'); 
  grammerInput.style('font-size', '16px');
  grammerInput.style('background-color', '#E8E8E8');

  expressionInput = createElement('textarea');
  expressionInput.position(1490, 50);
  expressionInput.size(200, 300);
  expressionInput.style('text-align', 'left');
  expressionInput.style('padding', '5px'); 
  expressionInput.style('font-size', '16px');
  expressionInput.style('background-color', '#E8E8E8');

  grammerButton = createButton('Submit Grammer');
  grammerButton.position(1260, 370);
  grammerButton.size(213, 20);
  grammerButton.mousePressed(grammerParser);
  grammerButton.style('background-color', '#4CAF50');
  
  expressionButton = createButton('Submit Expression');
  expressionButton.position(1490, 370);
  expressionButton.size(213, 20);
  expressionButton.mousePressed(parse);
  expressionButton.style('background-color', '#4CAF50');

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
    if (i === currentTokenIndex) {
      fill(0, 255, 0); // Highlight current token
    } else {
      fill(0);
    }
    text(tokens[i], 1600 + (i * 20), 470);
  }
  
}

//#endregion

//#region generate table
function grammerParser() {
  let input = grammerInput.value();
  let lines = input.split('\n');

  grammar = [];

  actionArray = [];
  actionArray.push("id");

  goToArray = [];

  lines.forEach(line => {
    let parts = line.split('->');

    if (parts.length === 2) {
      let lhs = parts[0].trim();
      let rhsSymbols = parts[1].trim().split(/\s+/); // splits by any whitespace

      grammar.push({
        num: grammar.length + 1,
        lhs: lhs,
        rhs: rhsSymbols,
        rhsCount: rhsSymbols.length  // count of elements on RHS
      });

      rhsSymbols.forEach(symbol => {
        for(let char of symbol) {
          if(/[^a-zA-Z]/.test(char) && !actionArray.includes(char)) {
            actionArray.push(char);
          }
        }
      })

      for (let char of lhs) {
        //console.log(char);
        if (!goToArray.includes(char)) {
          //console.log(char);
          goToArray.push(char);
        }
      }
      
    }
  });
  //console.log(goToArray.length);
  actionArray.push("$");

  calculateStates();

  actionColumns = actionArray.length;

  goToColumns = goToArray.length;
}

function calculateStates() {
  let augmentedStart = {
    lhs: "S'",
    rhs: [grammar[0].lhs],
    dotPosition: 0
  };

  let states = [];
  let transitions = []; // optional: to record transitions

  let startState = closure([augmentedStart]);
  states.push(startState);
  let queue = [startState];

  while (queue.length > 0) {
    let currentState = queue.shift();

    let symbols = getAllSymbols(currentState);

    symbols.forEach(symbol => {
      let nextState = goTo(currentState, symbol);
      if (nextState.length === 0) return;

      // Check if this state already exists
      let existingIndex = findState(states, nextState);
      if (existingIndex === -1) {
        states.push(nextState);
        queue.push(nextState);
        existingIndex = states.length - 1;
      }

      transitions.push({
        from: states.indexOf(currentState),
        symbol: symbol,
        to: existingIndex
      });
    });
  }

  // Optional: Log or store states and transitions
  console.log("States:");
  states.forEach((state, i) => {
    console.log(`State ${i}:`);
    state.forEach(item => {
      console.log(`  ${item.lhs} -> ${item.rhs.slice(0, item.dotPosition).join(' ')} • ${item.rhs.slice(item.dotPosition).join(' ')}`);
    });
  });

  calculateGrid(states, transitions);

  totalRows = states.length + 1;
}

function closure(items) {
  let closureSet = [...items];
  let changed = true;

  while (changed) {
    changed = false;
    let newItems = [];

    closureSet.forEach(item => {
      let symbolAfterDot = item.rhs[item.dotPosition];

      if (symbolAfterDot && isNonTerminal(symbolAfterDot)) {
        grammar.forEach(rule => {
          if (rule.lhs === symbolAfterDot) {
            let newItem = {
              lhs: rule.lhs,
              rhs: rule.rhs,
              dotPosition: 0
            };

            if (!itemExistsInSet(closureSet.concat(newItems), newItem)) {
              newItems.push(newItem);
              changed = true;
            }
          }
        });
      }
    });

    closureSet = closureSet.concat(newItems);
  }

  return closureSet;
}

function goTo(state, symbol) {
  let movedItems = [];

  state.forEach(item => {
    if (item.dotPosition < item.rhs.length && item.rhs[item.dotPosition] === symbol) {
      movedItems.push({
        lhs: item.lhs,
        rhs: item.rhs,
        dotPosition: item.dotPosition + 1
      });
    }
  });

  return closure(movedItems);
}

function getAllSymbols(state) {
  let symbols = new Set();

  state.forEach(item => {
    let symbol = item.rhs[item.dotPosition];
    if (symbol) symbols.add(symbol);
  });

  return [...symbols];
}

function isNonTerminal(symbol) {
  return /^[A-Z]$/.test(symbol);
}

function findState(states, stateToFind) {
  for (let i = 0; i < states.length; i++) {
    const state = states[i];

    if (state.length !== stateToFind.length) continue;

    let match = state.every(item =>
      itemExistsInSet(stateToFind, item)
    ) && stateToFind.every(item =>
      itemExistsInSet(state, item)
    );

    if (match) return i;
  }
  return -1;
}

function itemExistsInSet(set, item) {
  return set.some(existing =>
    existing.lhs === item.lhs &&
    JSON.stringify(existing.rhs) === JSON.stringify(item.rhs) &&
    existing.dotPosition === item.dotPosition
  );
}

function calculateGrid(states, transitions) {
  console.log("calc grid called");
  SRPGrid = [];

  const firstTerminals = getFirstTerminalsOfRules();

  states.forEach((state, stateIndex) => {
    let row = {};

    transitions.forEach(trans => {
      if (trans.from === stateIndex) {
        if (isNonTerminal(trans.symbol)) {
          row[trans.symbol] = `${trans.to}`; // Goto on non-terminals
        } else {
          row[trans.symbol] = `s${trans.to}`; // Shift on terminals
        }
      }
    });

    state.forEach(item => {
      if (item.dotPosition === item.rhs.length) {
        if (item.lhs === "S'") {
          row["$"] = "acc";
        } else {
          let ruleIndex = grammar.findIndex(rule =>
            rule.lhs === item.lhs &&
            JSON.stringify(rule.rhs) === JSON.stringify(item.rhs)
          );

          actionArray.forEach(t => {
            if (!firstTerminals.has(t) && !row[t]) {
              row[t] = `r${ruleIndex + 1}`;
            }
          });

          if (!row["$"]) row["$"] = `r${ruleIndex + 1}`;
        }
      }
    });

    SRPGrid.push(row);
    
  });
  console.log(SRPGrid);
  //logSRPGrid(SRPGrid, actionArray, goToArray);
}

function getFirstTerminalsOfRules() {
  let firsts = new Set();

  grammar.forEach(rule => {
    let firstSymbol = rule.rhs[0];

    // Only include terminals (not non-terminals)
    if (!isNonTerminal(firstSymbol)) {
      firsts.add(firstSymbol);
    }
  });

  return firsts;
}


function logSRPGrid(SRPGrid, terminals, nonTerminals) {
  let table = [];

  for (let i = 0; i < SRPGrid.length; i++) {
    let row = {};
    row["State"] = i;

    for (let t of terminals) {
      row[t] = SRPGrid[i]?.[t] || "";
    }

    for (let nt of nonTerminals) {
      row[nt] = SRPGrid[i]?.[nt] || "";
    }

    table.push(row);
  }

  console.log("=== Shift Reduce Parsing Table ===");
  console.table(table);
}
//#endregion

//#region parsing logic (assignment)
//global variables for parsing logic
let previouseState = 0;
let goToToken = "";
let currentRuleNum = -1;
let actionHighlightedRow = -1;
let actionHighlightedColumn = -1;
let goToHighlightedRow = -1;
let goToHighlightedColumn = -1;
let highlightedIsGoto = false;

let improperSyntax = false;


let currentTokenIndex = 0;

function parse() {
  improperSyntax = false; //ensures that impropersyntax is reset to false at the click of "submit expression" button
  stack = ["0"]; // sets stack to start at 0 "resets stack"
  currentTokenIndex = 0; //esures the current token index is reset to 0
  let expression = expressionInput.value(); //gets the expression from the input box
  tokens = expression.match(/\w+|[^\s\w]/g); //splits the expression into tokens by dividing by whitespase

  setTimeout(stepThroughTokens, 100); // Start stepping through the tokens
}

// recursive function to ensure that each step is 1 second apart
function stepThroughTokens() {
  currentRuleNum = -1;

  // Ends the timed loop if we reach the end of the tokens
  if (currentTokenIndex >= tokens.length) {
    logStack(stack);
    return;
  }

  let parsingRow = stack[stack.length - 1]; //since the stack always has a number at the top we take that and make it the current row
  let token = tokens[currentTokenIndex]; //get the current toke which is the current position in the expression
  let action = SRPGrid[parsingRow]?.[token]; //actions are either "undefined" (error) or contain "s" (shift) or "r" (reduce) or "acc" (accept) 
  // console.log("Parsing Row: ", parsingRow);
  // console.log("Token: ", token);
  // console.log("Action: ", action);

  //marks the current row and column for marking the current position in the draw grid function
  actionHighlightedRow = parseInt(parsingRow); 
  actionHighlightedColumn = actionArray.indexOf(token);
  highlightedIsGoto = false;

  if (action !== undefined) { //ensures that the action is defined (meaning no error in parsing)
    if (action[0] === "s") { //detects shift by getting the first character 
      stack.push(token); //since its a shift action we just push the token to the stack
      stack.push(parseInt(action.substring(1))); //we also push the number after it to the stack for future parsing
    }
    else if (action[0] === "r") { //detects reduction by getting the first character
      reduce(); //calls reduce function

      // Goto highlight (based on reduction)
      if (SRPGrid[previouseState] && SRPGrid[previouseState][goToToken] !== undefined) {
        action = SRPGrid[previouseState][goToToken];
        stack.push(parseInt(action));

        //marks GOTO row and column for tracking proggression
        highlightedIsGoto = true;
        goToHighlightedRow = parseInt(previouseState);
        goToHighlightedColumn = goToArray.indexOf(goToToken);

        // console.log("Goto Hilighted Row: ", goToHighlightedRow);
        // console.log("Goto Hilighted Column: ", goToHighlightedColumn);
    
      } else {
        console.error("Invalid goto: SRPGrid[" + previouseState + "][" + goToToken + "] is undefined.");
        improperSyntax = true;
        return;
      }

      currentTokenIndex--; // since we reduce we need to stay on the current token
    }
    else if (action === "acc") { //we finished parsing the expression symbolized by landing on "acc"
      console.log("Accepted");
      logStack(stack);
      return;
    }
  } else { //the action was undefined therefore the is an error in the expression
    improperSyntax = true;
    console.error("Invalid action: SRPGrid[" + parsingRow + "][" + token + "] is undefined.");
    return;
  }

  logStack(stack);
  currentTokenIndex++; //go to the next token

  //proccess the next step after 1.5 seconds
  setTimeout(stepThroughTokens, 1500);
}


function reduce() {
  for (let rule of grammar) {
    let rhs = rule.rhs; //gets the right had side of the rule for example "E -> E + id" (rhs = "E + id")
    let matched = true; //sets a flag that determines if a match to the rhs was found
    //let tempString = ""; //sets a temporary string that only stores characters like "id" and "E" as well as opperands like "+" and "-"
    let positions = []; 

    // Check top of stack for a match with this rule's RHS
    for (let i = stack.length - 2, j = rhs.length - 1; j >= 0; i -= 2, j--) {
      if (i < 0 || stack[i] !== rhs[j]) {
        matched = false;
        break;
      }
      //tempString = rhs[j] + tempString; //appends the temporary string 
      positions.unshift(i); //adds the position of in the stack, marked by i, to the begining of the positions array
    }

    if (matched) { //if a match was found pop the rhs rule from the stack for example stack: 0 E 1 + 3 id 4 --> stack: 0 E 1
      // console.log("Matched Rule: ", rule.lhs, "->", rule.rhs.join(" "));
      // console.log("Matched string: ", tempString);

      currentRuleNum = rule.num; //get the matched rule number

      // removes the rhs rule from the stack as well as the states "numbers" next to them except the one on the
      for (let k = 0; k < rhs.length * 2; k++) {
        stack.pop();
      }

      // Now find state under the top
      let stateBelow = stack[stack.length - 1];
      goToToken = rule.lhs;
      previouseState = stateBelow;

      // Push LHS and next state (will be looked up right after reduce)
      stack.push(goToToken); // push LHS
      return; // done with reduction
    }
  }
}


function logStack(stack) {
  console.log("Current Stack: ", stack);
  let stackString = stack.join(" ");
  console.log("Stack String: ", stackString);
}

//#endregion