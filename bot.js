/*

MIDIPHONIX
by Megaphonix

*/

// Imports
const opts = require('./credentials.js').opts;
const params = require('./params.js').params;
const muteNums = require('./params.js').mutes;
const drumGroup = params.slice(6,11);
const instGroup = params.slice(15,19);
const instrumentHandler = require('./instrumentHandler.js').instrumentHandler;
const knobHandler = require('./knobHandler.js').knobHandler;
const tempoHandler = require('./tempoHandler.js').tempoHandler;

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

          // If message is a query ('#?[command]'), retrieve knob value and post in chat
          if (commandName[1] === '?') {

            if (commandName === '#?tempo' || commandName === '#?bpm') {

                client.say(target, `Current tempo: ${currentTempo}`);
        
            }

            else {

                var requestedValue = null;
                var listOfKnobs = Object.entries(knobState);

                for (let i = 0; i < listOfKnobs.length; i++) {

                    if (listOfKnobs[i][0] === params[paramsIndex][2].toString()) {

                    requestedValue = Math.round((listOfKnobs[i][1].lastKnownValue / 127) * 100);

                    }

                }

                client.say(target, `Current ${params[paramsIndex][0]} value: ${requestedValue}`);

            }  

        }

        else {  

          if (commandName === '#tempo' || commandName === '#bpm') {

            var tempoHandlerReturn = await knobHandler(commandName, knobState, paramsNum, client, target,
              commandValues, context, output, currentTempo, tempoCooldownManager);

            if (tempoHandlerReturn != undefined) {

                currentTempo = tempoHandlerReturn;

              }
    
          }

          else {

            var knobHandlerReturn = await knobHandler(commandName, knobState, paramsNum, client, target,
              commandValues, context, output, currentTempo, tempoCooldownManager);

            if (knobHandlerReturn != undefined) {

              knobState[paramsNum] = knobHandlerReturn;

            }

          }

        }

      }

        else if (paramsType === 'oneshot') {

          output.sendMessage([noteOn+15,paramsNum,127]);
          output.sendMessage([noteOff+15,paramsNum,127]);
          console.log([noteOn+15,paramsNum,127]);
          
        }

        else if (paramsType === 'randomsound') {

          let rand = middleC + getRandomInt(9);
          output.sendMessage([noteOn,rand,127]);
          output.sendMessage([noteOff,rand,127]);
          
        }

        else if (paramsType === 'instrument') {

          instrumentHandler(commandValues, paramsNum, output, client, target);

        }
      }
    }
  }
}