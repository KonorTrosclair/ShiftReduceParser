/*******************************************************************

    This file contains the table generator for the shift-reduce-parser.
    However, I am not confident in it and thus it will not be used in the final version.

********************************************************************/

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
    let transitions = [];
  
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