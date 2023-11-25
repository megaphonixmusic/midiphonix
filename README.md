<p align="center"><img src="https://imgur.com/Hsjadq7.gif" title="megaphJam emote by @wannabe_mailman" width="10%"></img></p>

# <p align="center">MIDIphonix</p>
## <p align="center">Control FL Studio with Twitch chat commands</p>

MIDIphonix is a locally-run bot that listens for Twitch chat commands and translates them into real-time, local MIDI messages for controlling FL Studio. It requires a specific FL project file (.flp) set up with MIDI routing to match the codebase (coming soon).

See *[Available commands](#Available-commands)* below and try it out on https://twitch.tv/megaphonix (when I’m live)

## Credits/Prerequisites
* [Node.js](https://nodejs.org/)
* [tmi.js](https://www.npmjs.com/package/tmi.js) for Twitch integration
* [node-midi](https://www.npmjs.com/package/midi) for MIDI integration

## Installation
1. Install [Node.js](https://nodejs.org/) followed by prerequisites above
2. Extract MIDIphonix source code to a folder of your choice
3. Rename `credentials.js.example` file to `credentials.js`
4. Replace values in `credentials.js` with your own preferences, following the [Twitch Developers guide](https://dev.twitch.tv/docs/irc/get-started/#specify-the-configuration-settings) (this will also guide you through setting up the bot account and OAuth token)
5. Open Command Prompt (Windows) and navigate to the `midiphonix` folder path (`cd [path]`)
6. Type `node bot.js` and hit Enter. The bot should start running in the Command Prompt; use Ctrl-C to exit the bot process.
    * ***THIS IS WHERE THE LOCAL PROCESS RESIDES - CLOSING THIS WINDOW SHUTS DOWN THE BOT***

## FYI

* ***MIDIphonix is a work-in-progress, so it may be buggy and is not fully feature-complete. See [To-do](#To-do) for list of features currently in the works.***
* Broadcaster should enable "Low Latency" mode for optimal responsiveness.
  * Navigate to [Creator Dashboard](https://dashboard.twitch.tv/) -> Settings (on lefthand menu) -> Stream -> Latency mode: **Low latency** ([screenshot](https://imgur.com/9rh6cwZ.jpg))
* Viewers should also enable "Low Latency" for optimal responsiveness. Viewers have reported message-to-action latency as low as ~4 seconds - probably best suited for long-form, ambient compositions.
  * On the live video player, click the gear icon -> Advanced -> Low Latency (ON) ([screenshot](https://imgur.com/rsz3uNL.jpg))
* Spamming commands works best in a third-party chat client like [Chatterino](https://chatterino.com/). Simply type your message and hold down Ctrl+Enter (Windows) / Cmd+Enter (macOS) to send rapid-fire. Command spam is encouraged!

## Available commands
(Also available at https://mgphx.me/MIDIphonix)

### Drums
* **#kick**
  * Triggers the kick
* **#snare**
  * Triggers the snare
* **#hihat**
  * Triggers the hihat
* **#tom**
  * Triggers the tom
* **#crash**
  * Triggers the crash cymbal

### Instruments

* **#piano** [note] [...] [duration]
  * Plays specified note(s) on the piano for a specified duration (in seconds)
  * Options not required, default is C4 (middle C) for 1 second
  * Notes can be in familiar name (c5, D#4, A6, etc.) **OR** simply type “random” for a surprise
    * Chords are supported - just type each note with a space:
      * #piano c4 e4 g4 random 5
      * This plays C, E, G, [randomnote] chord for 5 seconds
* **#bass** [note] [duration]
  * Plays a note on the bass synth, as above
* **#pad** [note] [duration]
  * Plays a note on the pad synth, as above
* **#lead** [note] [duration]
  * Plays a note on the lead synth, as above

### FX
* **#cutoff** [freq] [transition time]
  * Sets the Master channel low-pass filter cutoff frequency
  * Freq range: 0-100% (lower # = more filter, higher # = less filter)
  * Transition time range: 1-30 seconds
  * Examples:
    * #cutoff 40 3
      * Adjusts the cutoff amount to 40% over 3 seconds
    * #cutoff 30
      * Sets cutoff amount to 30% immediately
* **#reverb** [amount] [transition time]
  * Sets the Master channel reverb amount
  * Same as above examples
* **#delay** [amount] [transition time]
  * Sets the Master channel delay amount
  * Same as above examples
  * #phaser [amount] [transition time]
  * Sets the Master channel phaser amount
  * Same as above examples
* **#?[command]**
  * Lists current command value in chat
  * Example:
    * #?cutoff -> “Current #cutoff value: 100”
    * #?tempo -> “Current tempo: 120”
* ~~#rise (coming soon)~~
  * ~~Triggers a 4-bar rise with the Endless Smile plugin on the Master channel~~

### Oneshots
* **#downsweep**
  * Plays a downsweep
* **#randomsample**
  * Plays a random sample
* **#damnson**
  * …just try it
* **#hookedonphonix**
  * (lmao)

### Other
* **#tempo** [value] / **#bpm** [value]
  * Set the tempo to a certain BPM (beats per minute)
  * Cooldown: 20 seconds (to let people feel a vibe for a bit…)
* **#key** [value]
  * Changes the project key by [value] semitones
  * Range is -12 to +12
  * For original key/pitch: #key 0
* **#mute** [channel] / drums / instruments
  * Mutes a specific channel (kick, piano, etc.) OR responds to ‘drum’ and ‘instrument’ groups
  * Examples:
    * #mute kick
    * #mute instruments
* **#unmute** [channel] / drums / instruments
  * Does the opposite as above
* **#help** <- (you are here)
  * Posts a link to this documentation in chat for easy reference 🙂


## To-do
* Playing infinite notes (on/off messages)
* “Performance Mode” functionality
  * #buildup - Endless Smile trigger 4-bar
  * This will be tricky, since drum commands are currently tied to Note#s, which are nullified when Performance mode is active (since it uses Note#s for Playlist "pads")...
* Drum loop messages
  * #kick1
  * #snare1
  * Etc.
* Link to Performance Mode loops
* Sequencing messages
  * #seq [instrument] [notes]
* Replace samples
  * i.e. #snare A, #snare B, etc.
* Change key
  * #key - Transposes tonal instruments to a given key
  * #?key - Retrieves current key
* Random note
  * #piano random
    * parseNotes - if (‘random’), pick random note - no need to call notesToMidi
