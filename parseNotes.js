const noteToMidi = require('./noteToMidi.js').noteToMidi;

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
    if (isNaN(values[i]) == false) {
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