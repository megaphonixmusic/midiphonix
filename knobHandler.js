// Handles all 'knob' type commands

const { params } = require('./params.js');

// Define commonly used MIDI codes
const middleC = 60;
const noteOn = 144;
const noteOff = 128;
const controlChange = 176;
const programChange = 192;

// Import tempoHandler function
const tempoHandler = require('./tempoHandler.js').tempoHandler; 

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// knobHandler function
exports.knobHandler = async function(commandName, knobState, paramsNum,
    client, target, commandValues, context, output, currentTempo, tempoCooldownManager) {

    if (commandName === 'key' || commandName === 'pitch') {

        if (commandValues[0] === undefined || isNaN(Number(commandValues[0]))) {

            client.say(target, 'Please specify a value in semitones, between -12 and +12');

        }

        else {

            var semitones = Number(commandValues[0]);
            var scaledSemitones = Math.round((semitones + 12) / 0.188976378);
            output.sendMessage([controlChange, paramsNum, scaledSemitones]);

            const knobValue = parseInt(commandValues[0], 10);
            const knobId = paramsNum; // Use paramsNum as a unique identifier for each knob

            // Initialize the last known value for the knob if it doesn't exist
            if (!knobState[knobId]) {

              knobState[knobId] = { lastKnownValue: 0, isTransitioning: false, transitionTime: 0 };

            }

            // Update the last known value for the knob
            knobState[knobId].lastKnownValue = semitones;

            return knobState[knobId];

        }

    }

    else if (commandName === 'tempo' || commandName === 'bpm') {

        currentTempo = await tempoHandler(commandValues, paramsNum, client, target,
            tempoCooldownManager, context, output, currentTempo);
        
        if (currentTempo != undefined) {

            return currentTempo;

        }

    }

    else if (commandValues[0] === undefined) {

        client.say(target, 'Please specify a value 0-100%');

    }

    else {

        const knobValue = parseInt(commandValues[0], 10);
        const knobId = paramsNum; // Use paramsNum as a unique identifier for each knob

        if (knobValue > 100 || knobValue < 0) {

          client.say(target, 'Please specify a value between 0-100%');

        }

        else {

        // Initialize the last known value for the knob if it doesn't exist
        if (!knobState[knobId]) {

          knobState[knobId] = { lastKnownValue: 0, isTransitioning: false, transitionTime: 0 };

        }

        const scaledNum = Math.round((knobValue / 100) * 127);
        const transitionTime = commandValues[1] ? parseFloat(commandValues[1]) * 1000 : 0;

        if (transitionTime > 30000) {

          client.say(target, 'Please choose a duration between 1-30 seconds. Format: #[command] [value %] [seconds]');

        }

        else {

          // Check if there is an ongoing transition for the same knobId
          if (knobState[knobId].isTransitioning) {
            // Inform the user about the ongoing transition
            const remainingTime = knobState[knobId].transitionTime - (Date.now() - knobState[knobId].startTime);
            const secondsRemaining = Math.ceil(remainingTime / 1000);
            client.say(target, `Ongoing transition for command ${commandName}. Remaining time: ${secondsRemaining} seconds`);
          }
          else {
            // Start the new transition
            knobState[knobId].isTransitioning = true;
            knobState[knobId].transitionTime = transitionTime;
            knobState[knobId].startTime = Date.now();

            if (transitionTime > 0) {
              const steps = 100; // Number of steps for the transition
              const stepTime = transitionTime / steps;

              for (let i = 1; i <= steps; i++) {
                const currentValue = Math.round((i / steps) * (scaledNum - knobState[knobId].lastKnownValue)) + knobState[knobId].lastKnownValue;
                output.sendMessage([controlChange, paramsNum, currentValue]);
                // Use the last step to set the knob value accurately
                if (i === steps) {
                  output.sendMessage([controlChange, paramsNum, scaledNum]);
                }

                await sleep(stepTime);
              }
            }
            else {
              // No transition time, set the knob value immediately
              output.sendMessage([controlChange, paramsNum, scaledNum]);
              knobState[knobId].isTransitioning = false;
            }
          }

          // Update the last known value for the knob
          knobState[knobId].lastKnownValue = scaledNum;

          // The transition is complete
          knobState[knobId].isTransitioning = false;

          console.log(`* Executed ${commandName} command with scaled knob value ${scaledNum}`);

          return knobState[knobId];

        }

      }

    }
}