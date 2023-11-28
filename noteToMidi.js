/*

noteToMidi
This function converts 'familiar' note name strings
(c4, d#6, etc.) to a MIDI note number

Supports 2- and 3-char strings
IGNORES anything not in these formats

*/

// Define familiar note names
const noteNamesSharp = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const noteNamesFlat = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];

exports.noteToMidi = function(name) {

  let finalNum = 0;
  let octave = 0;
  let letter = undefined;

  if (name.length == 1 && (noteNamesSharp.includes(name))) {

    octave = 5;
    letter = noteNamesSharp.indexOf(name);

  }

  // Parse 2-char format
  else if (name.length == 2) {
    
    if (!isNaN(name[1])) {

      letter = name[0];

      // Check if note letter is valid
      if (noteNamesSharp.includes(letter)) {

      // Set 'letter' to index value from notes array
        letter = noteNamesSharp.indexOf(letter);
      }

      // If note letter is invalid (h, x, etc.), return -1
      else {
        return -1;
      }

      // Turn number into octave
      octave = name[1];
      
      // If octave out of bounds, return -2
      if (octave > 8) {
        return -2;
      }

    }

    else {

      octave = 5;

      // Check if it's sharp (#) or flat (b)
      if (noteNamesSharp.includes(name)) {
        letter = noteNamesSharp.indexOf(name);
      }
      else if (noteNamesFlat.includes(name)) {
        letter = noteNamesFlat.indexOf(name);
      }

    }

  }

  // Parse 3-char format
  else if (name.length == 3 && isNaN(name[2]) == false) {
    
    letter = name.substring(0,2).toLowerCase();

    // Check if it's sharp (#) or flat (b)
    if (noteNamesSharp.includes(letter)) {
      letter = noteNamesSharp.indexOf(letter);
    }
    else if (noteNamesFlat.includes(letter)) {
      letter = noteNamesFlat.indexOf(letter);
    }

    else {
      return -1;
    }

    octave = name[2];

    if (octave > 8) {
      return -2;
    }

  }

  else {
    return -1;
  }

  // Calculate and return finalNum
  finalNum = letter + (12 * octave) + 12;
  return finalNum;

};