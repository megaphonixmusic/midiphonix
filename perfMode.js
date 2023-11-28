// Handles all commands while in Performance Mode

// Imports
const perfModeOrder = require('./params.js').perfModeOrder;

exports.perfMode = function(commandName, commandIndex, commandValues) {

    var padNum = 1;

    // Init triggerNum with Pad 5, default stop track (empty pad)
    var triggerNum = (12 * commandIndex) + 4;
    
    if (isNaN(commandValues[0])) {

        if (commandValues[0] === 'stop' || commandValues[0] === 'off') {

            return triggerNum;

        }
        
        else {

            if (commandValues.length == 0) {

                triggerNum = (12 * commandIndex);
                return triggerNum;
        
            }

            else {

                return undefined;
            
            }
        }

    }

    else {

        if (padNum > 4 || padNum < 1) {

            return undefined;
    
        }

        else {

            padNum = commandValues[0];

        }

    };

    triggerNum = (12 * commandIndex) + (padNum - 1);
    return triggerNum;

};