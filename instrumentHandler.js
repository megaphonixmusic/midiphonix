// Define commonly used MIDI codes
const middleC = 60;
const noteOn = 144;
const noteOff = 128;
const controlChange = 176;
const programChange = 192;
const parseNotes = require('./parseNotes.js').parseNotes;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

exports.instrumentHandler = async function(commandValues, paramsNum, output, client, target, isSeq, currentTempo) {
  
  

  
  if (isSeq) {

    var noteNums = parseNotes(commandValues.slice(1));

  }

  else {

    var noteNums = parseNotes(commandValues);

  }
  
  if (noteNums == -1) {

    client.say(target, 'One or more invalid note format. Try "c5", "Eb6", etc.')
    console.log(`One or more invalid note format: ${commandValues}`);

  }

  else if (noteNums == -2) {

    client.say(target, 'One or more invalid octaves. Try 1-8');
    console.log(`One or more invalid octaves: ${commandValues}`);

  }
  
  else {

    var noteDuration = 1;

    if (commandValues.length > 0 && !isNaN(Number(commandValues.slice(-1)))) {

      noteDuration = Number(commandValues.slice(-1));

    }

    if (isSeq) {

      var noteLength = (1 / (currentTempo * 2)) * 60000;

      for (let i = 0; i < noteNums.length; i++) {

        output.sendMessage([noteOn+paramsNum,noteNums[i],127]);
        await sleep(noteLength);
        output.sendMessage([noteOff+paramsNum,noteNums[i],127]);

      }

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
};