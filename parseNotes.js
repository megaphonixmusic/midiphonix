const noteToMidi = require('./noteToMidi.js').noteToMidi;


// Generate a random MIDI note # between 36 (C3 in FL) and 96 (C8)
// This prevents gross super-low notes and shrill super-high notes
function getRandomNoteNum() {
  return Math.floor(Math.random() * 60) + 36;
}

exports.parseNotes = function(values) {

  var notesList = [];

  // If melodic command (piano, etc.) then set values accordingly
  //
  // Format: [command] [familiar note name] [...] [duration in seconds]
  //                           ^                    ^
  // Default values:      c4 (middleC)              1 
  //
  // Handles 0-16 values

  for (let i = 0; i < values.length; i++) {

    if (values[i] === 'random') {

      notesList.push(getRandomNoteNum());

    }

    else if (isNaN(values[i]) == false) {

      return notesList;

    }

    else {

      let noteToMidiReturn = noteToMidi(values[i]);

      if (noteToMidiReturn == -1) {

        // console.log('One or more invalid note format: ' + values[i]);
        return -1;

      }
      else if (noteToMidiReturn == -2) {

        // console.log('One or more invalid octaves: ' + values[i]);
        return -2;

      }
      else {

        notesList.push(noteToMidiReturn);
        // console.log(`* Note ${noteToMidiReturn} parsed`);

      }

    }

  }

  return notesList;
}