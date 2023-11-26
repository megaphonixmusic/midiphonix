/*

MIDIPHONIX
by Megaphonix

*/

// Imports
const opts = require('./credentials.js').opts;
const params = require('./params.js').params;
const muteNums = require('./params.js').mutes;
const perfMode = require('./perfMode.js').perfMode;
const drumMuteNums = [];
const instMuteNums = [];
const instrumentHandler = require('./instrumentHandler.js').instrumentHandler;
const knobHandler = require('./knobHandler.js').knobHandler;
const tempoHandler = require('./tempoHandler.js').tempoHandler;

const tmi = require('tmi.js');
const midi = require('midi');

// Collect and sort channels into mute groups by flag (from params.js)
for (let i = 0; i < params.length; i++) {
  var muteGroupFlag = params[i][4];
  if (muteGroupFlag != undefined) {
    var muteNum = params[i][3];
    if (muteGroupFlag === 'drums') {
      drumMuteNums.push(muteNum);
    }
    else if (muteGroupFlag === 'instruments') {
      instMuteNums.push(muteNum);
    }
  }
}

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

// Initialize Performance Mode
var isPerfModeEnabled = false;

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

// Get valid names list from params.js
var validNames = [];
for (let i = 0; i < params.length; i++) {
  validNames.push(params[i][0]);
}
validNames = validNames.flat();
console.log(validNames);



// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {

  if (self) { return; } // Ignore messages from the bot

  const contents = msg.toLowerCase().split(' ');

  // ONLY PROCEED IF MESSAGE STARTS WITH A #COMMAND, otherwise do nothing
  if (contents[0].startsWith('#')) {

    // First word of the message should ALWAYS be the presumed command name
    // Remove # character for easier reference
    const commandName = contents[0].slice(1);

    // Parse all non-command params and init array of note(s)
    var commandValues = contents.slice(1);

    // If command is not found in validNames, throw error + chat msg
    if (!validNames.includes(commandName)) {
      client.say(target, `Unknown command ${commandName}`);
      console.log(`* Unknown command ${commandName}`);
    }

    // Otherwise, proceed:
    else {

      var isSeq = false;

      // Find corresponding command entry in params.js
      var paramsIndex = params.indexOf(params.find(arr => arr.flat().includes(commandName)));
      
      // Help command
      if (commandName === 'help') {
        client.say(target, 'Available MIDI commands can be found here: https://mgphx.me/MIDIphonix')
        console.log(`* Executed ${commandName} command`);
      }

      var isBroadcaster = false;

      if (context.badges != null) {

        if (context.badges.broadcaster == 1) {

          isBroadcaster = true;

        }

        else {

          isBroadcaster = false;

        }

      }

      // If broadcaster switches to Performance Mode, change commands accordingly
      if (isBroadcaster && commandName === 'perfmode') {

        if (commandValues[0] === 'on') {

          isPerfModeEnabled = true;

        }

        else if (commandValues[0] === 'off') {

          isPerfModeEnabled = false;

        }

        console.log(`* isPerfModeEnabled: ${isPerfModeEnabled}`)

      }

      else {

        var paramsType = params[paramsIndex][1];
        var paramsNum = params[paramsIndex][2];

        if (isBroadcaster && (paramsType === 'play' || paramsType === 'pause')) {

          output.sendMessage([paramsNum]);

        }

        else if (isBroadcaster && paramsType === 'record') {

          var recDuration = 5;
          
          if (context.badges.broadcaster != 1 || context.badges == null) {

            if (commandValues[0] > 30 || commandValues[0] < 5) {

              client.say(target, 'Record length limited to 5-30 seconds');

            }

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

            for (let i = 0; i < drumMuteNums.length; i++) {

              output.sendMessage([controlChange,drumMuteNums[i],0]);

            }

          }

          else if (commandValues[0] === 'instruments') {

            for (let i = 0; i < instMuteNums.length; i++) {

              output.sendMessage([controlChange,instMuteNums[i],0]);

            }

          }

          else {

            // Find corresponding CHANNEL entry in params.js
            var channelIndex = params.indexOf(params.find(arr => arr.includes(commandValues[0])));
            output.sendMessage([controlChange,params[channelIndex][3],0]);

          }
          
        }

        else if (paramsType === 'unmute') {

          if (commandValues[0] === 'drums') {

            for (let i = 0; i < drumMuteNums.length; i++) {

              output.sendMessage([controlChange,drumMuteNums[i],127]);

            }

          }

          else if (commandValues[0] === 'instruments') {

            for (let i = 0; i < instMuteNums.length; i++) {

              output.sendMessage([controlChange,instMuteNums[i],127]);

            }

          }

          else {

            // Find corresponding CHANNEL entry in params.js
            var channelIndex = params.indexOf(params.find(arr => arr.includes(commandValues[0])));
            output.sendMessage([controlChange,params[channelIndex][3],127]);

          }
          
        }

        else if (paramsType === 'knob') {

          // If message is a query ('#?[command]'), retrieve knob value and post in chat
          if (commandName[0] === '?') {

            if (commandName === '?tempo' || commandName === '?bpm') {

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

          if (commandName === 'tempo' || commandName === 'bpm') {

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

      else if (paramsType === 'randomsound') {

        let rand = middleC + getRandomInt(9);
        output.sendMessage([noteOn,rand,127]);
        output.sendMessage([noteOff,rand,127]);
        
      }

        else if (paramsType === 'oneshot') {

          if (isPerfModeEnabled) {

            var perfModeReturn = perfMode(commandName, commandValues, client, target);
            
            if (perfModeReturn != undefined) {

              output.sendMessage([noteOn+14,perfModeReturn,127]);
              output.sendMessage([noteOff+14,perfModeReturn,127]);

            }
          
          }

          else {

            output.sendMessage([noteOn+15,paramsNum,127]);
            output.sendMessage([noteOff+15,paramsNum,127]);

          }

        }

        else if (paramsType === 'instrument') {

          if (isPerfModeEnabled) {

            var perfModeReturn = perfMode(commandName, commandValues, client, target);
            
            if (perfModeReturn != undefined) {

              output.sendMessage([noteOn+14,perfModeReturn,127]);
              output.sendMessage([noteOff+14,perfModeReturn,127]);

            }
          
          }

          else {

            instrumentHandler(commandValues, paramsNum, output, client, target, isSeq, currentTempo);

          }

        }

        else if (paramsType === 'seq') {

          if (isPerfModeEnabled) {

            client.say(target, 'Command unavailable - performance mode enabled')

          }

          else {

            var isSeq = true;

            if (!validNames.includes(commandValues[0]) || commandValues.length < 2) {
              
              client.say(target, `Invalid format. Try: #seq [instrumentname] [notes ...]`)
              console.log(`* Invalid instrument name: ${commandValues[0]}`)

            }

            else {

              paramsIndex = params.indexOf(params.find(arr => arr.includes(commandValues[0])));
              paramsNum = params[paramsIndex][2];

              instrumentHandler(commandValues, paramsNum, output, client, target, isSeq, currentTempo);

            }
          }
        }
      }
    }
  }
};