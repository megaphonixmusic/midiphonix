/*

MIDIPHONIX
by Megaphonix

*/

// Imports
const opts = require('./credentials.js').opts;
const noteToMidi = require('./noteToMidi.js').noteToMidi;
const params = require('./params.js').params;
const muteNums = require('./params.js').mutes;
const parseNotes = require('./parseNotes.js').parseNotes;
const drumGroup = params.slice(6,11);
const instGroup = params.slice(15,19);

const tmi = require('tmi.js');
const midi = require('midi');

// Import the CooldownManager class
const CooldownManager = require('./cooldownManager');
// Create a tempoCooldownManager instance with a 20-second cooldown (and clear it immediately)
const tempoCooldownManager = new CooldownManager(20000);
tempoCooldownManager.lastExecutionTime = 20001;
// Create an fxCooldownManager instance for knob transitions
const fxCooldownManager = new CooldownManager(2000); // 2 seconds cooldown
// Initialize an object to store the last known knob values
const knobState = {};

// Define commonly used MIDI codes
const middleC = 60;
const noteOn = 144;
const noteOff = 128;
const controlChange = 176;
const programChange = 192;
const startPlayback = 250;
const stopPlayback = 252;

// MIDI init
const output = new midi.Output();
const transOut = new midi.Output();
const devices = [];
// Open loopMIDI Port
const portCount = output.getPortCount();
for (let i=0;i<portCount;i++) {
  devices.push(output.getPortName(i));
}
const loopPort = devices.indexOf('loopMIDI Port');
const transportOutputPort = devices.indexOf('transportControls');
output.openPort(loopPort);
transOut.openPort(transportOutputPort);

// Create a Twitch chat client with the credentials found in 'credentials.js'
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Initialize tempo to 120 BPM (-80 = 40cc#)
output.sendMessage([controlChange, params[4][2], 40]);
var currentTempo = 120;

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}



// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {

  if (self) { return; } // Ignore messages from the bot

  const contents = msg.toLowerCase().split(' ');
  
  // First word of the message should ALWAYS be the presumed command name
  const commandName = contents[0];

  // ONLY PROCEED IF MESSAGE IS A #COMMAND, otherwise do nothing
  if (commandName.startsWith('#')) {

    // Parse all non-command params and init array of note(s)
    var commandValues = contents.slice(1);

    // Find corresponding command entry in params.js
    var paramsIndex = params.indexOf(params.find(arr => arr.includes(commandName)));

    // If command is not found in params.js, throw error + chat msg
    if (paramsIndex == -1) {
      client.say(target, `Unknown command ${commandName}`);
      console.log(`* Unknown command ${commandName}`);
    }

    // Otherwise, proceed:
    else {

      // Help command
      if (commandName === '#help') {
        client.say(target, 'Available MIDI commands can be found here: https://mgphx.me/MIDIphonix')
        console.log(`* Executed ${commandName} command`);
      }

      /*
      else if (commandName === '#?tempo') {
        
        client.say(target, `Current tempo: ${currentTempo}`);

      }
      */

      else {

        var paramsType = params[paramsIndex][1];
        var paramsNum = params[paramsIndex][2];

        if (paramsType === 'play' || paramsType === 'pause') {

          output.sendMessage([paramsNum]);

        }

        else if (paramsType === 'record') {

          var recDuration = 5;

          if (commandValues[0] > 20 || commandValues[0] < 5) {

            client.say(target, 'Record length limited to 5-20 seconds');

          }

          else {

            if (commandValues[0] != undefined) {

              recDuration = commandValues[0];

            }

            const recStart = [0xF0, 0x7F, 0x7F, 0x06, 0x06, 0xF7];
            const recStop = [0xF0, 0x7F, 0x7F, 0x06, 0x07, 0xF7];
            var recCountdownTime = 0;// ((60 / currentTempo)) * 4;
            console.log(recCountdownTime);
            console.log(`Sending record message for ${recDuration} on ${transportOutputPort}`);
            transOut.sendMessage(recStart);
            output.sendMessage([251]);
            await sleep((recDuration * 1000) + (recCountdownTime * 1000));
            // output.sendMessage([252]);
            transOut.sendMessage(recStop);

          }

        }

        else if (paramsType === 'mute') {

          if (commandValues[0] === 'drums') {

            // THIS LINE IS HARDCODED FROM PARAMS.JS
            // IF PARAMS.JS LIST CHANGES, PLEASE CONSULT HERE

            for (let i = 0; i < 5; i++) {

              output.sendMessage([controlChange,muteNums[i][1],0]);

            }

          }

          else if (commandValues[0] === 'instruments') {

            // THIS LINE IS HARDCODED FROM PARAMS.JS
            // IF PARAMS.JS LIST CHANGES, PLEASE CONSULT HERE

            for (let i = 5; i < 9; i++) {

              output.sendMessage([controlChange,muteNums[i][1],0]);

            }

          }

          else {

            var targetIndex = muteNums.indexOf(muteNums.find(arr => arr.includes(commandValues[0])));
            output.sendMessage([controlChange,muteNums[targetIndex][1],0]);

          }
          
        }

        else if (paramsType === 'unmute') {

          if (commandValues[0] === 'drums') {

            // THIS LINE IS HARDCODED FROM PARAMS.JS
            // IF PARAMS.JS LIST CHANGES, PLEASE CONSULT HERE

            for (let i = 0; i < 5; i++) {

              output.sendMessage([controlChange,muteNums[i][1],127]);

            }

          }

          else if (commandValues[0] === 'instruments') {

            // THIS LINE IS HARDCODED FROM PARAMS.JS
            // IF PARAMS.JS LIST CHANGES, PLEASE CONSULT HERE
            
            for (let i = 5; i < 9; i++) {

              output.sendMessage([controlChange,muteNums[i][1],127]);

            }

          }

          else {

            var targetIndex = muteNums.indexOf(muteNums.find(arr => arr.includes(commandValues[0])));
            output.sendMessage([controlChange,muteNums[targetIndex][1],127]);

          }
          
        }

        else if (paramsType === 'knob') {
      
          if (commandName[1] === '?') {

            var requestedValue = null;
            var listOfKnobs = Object.entries(knobState);

            for (let i = 0; i < listOfKnobs.length; i++) {

              if (listOfKnobs[i][0] === params[paramsIndex][2].toString()) {

                requestedValue = Math.round((listOfKnobs[i][1].lastKnownValue / 127) * 100);
                break;

              }
            }
            client.say(target, `Current ${params[paramsIndex][0]} value: ${requestedValue}`);
          }
          else if (commandValues[0] === undefined) {
              client.say(target, 'Please specify a value 0-100');
            }
          else if (commandName === '#tempo' || commandName === '#bpm') {
            
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
                  console.log(currentTempo);
                  console.log(`* Executed ${commandName} command`);

                }
              }
              else {

                // The function is on cooldown, inform the user
                const remainingTime = tempoCooldownManager.cooldownTime - (Date.now() - tempoCooldownManager.lastExecutionTime);
                const secondsRemaining = Math.ceil(remainingTime / 1000);
                client.say(target, `Function is on cooldown. Remaining time: ${secondsRemaining} seconds`);

              }
            }

          else {

            /*
            const cooldownResult = await fxCooldownManager.executeFunctionAsync();

            if (cooldownResult) {
            */
              const knobValue = parseInt(commandValues[0], 10);
              const knobId = paramsNum; // Use paramsNum as a unique identifier for each knob

              // Initialize the last known value for the knob if it doesn't exist
              if (!knobState[knobId]) {
                knobState[knobId] = { lastKnownValue: 0, isTransitioning: false, transitionTime: 0 };
              }

              const scaledNum = Math.round((knobValue / 100) * 127);
              const transitionTime = commandValues[1] ? parseFloat(commandValues[1]) * 1000 : 0;
              // console.log(transitionTime);
              if (transitionTime > 30000) {
                client.say(target, 'Please choose a duration between 1-30 seconds');
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
              }
              
            }
            /*
             else {
              // The function is on cooldown, inform the user
              const remainingTime = fxCooldownManager.cooldownTime - (Date.now() - fxCooldownManager.lastExecutionTime);
              const secondsRemaining = Math.ceil(remainingTime / 1000);
              client.say(target, `Function is on cooldown. Remaining time: ${secondsRemaining} seconds`);
            }
            */
          }

        else if (paramsType === 'oneshot') {

          // Program change to correct channel
          // output.sendMessage([programChange,paramsNum]);
          output.sendMessage([noteOn+15,paramsNum,127]);
          output.sendMessage([noteOff+15,paramsNum,127]);
          console.log([noteOn+15,paramsNum,127]);
          
        }

        else if (paramsType === 'random') {

          // Program change to correct channel
          // output.sendMessage([programChange,paramsNum]);
          let rand = middleC + getRandomInt(9);
          output.sendMessage([noteOn,rand,127]);
          output.sendMessage([noteOff,rand,127]);
          
        }

        else if (paramsType === 'instrument') {

          var noteDuration = 1;

          if (commandValues.length > 0 && !isNaN(Number(commandValues.slice(-1)))) {

            noteDuration = Number(commandValues.slice(-1));
          }

          var noteNums = parseNotes(commandValues);

          if (noteNums == -1) {
            client.say(target, 'One or more invalid note format. Try "c5", "Eb6", etc.')
            console.log('One or more invalid note format: ' + commandValues);
          }

          else if (noteNums == -2) {

            client.say(target, 'One or more invalid octaves. Try 1-8');
            console.log('One or more invalid octaves: ' + commandValues);

          }

          else {
            if (noteNums.length == 0) {

              noteNums.push(middleC);

            }

            for (let i = 0; i < noteNums.length; i++) {

              output.sendMessage([noteOn+paramsNum,noteNums[i],127]);

            }

            await sleep(noteDuration * 1000);


            for (let i = 0; i < noteNums.length; i++) {

              output.sendMessage([noteOff+paramsNum,noteNums[i],127]);

            }
          }
        }
      }
    }
  }
}