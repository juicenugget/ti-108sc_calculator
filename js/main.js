$(document).ready(main);

function main() {
  var calc = new Calculator(true);

  $('#helpBar').on('click',function() {
    $('#myModal').modal('show');
  });
  $('#buttons button').on('click',calc.btnHandler);
  $('body').on('keypress',calc.keyHandler);
}

var Calculator = function(orderOfOperations) {
  //buttons
  var numbersButtons = ['0','1','2','3','4','5','6','7','8','9','.'];
  var displayUpdateButtons = numbersButtons.concat(['+/-','%','√']);
  var operationsButtons = ['+','-','×','÷','='];
  var memoryButtons = ['MRC', 'M-', 'M+'];

  //display
  var runningTotal, calculations = [], operationApplied = false, priorDisplayVal, priorOperator, priorCalculations = [], onButtonClickedOnce = false, followOrderOfOperations = orderOfOperations, equalsHit = false, memoryValue = 0, memoryButtonClickedOnce = false, displayVal, displayValStr = '', priorDisplayValStr, lastPressedOperator;
  var currentDisplay = $('#display');

  //MDAS toggle switch
  $('#calcTypeToggle').bootstrapSwitch('size', 'mini');
  $('#calcTypeToggle').bootstrapSwitch('onColor', 'success');
  $('#calcTypeToggle').bootstrapSwitch('offColor', 'danger');
  $('#calcTypeToggle').bootstrapSwitch('inverse',' true');
  $('#calcTypeToggle').bootstrapSwitch('labelText', 'MDAS');
  $('#calcTypeToggle').bootstrapSwitch('state',followOrderOfOperations);
  $('#calcTypeToggle').bootstrapSwitch('onSwitchChange',function(event, state) {calculations=[]; runningTotal = undefined; currentDisplay.val(''); displayVal = 0; followOrderOfOperations = state;});

  var clearDisplay = function() {
    setNegativeIndicator(true);
    currentDisplay.val('');
  };

  //returns true if the indicator is gray (positive number or 0), false otherwise
  var getNegativeIndicator = function() {return $('#negativeIndicator').hasClass('gray');};
  var setNegativeIndicator =function(bool) {if (typeof bool === 'boolean') bool ? $('#negativeIndicator').addClass('gray') : $('#negativeIndicator').removeClass('gray');};
  var toggleNegativeIndicator = function() {$('#negativeIndicator').toggleClass('gray')};

  var getErrorIndicator = function() {return !$('#errorIndicator').hasClass('gray');};
  var setErrorIndicator = function(bool) {if (typeof bool === 'boolean') bool ? $('#errorIndicator').removeClass('gray') : $('#errorIndicator').addClass('gray');};

  var getDisplayStr = function() {return currentDisplay.val();};

  //validates input and sets the display
  var setDisplay = function() {

    if (!isFinite(displayVal) || displayVal > 99999999 || displayVal < -99999999) {
      setErrorIndicator(true);
      clearDisplay();
      return;
    }
    else {
      var displayValLength = ('' + displayVal).split('').filter(function(x) {return Number.isInteger(+x);}).length;
      if (displayValLength > 8) {
        var decimalPosition = ('' + displayVal).indexOf('.');

        displayValStr = '' + +Math.abs(displayVal).toFixed(8 - decimalPosition);
        //displayValStr = '' + +Math.abs(displayVal).toPrecision(8);
      }
      else displayValStr = '' + Math.abs(displayVal);
    }

    currentDisplay.val(displayValStr);
    if (displayVal < 0) setNegativeIndicator(false);
    else setNegativeIndicator(true);
  };

  //button handler
  this.btnHandler = function()  {
  var buttonCaption = $(this).text();
  setTimeout(function() {$(this).blur();}.bind(this),200);
  if (getErrorIndicator()) {
    if (buttonCaption === 'ON/C') {
    clearDisplay();
    setErrorIndicator(false);
    }
    else return;
  }

  if (buttonCaption !== 'ON/C') onButtonClickedOnce = false;
  if (buttonCaption !== 'MRC') memoryButtonClickedOnce = false;

  if (displayUpdateButtons.indexOf(buttonCaption) !== -1) updateDisplay(buttonCaption);
  else if (operationsButtons.indexOf(buttonCaption) !== -1) {
    lastPressedOperator = buttonCaption;
    if (followOrderOfOperations) updateCalculations(buttonCaption);
    else updateRunningTotal(buttonCaption);
  }
  else if (buttonCaption === 'ON/C') {
    if (onButtonClickedOnce) {
      if (followOrderOfOperations) {
        calculations = [];
        priorCalculations = [];
        equalsHit = false;
      }

      else runningTotal = undefined;

      onButtonClickedOnce = false;
    }
    else {
      displayVal = 0;
      setDisplay();
      onButtonClickedOnce = true;
      }
    }
  else if (memoryButtons.indexOf(buttonCaption) !== -1) memoryHandler(buttonCaption);
  };

  //keyboard handler
  this.keyHandler = function(event) {
    var keyMap = {43:'+', 45:'-', 42:'×', 47:'÷', 92:'÷', 13:'=', 32:'ON/C', 37:'%', 36:'√', 35:'+/-', 109:'M+', 110:'M-', 98:'MRC'};

  var key = event.which, buttonToClick;
  var keyChar = String.fromCharCode(key);

  if (key === 96) {
    $('#calcTypeToggle').bootstrapSwitch('state',!followOrderOfOperations);
    return;
  }
  if (key === 104) {
    $('#myModal').modal('show');
    return;
  }

  keyChar = numbersButtons.indexOf(keyChar) !== -1 ? keyChar : keyMap[key];

  buttonToClick = $('#buttons button').filter(function() {return $(this).text() === keyChar;});

  buttonToClick.focus();
  buttonToClick.trigger('click');
  };

  //memory Handler
  function memoryHandler(mButton) {
  //priorDisplayValStr = getDisplayStr();
  priorDisplayVal = displayVal * (getNegativeIndicator() ? 1 : -1);

  if (mButton === 'M+') {
    if (!isFinite(memoryValue + priorDisplayVal) || (memoryValue + priorDisplayVal) > 99999999 || (memoryValue + priorDisplayVal) < -99999999) {
      clearDisplay();
      setErrorIndicator(true);
    }
    else {
          memoryValue += priorDisplayVal;
          operationApplied = true;
    }
  }

  else if (mButton === 'M-') {
    if (!isFinite(memoryValue - priorDisplayVal) || (memoryValue - priorDisplayVal) > 99999999 || (memoryValue - priorDisplayVal) < -99999999) {
      clearDisplay();
      setErrorIndicator(true);
    }
    else {
      memoryValue -= priorDisplayVal;
      operationApplied = true;
    }
  }

  else {
    if (memoryButtonClickedOnce) {
      memoryValue = 0;
      memoryButtonClickedOnce = false;
    }

    else {
      displayVal = memoryValue;
      setDisplay();
      priorDisplayValStr = displayValStr;
      operationApplied = true;
      memoryButtonClickedOnce = true;
      }
    }
  if (memoryValue === 0) $('#memoryIndicator').addClass('gray');
  else $('#memoryIndicator').removeClass('gray');
  };

  var updateDisplay = function(char) {
  var displayLength = displayValStr.split('').filter(function(x) {return Number.isInteger(+x);}).length;

    if (numbersButtons.indexOf(char) !== -1) {
      if (operationApplied && displayValStr === priorDisplayValStr) {
        clearDisplay();
        displayValStr = '';
        displayLength = 0;
        operationApplied = false;
      }

      if (displayLength < 8  && ((char === '.' && displayValStr.indexOf(char) === -1) || char !== '.')) {

        if (displayValStr === '' && char === '.') char = '0.';
        displayValStr = (displayValStr === '0' && char !=='.' ? '' : displayValStr) + char;
        currentDisplay.val(displayValStr);
        displayVal = +displayValStr * (getNegativeIndicator() ? 1 : -1);
      }
    }
    else {
      if (displayValStr !== '') {
        displayVal = +displayValStr * (getNegativeIndicator() ? 1 : -1);
        if (char === '%') {
          var priorOperation = priorCalculations[1];
          if (calculations.length === 0 && runningTotal === undefined) displayVal = displayVal / 100;
          else displayVal = priorDisplayVal * (displayVal / 100);
          setDisplay();
          operationApplied = true;
          priorDisplayValStr = displayValStr;
        }

        else if (char === '√') {
          displayVal = Math.sqrt(displayVal)
          setDisplay();
          operationApplied = true;
          priorDisplayValStr = displayValStr;
        }

      else if (char === '+/-' && displayValStr !== '') {
        toggleNegativeIndicator();
        }
      }
    }
  };

  //update the calculations array -- MDAS mode
  var updateCalculations = function(operator) {
  var calculationsLength = calculations.length;

  if (displayValStr !== '') {
    if (operator !== '=') {
      priorCalculations = [displayVal * (getNegativeIndicator() ? 1 : -1), operator];
      calculations = calculations.concat(priorCalculations);
      priorDisplayValStr = displayValStr;
      priorDisplayVal = displayVal * (getNegativeIndicator() ? 1 : -1);
      operationApplied = true;
    }

    else {
      calculations.push(displayVal * (getNegativeIndicator() ? 1 : -1));
      calcTotal();
      }
    }
  };

  //calculate the calculations array -- MDAS mode
 var calcTotal = function() {
  var calculationsLength = calculations.length, addInCalc, subInCalc, multInCalc, divInCalc, operationIndex, tmp;
    priorCalculations = calculations.slice(-2);

  while (calculations.find(function(x) {return operationsButtons.indexOf(x) !== -1;})) {
    if (calculations.find(function(x) {return ['×', '÷'].indexOf(x) !== -1;})) {

      multInCalc = calculations.indexOf('×');
      divInCalc = calculations.indexOf('÷');

      if (divInCalc === -1 || (divInCalc !== -1 && multInCalc !== -1 && multInCalc < divInCalc)) {
        operationIndex = multInCalc;
        tmp = calculations[multInCalc - 1] * calculations[multInCalc + 1];
      }
      else {
        operationIndex = divInCalc;
        tmp = calculations[divInCalc - 1] / calculations[divInCalc + 1];
      };
    }
    else if (calculations.find(function(x) {return ['+', '-'].indexOf(x) !== -1;})) {
      addInCalc = calculations.indexOf('+');
      subInCalc = calculations.indexOf('-');

      if (subInCalc === -1 || (subInCalc !== -1 && addInCalc !== -1 && addInCalc < subInCalc)) {
        operationIndex = addInCalc;
        tmp = calculations[addInCalc - 1] + calculations[addInCalc + 1];
      }
      else {
        operationIndex = subInCalc;
        tmp = calculations[subInCalc - 1] - calculations[subInCalc + 1];
      }
    }
    calculations.splice(operationIndex, 2);
    calculations[operationIndex - 1] = tmp;
  }

  displayVal = calculations[0];
  clearDisplay();
  setTimeout(function() {setDisplay();
                         priorDisplayValStr = displayValStr;
                         priorDisplayVal = displayVal;
                         operationApplied = true;
                        }, 200);
  calculations = [];
  };

  //running Total - continuous calculation mode
  var updateRunningTotal = function(operator) {
  var currentDisplayVal;
  displayVal = displayVal * (getNegativeIndicator() ? 1 : -1);
  currentDisplayVal = displayVal;


    if (operator === '=' && equalsHit) {
    operator = priorCalculations[1];
    displayVal = priorCalculations[0];
  }

  else {
    priorCalculations = [];
    equalsHit = false;
  }

  if (priorOperator !== undefined) {
    switch(priorOperator) {
      case '+':
      runningTotal = runningTotal === undefined ? displayVal : runningTotal + displayVal;
      break;

      case '-':
      runningTotal = runningTotal === undefined ? displayVal : runningTotal - displayVal;
      break;

      case '×':
      runningTotal = runningTotal === undefined ? displayVal : runningTotal * displayVal;
      break;

      case '÷':
      runningTotal = runningTotal === undefined ? displayVal : runningTotal / displayVal;
      break;
    }
  }
  else runningTotal = displayVal;

  displayVal = runningTotal;
  if (operator === '=') {
    clearDisplay();
    setTimeout(function() {
                           setDisplay();
                           priorDisplayValStr = displayValStr;
                           priorDisplayVal = displayVal;
                           operationApplied = true;}, 200);
  }
  else setDisplay();

  priorDisplayValStr = displayValStr;
  priorDisplayVal = displayVal;
  operationApplied = true;
  if (operator !== '=') {
    priorOperator = operator;
    priorCalculations = [currentDisplayVal,operator];
  }
  else if (!equalsHit) {
    priorCalculations = [currentDisplayVal, operator];
    equalsHit = true;
    }
  };
}
