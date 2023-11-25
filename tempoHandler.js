// Handles #tempo and #bpm commands for knobHandler

// Define commonly used MIDI codes
const middleC = 60;
const noteOn = 144;
const noteOff = 128;
const controlChange = 176;
const programChange = 192;

// tempoHandler function
exports.tempoHandler = async function(commandValues, paramsNum, client, target,
    tempoCooldownManager, context, output, currentTempo) {

        const tempoCooldownResult = await tempoCooldownManager.executeFunctionAsync();

        if (tempoCooldownResult || context.badges.broadcaster == 1) {

          if (commandValues[0] < 80 || commandValues[0] > 207) {

            client.say(target, 'Please select a tempo between 80-207 BPM');

          }

          else if (commandValues[0] === undefined) {

            client.say(target, 'Please specify a tempo. Example: "#tempo 128"');

          }

          else {

            output.sendMessage([controlChange,paramsNum,commandValues[0]-80]);
            currentTempo = commandValues[0];
            console.log(`* Executed #tempo command with value ${currentTempo}`);
            return currentTempo;

          }

        }

        else {

          // The function is on cooldown, inform the user
          const remainingTime = tempoCooldownManager.cooldownTime - (Date.now() - tempoCooldownManager.lastExecutionTime);
          const secondsRemaining = Math.ceil(remainingTime / 1000);
          client.say(target, `Function is on cooldown. Remaining time: ${secondsRemaining} seconds`);

        }

      }