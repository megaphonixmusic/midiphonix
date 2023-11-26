// Handles all commands while in Performance Mode

// Imports
const perfModeOrder = require('./params.js').perfModeOrder;

exports.perfMode = function(commandName, commandValues, client, target) {

    var padNum = 1;
    
    if (!isNaN(commandValues[0])) {

        if (padNum > 12 || padNum < 0) {

            client.say(target, `Invalid value. Please select a pattern #1-4`)
    
        }

        else {

            padNum = commandValues[0];

        }

    };

    var triggerNum = (12 * perfModeOrder.indexOf(commandName)) + (padNum - 1);
    return triggerNum;

};